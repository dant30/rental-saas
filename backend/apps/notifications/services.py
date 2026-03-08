"""Service helpers for notifications and messaging."""

import base64
from string import Template
from urllib import error, parse, request as urllib_request

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import QuerySet
from django.utils import timezone

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.notifications.models import (
    Announcement,
    Conversation,
    Message,
    Notification,
    NotificationPreference,
    NotificationTemplate,
)


def get_template_queryset_for_user(user):
    return NotificationTemplate.objects.filter(tenant_id=user.tenant_id)


def get_preference_queryset_for_user(user):
    return NotificationPreference.objects.filter(user=user).select_related("user")


def get_notification_queryset_for_user(user):
    return Notification.objects.filter(recipient=user).select_related("template", "recipient")


def get_announcement_queryset_for_user(user):
    return Announcement.objects.filter(tenant_id=user.tenant_id).select_related("created_by")


def get_conversation_queryset_for_user(user):
    return (
        Conversation.objects.filter(participants=user)
        .prefetch_related("participants", "messages", "messages__sender")
        .distinct()
    )


def get_message_queryset_for_user(user):
    return Message.objects.filter(conversation__participants=user).select_related(
        "conversation",
        "sender",
    )


def save_template_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_preference_for_user(serializer, user):
    return serializer.save(user=user, tenant=user.tenant)


def save_notification_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_announcement_for_user(serializer, user):
    return serializer.save(created_by=user, tenant=user.tenant)


def save_conversation_for_user(serializer, user):
    conversation = serializer.save(tenant=user.tenant)
    conversation.participants.add(user)
    return conversation


def save_message_for_user(serializer, user):
    message = serializer.save(sender=user)
    message.conversation.last_message_at = timezone.now()
    message.conversation.save(update_fields=["last_message_at"])
    emit_conversation_message(message)
    return message


def render_notification_template(template: NotificationTemplate, context: dict | None = None):
    context = context or {}
    subject = Template(template.subject_template or "").safe_substitute(context)
    body = Template(template.body_template or "").safe_substitute(context)
    return subject, body


def create_notification(
    *,
    recipient,
    notification_type: str,
    content: str,
    channel: str = Notification.Channel.IN_APP,
    subject: str = "",
    template: NotificationTemplate | None = None,
    context: dict | None = None,
):
    payload = context or {}
    if template is not None:
        subject, content = render_notification_template(template, payload)

    notification = Notification.objects.create(
        tenant=recipient.tenant,
        recipient=recipient,
        template=template,
        notification_type=notification_type,
        channel=channel,
        subject=subject,
        content=content,
        context=payload,
        sent_at=timezone.now(),
    )
    emit_user_notification(notification)
    return notification


def _channel_send(*, group_name: str, event: dict):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(group_name, event)


