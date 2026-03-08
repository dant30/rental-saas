"""Service helpers for notifications and messaging."""

from django.utils import timezone

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
    return message
