"""Service helpers for payments, billing, and financial reporting."""

import base64
import json
from calendar import monthrange
from decimal import Decimal
from urllib import error, parse, request as urllib_request

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Sum
from django.utils import timezone

from apps.payments.models import Arrear, Expense, Invoice, Payment, PaymentGatewayTransaction
from apps.tenants_app.models import Lease


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


def get_gateway_transaction_queryset_for_user(user):
    return PaymentGatewayTransaction.objects.filter(tenant_id=user.tenant_id).select_related(
        "payment",
        "lease",
        "resident",
        "invoice",
        "property",
        "unit",
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
    apply_payment_to_invoice(payment)
    return payment


def save_arrear_for_user(serializer, user):
    arrear = serializer.save()
    arrear.tenant = user.tenant
    arrear.save(update_fields=["tenant", "resident", "outstanding_amount", "status", "updated_at"])
    return arrear


def save_expense_for_user(serializer, user):
    return serializer.save(tenant=user.tenant, submitted_by=user)


def build_invoice_number(*, tenant_id: int, billing_date, lease_id: int) -> str:
    return f"INV-{tenant_id}-{billing_date:%Y%m}-{lease_id}"


def build_payment_reference(*, lease_id: int, payment_date=None, prefix: str = "PAY") -> str:
    payment_date = payment_date or timezone.localdate()
    return f"{prefix}-{payment_date:%Y%m%d}-{lease_id}-{timezone.now():%H%M%S}"


def build_account_reference(*, lease, invoice=None):
    if invoice is not None:
        return invoice.invoice_number
    return lease.lease_number or f"LEASE-{lease.pk}"


def apply_payment_to_invoice(payment: Payment):
    if not payment.invoice_id:
        return payment

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


def _validate_gateway_lease_access(*, lease, user):
    if lease.unit.tenant_id != user.tenant_id:
        raise ValidationError("Lease does not belong to the current tenant.")


def _validate_gateway_invoice_access(*, invoice, tenant_id):
    if invoice is not None and invoice.tenant_id != tenant_id:
        raise ValidationError("Invoice does not belong to the current tenant.")


def _mpesa_base_url():
    environment = getattr(settings, "MPESA_ENVIRONMENT", "sandbox")
    if environment == "production":
        return "https://api.safaricom.co.ke"
    return "https://sandbox.safaricom.co.ke"


def _mpesa_timestamp():
    return timezone.now().strftime("%Y%m%d%H%M%S")


def _mpesa_access_token():
    consumer_key = getattr(settings, "MPESA_CONSUMER_KEY", "")
    consumer_secret = getattr(settings, "MPESA_CONSUMER_SECRET", "")
    if not consumer_key or not consumer_secret:
        raise ValidationError("MPesa credentials are not fully configured.")

    credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode("utf-8")).decode("ascii")
    req = urllib_request.Request(
        f"{_mpesa_base_url()}/oauth/v1/generate?grant_type=client_credentials"
    )
    req.add_header("Authorization", f"Basic {credentials}")
    with urllib_request.urlopen(req, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))
    token = payload.get("access_token")
    if not token:
        raise ValidationError("Unable to obtain MPesa access token.")
    return token


def _mpesa_password(timestamp: str):
    shortcode = getattr(settings, "MPESA_SHORTCODE", "")
    passkey = getattr(settings, "MPESA_PASSKEY", "")
    if not shortcode or not passkey:
        raise ValidationError("MPesa shortcode/passkey are not fully configured.")
    raw = f"{shortcode}{passkey}{timestamp}".encode("utf-8")
    return base64.b64encode(raw).decode("ascii")


def _create_gateway_transaction(
    *,
    gateway,
    transaction_type,
    lease,
    invoice,
    amount,
    external_reference,
    phone_number="",
    account_reference="",
    status=PaymentGatewayTransaction.Status.INITIATED,
    request_payload=None,
    bank_name="",
    bank_account_name="",
    bank_account_number="",
):
    return PaymentGatewayTransaction.objects.create(
        tenant_id=lease.unit.tenant_id,
        lease=lease,
        resident=lease.resident,
        invoice=invoice,
        property=lease.unit.property,
        unit=lease.unit,
        gateway=gateway,
        transaction_type=transaction_type,
        status=status,
        amount=amount,
        phone_number=phone_number,
        account_reference=account_reference,
        external_reference=external_reference,
        request_payload=request_payload or {},
        bank_name=bank_name,
        bank_account_name=bank_account_name,
        bank_account_number=bank_account_number,
    )


