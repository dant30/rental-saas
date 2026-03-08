"""Service helpers for payments and billing."""

from decimal import Decimal

from django.db.models import Sum

from apps.payments.models import Arrear, Expense, Invoice, Payment


def get_invoice_queryset_for_user(user):
    return Invoice.objects.filter(tenant_id=user.tenant_id).select_related(
        "lease",
        "resident",
        "property",
        "unit",
    )


def get_payment_queryset_for_user(user):
    return Payment.objects.filter(tenant_id=user.tenant_id).select_related(
        "lease",
        "resident",
        "invoice",
        "property",
        "unit",
        "received_by",
    )


def get_arrear_queryset_for_user(user):
    return Arrear.objects.filter(tenant_id=user.tenant_id).select_related(
        "lease",
        "resident",
        "invoice",
    )


def get_expense_queryset_for_user(user):
    return Expense.objects.filter(tenant_id=user.tenant_id).select_related(
        "property",
        "unit",
        "submitted_by",
        "approved_by",
    )


def save_invoice_for_user(serializer, user):
    invoice = serializer.save()
    invoice.tenant = user.tenant
    invoice.save(update_fields=["tenant", "resident", "property", "unit", "balance_due", "updated_at"])
    return invoice


def save_payment_for_user(serializer, user):
    payment = serializer.save(received_by=user)
    if payment.invoice_id:
        invoice = payment.invoice
        paid_total = (
            Payment.objects.filter(
                invoice_id=invoice.pk,
                status__in=[
                    Payment.PaymentStatus.PROCESSING,
                    Payment.PaymentStatus.SUCCEEDED,
                ],
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )
        invoice.balance_due = max(Decimal("0.00"), invoice.total_amount - paid_total)
        if invoice.balance_due == Decimal("0.00"):
            invoice.status = Invoice.InvoiceStatus.PAID
        elif paid_total > Decimal("0.00"):
            invoice.status = Invoice.InvoiceStatus.PARTIALLY_PAID
        else:
            invoice.status = Invoice.InvoiceStatus.OPEN
        invoice.save(update_fields=["balance_due", "status", "updated_at"])
    return payment


def save_arrear_for_user(serializer, user):
    arrear = serializer.save()
    arrear.tenant = user.tenant
    arrear.save(update_fields=["tenant", "resident", "outstanding_amount", "status", "updated_at"])
    return arrear


def save_expense_for_user(serializer, user):
    return serializer.save(tenant=user.tenant, submitted_by=user)
