"""Async billing tasks."""

from django.utils import timezone

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(func=None, **_kwargs):
        if func is None:
            return lambda f: f
        return func

from apps.notifications.services import dispatch_notification
from apps.payments.services import generate_monthly_invoices, sync_invoice_statuses


@shared_task
def generate_monthly_invoices_task():
    created = generate_monthly_invoices(billing_date=timezone.localdate())
    for invoice in created:
        dispatch_notification(
            recipient=invoice.resident.user,
            notification_type="payment",
            subject=f"Invoice {invoice.invoice_number}",
            content=(
                f"A new rent invoice for {invoice.billing_period_start:%B %Y} "
                f"has been generated. Balance due: {invoice.balance_due}."
            ),
            channels=["in_app", "email", "sms"],
        )
    return len(created)


@shared_task
def sync_overdue_invoices_task():
    return sync_invoice_statuses(today=timezone.localdate())