def initiate_mpesa_stk_push(*, user, lease, amount, phone_number, invoice=None, account_reference="", description=""):
    _validate_gateway_lease_access(lease=lease, user=user)
    _validate_gateway_invoice_access(invoice=invoice, tenant_id=user.tenant_id)

    account_reference = account_reference or build_account_reference(lease=lease, invoice=invoice)
    description = description or f"Rent payment for {account_reference}"
    external_reference = build_payment_reference(lease_id=lease.pk, prefix="MPESA")
    transaction = _create_gateway_transaction(
        gateway=PaymentGatewayTransaction.Gateway.MPESA,
        transaction_type=PaymentGatewayTransaction.TransactionType.STK_PUSH,
        lease=lease,
        invoice=invoice,
        amount=amount,
        phone_number=phone_number,
        account_reference=account_reference,
        external_reference=external_reference,
        status=PaymentGatewayTransaction.Status.PENDING,
    )

    provider = getattr(settings, "MPESA_PROVIDER", "mock")
    payload = {
        "BusinessShortCode": getattr(settings, "MPESA_SHORTCODE", ""),
        "Password": "",
        "Timestamp": "",
        "TransactionType": getattr(settings, "MPESA_TRANSACTION_TYPE", "CustomerPayBillOnline"),
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": getattr(settings, "MPESA_SHORTCODE", ""),
        "PhoneNumber": phone_number,
        "CallBackURL": getattr(settings, "MPESA_CALLBACK_URL", ""),
        "AccountReference": account_reference,
        "TransactionDesc": description[:255],
    }

    if provider == "mock":
        transaction.request_payload = payload
        transaction.merchant_request_id = f"mock-merchant-{transaction.pk}"
        transaction.checkout_request_id = f"mock-checkout-{transaction.pk}"
        transaction.result_description = "Mock MPesa STK push initiated."
        transaction.save(
            update_fields=[
                "request_payload",
                "merchant_request_id",
                "checkout_request_id",
                "result_description",
                "updated_at",
            ]
        )
        return transaction

    timestamp = _mpesa_timestamp()
    payload["Timestamp"] = timestamp
    payload["Password"] = _mpesa_password(timestamp)

    token = _mpesa_access_token()
    body = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(
        f"{_mpesa_base_url()}/mpesa/stkpush/v1/processrequest",
        data=body,
        method="POST",
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib_request.urlopen(req, timeout=20) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except error.URLError as exc:
        transaction.status = PaymentGatewayTransaction.Status.FAILED
        transaction.result_description = str(exc)
        transaction.request_payload = payload
        transaction.processed_at = timezone.now()
        transaction.save(
            update_fields=[
                "status",
                "result_description",
                "request_payload",
                "processed_at",
                "updated_at",
            ]
        )
        raise ValidationError(f"MPesa request failed: {exc}") from exc

    transaction.request_payload = payload
    transaction.merchant_request_id = response_payload.get("MerchantRequestID", "")
    transaction.checkout_request_id = response_payload.get("CheckoutRequestID", "")
    transaction.result_code = str(response_payload.get("ResponseCode", ""))
    transaction.result_description = response_payload.get("ResponseDescription", "")
    transaction.status = PaymentGatewayTransaction.Status.PENDING
    transaction.processed_at = timezone.now()
    transaction.save(
        update_fields=[
            "request_payload",
            "merchant_request_id",
            "checkout_request_id",
            "result_code",
            "result_description",
            "status",
            "processed_at",
            "updated_at",
        ]
    )
    return transaction


def record_bank_payment(
    *,
    user,
    lease,
    amount,
    reference,
    bank_name,
    bank_account_name="",
    bank_account_number="",
    invoice=None,
    payment_date=None,
    notes="",
):
    _validate_gateway_lease_access(lease=lease, user=user)
    _validate_gateway_invoice_access(invoice=invoice, tenant_id=user.tenant_id)

    payment = Payment.objects.create(
        tenant=user.tenant,
        lease=lease,
        resident=lease.resident,
        invoice=invoice,
        property=lease.unit.property,
        unit=lease.unit,
        amount=amount,
        payment_date=payment_date or timezone.localdate(),
        method=Payment.PaymentMethod.BANK_TRANSFER,
        status=Payment.PaymentStatus.SUCCEEDED,
        reference=reference,
        gateway_transaction_id=reference,
        received_by=user,
        notes=notes,
    )
    apply_payment_to_invoice(payment)
    transaction = _create_gateway_transaction(
        gateway=PaymentGatewayTransaction.Gateway.BANK,
        transaction_type=PaymentGatewayTransaction.TransactionType.MANUAL_BANK_POSTING,
        lease=lease,
        invoice=invoice,
        amount=amount,
        external_reference=reference,
        account_reference=build_account_reference(lease=lease, invoice=invoice),
        status=PaymentGatewayTransaction.Status.SUCCEEDED,
        request_payload={"notes": notes} if notes else {},
        bank_name=bank_name,
        bank_account_name=bank_account_name,
        bank_account_number=bank_account_number,
    )
    transaction.payment = payment
    transaction.processed_at = timezone.now()
    transaction.completed_at = timezone.now()
    transaction.result_description = "Bank payment recorded."
    transaction.gateway_transaction_id = reference
    transaction.save(
        update_fields=[
            "payment",
            "processed_at",
            "completed_at",
            "result_description",
            "gateway_transaction_id",
            "updated_at",
        ]
    )
    return transaction


def process_mpesa_callback(*, callback_payload):
    stk_callback = callback_payload.get("Body", {}).get("stkCallback", {})
    checkout_request_id = stk_callback.get("CheckoutRequestID", "")
    merchant_request_id = stk_callback.get("MerchantRequestID", "")
    transaction = PaymentGatewayTransaction.objects.filter(
        checkout_request_id=checkout_request_id
    ).first()
    if transaction is None and merchant_request_id:
        transaction = PaymentGatewayTransaction.objects.filter(
            merchant_request_id=merchant_request_id
        ).first()
    if transaction is None:
        raise ValidationError("MPesa transaction could not be matched to an initiated request.")

    transaction.callback_payload = callback_payload
    transaction.result_code = str(stk_callback.get("ResultCode", ""))
    transaction.result_description = stk_callback.get("ResultDesc", "")
    transaction.processed_at = timezone.now()

    if transaction.result_code == "0":
        metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
        metadata = {item.get("Name"): item.get("Value") for item in metadata_items}
        transaction.status = PaymentGatewayTransaction.Status.SUCCEEDED
        transaction.gateway_transaction_id = str(
            metadata.get("MpesaReceiptNumber") or metadata.get("ReceiptNumber") or ""
        )
        if metadata.get("PhoneNumber"):
            transaction.phone_number = str(metadata["PhoneNumber"])

        payment = transaction.payment
        if payment is None:
            payment = Payment.objects.create(
                tenant=transaction.tenant,
                lease=transaction.lease,
                resident=transaction.resident,
                invoice=transaction.invoice,
                property=transaction.property,
                unit=transaction.unit,
                amount=transaction.amount,
                payment_date=timezone.localdate(),
                method=Payment.PaymentMethod.MOBILE_MONEY,
                status=Payment.PaymentStatus.SUCCEEDED,
                reference=transaction.gateway_transaction_id or transaction.external_reference,
                gateway_transaction_id=transaction.checkout_request_id or transaction.external_reference,
                notes="Payment received via MPesa callback.",
            )
            apply_payment_to_invoice(payment)
            transaction.payment = payment
        else:
            payment.status = Payment.PaymentStatus.SUCCEEDED
            payment.reference = payment.reference or transaction.gateway_transaction_id or transaction.external_reference
            payment.gateway_transaction_id = transaction.checkout_request_id or transaction.external_reference
            payment.save(update_fields=["status", "reference", "gateway_transaction_id", "updated_at"])
            apply_payment_to_invoice(payment)
        transaction.completed_at = timezone.now()
    else:
        transaction.status = PaymentGatewayTransaction.Status.FAILED

    transaction.save(
        update_fields=[
            "payment",
            "callback_payload",
            "result_code",
            "result_description",
            "status",
            "gateway_transaction_id",
            "phone_number",
            "processed_at",
            "completed_at",
            "updated_at",
        ]
    )
    return transaction


def generate_monthly_invoices(*, billing_date=None, tenant=None):
    billing_date = billing_date or timezone.localdate()
    period_start = billing_date.replace(day=1)
    period_end = billing_date.replace(day=monthrange(billing_date.year, billing_date.month)[1])
    generated = []

    leases = Lease.objects.filter(status=Lease.LeaseStatus.ACTIVE).select_related(
        "resident",
        "resident__user",
        "unit",
        "unit__property",
    )
    if tenant is not None:
        leases = leases.filter(unit__tenant=tenant)

    for lease in leases:
        invoice_number = build_invoice_number(
            tenant_id=lease.unit.tenant_id,
            billing_date=period_start,
            lease_id=lease.pk,
        )
        invoice, created = Invoice.objects.get_or_create(
            tenant_id=lease.unit.tenant_id,
            invoice_number=invoice_number,
            defaults={
                "lease": lease,
                "resident": lease.resident,
                "property": lease.unit.property,
                "unit": lease.unit,
                "billing_period_start": period_start,
                "billing_period_end": period_end,
                "due_date": period_start.replace(day=min(lease.due_day, period_end.day)),
                "subtotal_amount": lease.rent_amount,
                "tax_amount": Decimal("0.00"),
                "discount_amount": Decimal("0.00"),
                "total_amount": lease.rent_amount,
                "balance_due": lease.rent_amount,
                "status": Invoice.InvoiceStatus.OPEN,
                "notes": f"Auto-generated rent invoice for {period_start:%B %Y}",
            },
        )
        if created:
            generated.append(invoice)
    return generated


def sync_invoice_statuses(*, today=None, tenant=None):
    today = today or timezone.localdate()
    invoices = Invoice.objects.exclude(status=Invoice.InvoiceStatus.VOID)
    if tenant is not None:
        invoices = invoices.filter(tenant=tenant)

    for invoice in invoices:
        if invoice.balance_due <= Decimal("0.00"):
            if invoice.status != Invoice.InvoiceStatus.PAID:
                invoice.status = Invoice.InvoiceStatus.PAID
                invoice.save(update_fields=["status", "updated_at"])
            Arrear.objects.filter(invoice=invoice).delete()
            continue

        target_status = (
            Invoice.InvoiceStatus.OVERDUE if invoice.due_date < today else Invoice.InvoiceStatus.OPEN
        )
        if invoice.status != target_status:
            invoice.status = target_status
            invoice.save(update_fields=["status", "updated_at"])

        if target_status == Invoice.InvoiceStatus.OVERDUE:
            Arrear.objects.update_or_create(
                tenant=invoice.tenant,
                lease=invoice.lease,
                resident=invoice.resident,
                invoice=invoice,
                defaults={
                    "amount_due": invoice.total_amount,
                    "amount_paid": invoice.total_amount - invoice.balance_due,
                    "outstanding_amount": invoice.balance_due,
                    "status": Arrear.ArrearStatus.OPEN,
                    "due_date": invoice.due_date,
                    "notes": f"Auto-synced from overdue invoice {invoice.invoice_number}",
                },
            )

    return invoices.count()


def build_rent_roll_report(*, tenant, property_id=None):
    leases = (
        Lease.objects.filter(unit__tenant=tenant, status=Lease.LeaseStatus.ACTIVE)
        .select_related("resident", "resident__user", "unit", "unit__property")
        .order_by("unit__property__name", "unit__unit_number")
    )
    if property_id is not None:
        leases = leases.filter(unit__property_id=property_id)

    rows = []
    total_rent = Decimal("0.00")
    total_balance = Decimal("0.00")
    occupied_units = 0
    for lease in leases:
        outstanding = (
            Invoice.objects.filter(
                lease=lease,
                status__in=[
                    Invoice.InvoiceStatus.OPEN,
                    Invoice.InvoiceStatus.PARTIALLY_PAID,
                    Invoice.InvoiceStatus.OVERDUE,
                ],
            ).aggregate(total=Sum("balance_due"))["total"]
            or Decimal("0.00")
        )
        occupied_units += 1
        total_rent += lease.rent_amount
        total_balance += outstanding
        rows.append(
            {
                "property_id": lease.unit.property_id,
                "property_name": lease.unit.property.name,
                "unit_id": lease.unit_id,
                "unit_number": lease.unit.unit_number,
                "resident_id": lease.resident_id,
                "resident_name": lease.resident.user.display_name,
                "lease_id": lease.pk,
                "rent_amount": lease.rent_amount,
                "outstanding_balance": outstanding,
                "status": lease.status,
                "start_date": lease.start_date,
                "end_date": lease.end_date,
            }
        )

    return {
        "generated_at": timezone.now(),
        "occupied_units": occupied_units,
        "scheduled_rent_total": total_rent,
        "outstanding_balance_total": total_balance,
        "items": rows,
    }


def build_aged_receivables_report(*, tenant, today=None, property_id=None):
    today = today or timezone.localdate()
    invoices = Invoice.objects.filter(
        tenant=tenant,
        balance_due__gt=Decimal("0.00"),
    ).select_related("resident", "resident__user", "property", "unit")
    if property_id is not None:
        invoices = invoices.filter(property_id=property_id)

    buckets = {
        "current": Decimal("0.00"),
        "1_30": Decimal("0.00"),
        "31_60": Decimal("0.00"),
        "61_90": Decimal("0.00"),
        "90_plus": Decimal("0.00"),
    }
    items = []
    for invoice in invoices.order_by("due_date"):
        days_overdue = max(0, (today - invoice.due_date).days)
        if days_overdue == 0:
            bucket = "current"
        elif days_overdue <= 30:
            bucket = "1_30"
        elif days_overdue <= 60:
            bucket = "31_60"
        elif days_overdue <= 90:
            bucket = "61_90"
        else:
            bucket = "90_plus"
        buckets[bucket] += invoice.balance_due
        items.append(
            {
                "invoice_id": invoice.pk,
                "invoice_number": invoice.invoice_number,
                "property_name": invoice.property.name,
                "unit_number": invoice.unit.unit_number,
                "resident_name": invoice.resident.user.display_name,
                "due_date": invoice.due_date,
                "days_overdue": days_overdue,
                "balance_due": invoice.balance_due,
                "bucket": bucket,
            }
        )

    return {
        "generated_at": timezone.now(),
        "as_of_date": today,
        "totals": buckets,
        "grand_total": sum(buckets.values(), Decimal("0.00")),
        "items": items,
    }


def build_property_profit_and_loss_report(*, tenant, start_date, end_date, property_id=None):
    payments = Payment.objects.filter(
        tenant=tenant,
        payment_date__range=(start_date, end_date),
        status__in=[Payment.PaymentStatus.PROCESSING, Payment.PaymentStatus.SUCCEEDED],
    )
    expenses = Expense.objects.filter(
        tenant=tenant,
        expense_date__range=(start_date, end_date),
    ).exclude(status=Expense.ExpenseStatus.REJECTED)

    if property_id is not None:
        payments = payments.filter(property_id=property_id)
        expenses = expenses.filter(property_id=property_id)

    properties = {}
    for payment in payments.select_related("property"):
        entry = properties.setdefault(
            payment.property_id,
            {
                "property_id": payment.property_id,
                "property_name": payment.property.name,
                "income_total": Decimal("0.00"),
                "expense_total": Decimal("0.00"),
            },
        )
        entry["income_total"] += payment.amount

    for expense in expenses.select_related("property"):
        entry = properties.setdefault(
            expense.property_id,
            {
                "property_id": expense.property_id,
                "property_name": expense.property.name,
                "income_total": Decimal("0.00"),
                "expense_total": Decimal("0.00"),
            },
        )
        entry["expense_total"] += expense.amount

    rows = []
    total_income = Decimal("0.00")
    total_expenses = Decimal("0.00")
    for entry in sorted(properties.values(), key=lambda item: item["property_name"]):
        entry["net_operating_income"] = entry["income_total"] - entry["expense_total"]
        total_income += entry["income_total"]
        total_expenses += entry["expense_total"]
        rows.append(entry)

    return {
        "generated_at": timezone.now(),
        "start_date": start_date,
        "end_date": end_date,
        "income_total": total_income,
        "expense_total": total_expenses,
        "net_operating_income": total_income - total_expenses,
        "items": rows,
    }