def _serialize_notification_event(notification: Notification):
    return {
        "id": notification.pk,
        "notification_type": notification.notification_type,
        "channel": notification.channel,
        "subject": notification.subject,
        "content": notification.content,
        "context": notification.context,
        "is_read": notification.is_read,
        "sent_at": notification.sent_at.isoformat() if notification.sent_at else None,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


def _serialize_message_event(message: Message):
    return {
        "id": message.pk,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "sender_name": message.sender.display_name,
        "body": message.body,
        "is_system_generated": message.is_system_generated,
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }


def emit_user_notification(notification: Notification):
    if notification.recipient_id is None or notification.tenant_id is None:
        return
    _channel_send(
        group_name=f"user_{notification.tenant_id}_{notification.recipient_id}",
        event={
            "type": "notify.user",
            "payload": _serialize_notification_event(notification),
        },
    )


def emit_conversation_message(message: Message):
    if message.conversation_id is None:
        return
    _channel_send(
        group_name=f"conversation_{message.conversation.tenant_id}_{message.conversation_id}",
        event={
            "type": "conversation.message",
            "payload": _serialize_message_event(message),
        },
    )


def get_notification_recipients_for_tenant(tenant) -> QuerySet:
    from apps.accounts.models import User

    return User.objects.filter(tenant=tenant, is_active=True)


def _notification_allowed(preference, channel: str) -> bool:
    if channel == Notification.Channel.EMAIL:
        return preference is None or preference.email_enabled
    if channel == Notification.Channel.SMS:
        return preference is None or preference.sms_enabled
    if channel == Notification.Channel.WHATSAPP:
        return preference is None or preference.whatsapp_enabled
    return preference is None or preference.in_app_enabled


def deliver_email_notification(*, recipient, subject: str, content: str):
    send_mail(
        subject=subject or "Rental SaaS Notification",
        message=content,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@rentalsaas.local"),
        recipient_list=[recipient.email],
        fail_silently=False,
    )


def deliver_sms_notification(*, recipient, content: str):
    provider = getattr(settings, "SMS_PROVIDER", "console")
    phone_number = getattr(recipient, "phone_number", "") or ""
    if not phone_number:
        raise ValueError("Recipient has no phone number for SMS delivery.")

    if provider == "console":
        return
    if provider != "twilio":
        raise ValueError(f"Unsupported SMS provider '{provider}'.")

    sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_FROM_NUMBER", "")
    if not sid or not token or not from_number:
        raise ValueError("Twilio credentials are not fully configured.")

    body = parse.urlencode(
        {
            "To": phone_number,
            "From": from_number,
            "Body": content,
        }
    ).encode("utf-8")
    req = urllib_request.Request(
        url=f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.tson",
        data=body,
    )
    credentials = base64.b64encode(f"{sid}:{token}".encode("utf-8")).decode("ascii")
    req.add_header("Authorization", f"Basic {credentials}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib_request.urlopen(req, timeout=15):
        return


def deliver_whatsapp_notification(*, recipient, content: str):
    provider = getattr(settings, "WHATSAPP_PROVIDER", "console")
    phone_number = getattr(recipient, "phone_number", "") or ""
    if not phone_number:
        raise ValueError("Recipient has no phone number for WhatsApp delivery.")

    if provider == "console":
        return
    if provider != "twilio":
        raise ValueError(f"Unsupported WhatsApp provider '{provider}'.")

    sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_WHATSAPP_FROM", "")
    if not sid or not token or not from_number:
        raise ValueError("Twilio WhatsApp credentials are not fully configured.")

    normalized_to = phone_number if phone_number.startswith("whatsapp:") else f"whatsapp:{phone_number}"
    normalized_from = from_number if from_number.startswith("whatsapp:") else f"whatsapp:{from_number}"
    body = parse.urlencode(
        {
            "To": normalized_to,
            "From": normalized_from,
            "Body": content,
        }
    ).encode("utf-8")
    req = urllib_request.Request(
        url=f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.tson",
        data=body,
    )
    credentials = base64.b64encode(f"{sid}:{token}".encode("utf-8")).decode("ascii")
    req.add_header("Authorization", f"Basic {credentials}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib_request.urlopen(req, timeout=15):
        return


def dispatch_notification(
    *,
    recipient,
    notification_type: str,
    content: str,
    subject: str = "",
    template: NotificationTemplate | None = None,
    context: dict | None = None,
    channels: list[str] | None = None,
):
    preference = NotificationPreference.objects.filter(user=recipient).first()
    channels = channels or [Notification.Channel.IN_APP]
    delivered = []

    for channel in channels:
        if not _notification_allowed(preference, channel):
            continue

        notification = create_notification(
            recipient=recipient,
            notification_type=notification_type,
            content=content,
            subject=subject,
            template=template,
            context=context,
            channel=channel,
        )
        try:
            if channel == Notification.Channel.EMAIL:
                deliver_email_notification(
                    recipient=recipient,
                    subject=notification.subject,
                    content=notification.content,
                )
            elif channel == Notification.Channel.SMS:
                deliver_sms_notification(recipient=recipient, content=notification.content)
            elif channel == Notification.Channel.WHATSAPP:
                deliver_whatsapp_notification(recipient=recipient, content=notification.content)
            notification.sent_at = timezone.now()
            notification.failed_at = None
            notification.error_message = ""
            notification.save(update_fields=["sent_at", "failed_at", "error_message", "updated_at"])
        except (ValueError, error.URLError, Exception) as exc:
            notification.failed_at = timezone.now()
            notification.error_message = str(exc)
            notification.save(update_fields=["failed_at", "error_message", "updated_at"])
        delivered.append(notification)

    return delivered


def broadcast_announcement(announcement: Announcement):
    channels = [Notification.Channel.IN_APP]
    if announcement.send_email:
        channels.append(Notification.Channel.EMAIL)
    if announcement.send_sms:
        channels.append(Notification.Channel.SMS)
    if getattr(announcement, "send_whatsapp", False):
        channels.append(Notification.Channel.WHATSAPP)

    notifications = []
    for recipient in get_notification_recipients_for_tenant(announcement.tenant):
        notifications.extend(
            dispatch_notification(
                recipient=recipient,
                notification_type=Notification.NotificationType.ANNOUNCEMENT,
                subject=announcement.title,
                content=announcement.message,
                channels=channels,
                context={"announcement_id": announcement.pk},
            )
        )
    return notifications
