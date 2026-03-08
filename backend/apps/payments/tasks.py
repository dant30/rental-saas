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
from apps.payments.services import (
    generate_monthly_invoices,
    retry_due_gateway_transactions,
    scan_expense_receipt,
    sync_invoice_statuses,
)


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


@shared_task
def scan_expense_receipt_task(*, expense_id, provider=None):
    from apps.payments.models import Expense

    expense = Expense.objects.get(pk=expense_id)
    scan_expense_receipt(expense=expense, provider=provider)
    return expense.pk


@shared_task
def retry_gateway_transactions_task():
    retried = retry_due_gateway_transactions(now=timezone.now())
    return [transaction.pk for transaction in retried]
