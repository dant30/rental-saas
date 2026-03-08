"""Signals for billing side effects."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.notifications.services import dispatch_notification
from apps.payments.models import Invoice, Payment


@receiver(post_save, sender=Invoice)
def notify_invoice_created(sender, instance, created, **kwargs):
    if not created:
        return
    dispatch_notification(
        recipient=instance.resident.user,
        notification_type="payment",
        subject=f"New invoice {instance.invoice_number}",
        content=(
            f"Your invoice {instance.invoice_number} is ready. "
            f"Amount due: {instance.balance_due} by {instance.due_date}."
        ),
        channels=["in_app", "email", "sms"],
    )


@receiver(post_save, sender=Payment)
def notify_payment_status(sender, instance, created, **kwargs):
    if not created:
        return
    dispatch_notification(
        recipient=instance.resident.user,
        notification_type="payment",
        subject=f"Payment {instance.reference or instance.pk}",
        content=(
            f"We recorded a payment of {instance.amount}. "
            f"Current status: {instance.status}."
        ),
        channels=["in_app", "email", "sms"],
    )
