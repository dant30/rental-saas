"""Async notification helpers."""

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(func=None, **_kwargs):
        if func is None:
            return lambda f: f
        return func

from apps.notifications.services import broadcast_announcement, dispatch_notification


@shared_task
def send_in_app_notification_task(*, recipient_id, notification_type, content, subject=""):
    from apps.accounts.models import User

    recipient = User.objects.get(pk=recipient_id)
    notifications = dispatch_notification(
        recipient=recipient,
        notification_type=notification_type,
        content=content,
        subject=subject,
        channels=["in_app"],
    )
    return [notification.pk for notification in notifications]


@shared_task
def send_notification_task(*, recipient_id, notification_type, content, subject="", channels=None):
    from apps.accounts.models import User

    recipient = User.objects.get(pk=recipient_id)
    notifications = dispatch_notification(
        recipient=recipient,
        notification_type=notification_type,
        content=content,
        subject=subject,
        channels=channels or ["in_app"],
    )
    return [notification.pk for notification in notifications]


@shared_task
def broadcast_announcement_task(*, announcement_id):
    from apps.notifications.models import Announcement

    announcement = Announcement.objects.get(pk=announcement_id)
    notifications = broadcast_announcement(announcement)
    return [notification.pk for notification in notifications]
