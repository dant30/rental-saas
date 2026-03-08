"""Service helpers for account-scoped portal experiences."""

from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Sum

from apps.caretakers.models import MaintenanceRequest, MaintenanceSchedule
from apps.notifications.models import Conversation, Notification
from apps.payments.models import Invoice, Payment
from apps.properties.models import Property, Unit
from apps.tenants_app.models import Lease


def _get_resident_profile(user):
    try:
        return user.resident_profile
    except ObjectDoesNotExist:
        return None


def _get_caretaker_profile(user):
    try:
        return user.caretaker_profile
    except ObjectDoesNotExist:
        return None


def build_tenant_portal_summary(*, user):
    resident = _get_resident_profile(user)
    leases = Lease.objects.filter(resident=resident).select_related("unit", "unit__property") if resident else Lease.objects.none()
    active_lease = leases.filter(status=Lease.LeaseStatus.ACTIVE).first()
    invoices = Invoice.objects.filter(resident=resident).select_related("property", "unit") if resident else Invoice.objects.none()
    payments = Payment.objects.filter(resident=resident).select_related("property", "unit", "invoice") if resident else Payment.objects.none()
    maintenance_requests = (
        MaintenanceRequest.objects.filter(resident=resident).select_related("property", "unit", "assigned_to")
        if resident
        else MaintenanceRequest.objects.none()
    )
    unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()
    conversation_count = Conversation.objects.filter(participants=user).distinct().count()

    outstanding_balance = invoices.aggregate(total=Sum("balance_due"))["total"] or Decimal("0.00")
    successful_payments_total = (
        payments.filter(status=Payment.PaymentStatus.SUCCEEDED).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    return {
        "user_id": user.pk,
        "display_name": user.display_name,
        "resident_id": resident.pk if resident else None,
        "active_lease": (
            {
                "lease_id": active_lease.pk,
                "unit_number": active_lease.unit.unit_number,
                "property_name": active_lease.unit.property.name,
                "rent_amount": active_lease.rent_amount,
                "start_date": active_lease.start_date,
                "end_date": active_lease.end_date,
                "status": active_lease.status,
            }
            if active_lease
            else None
        ),
        "outstanding_balance": outstanding_balance,
        "payments_total": successful_payments_total,
        "invoice_count": invoices.count(),
        "open_maintenance_count": maintenance_requests.exclude(
            status__in=[MaintenanceRequest.Status.COMPLETED, MaintenanceRequest.Status.CANCELLED]
        ).count(),
        "unread_notifications": unread_notifications,
        "conversation_count": conversation_count,
    }


def build_owner_portal_summary(*, user):
    tenant = user.tenant
    properties = Property.objects.filter(tenant=tenant)
    units = Unit.objects.filter(tenant=tenant)
    open_invoices = Invoice.objects.filter(
        tenant=tenant,
        status__in=[
            Invoice.InvoiceStatus.OPEN,
            Invoice.InvoiceStatus.PARTIALLY_PAID,
            Invoice.InvoiceStatus.OVERDUE,
        ],
    )
    payments = Payment.objects.filter(
        tenant=tenant,
        status__in=[Payment.PaymentStatus.PROCESSING, Payment.PaymentStatus.SUCCEEDED],
    )
    open_requests = MaintenanceRequest.objects.filter(
        tenant=tenant,
        status__in=[
            MaintenanceRequest.Status.SUBMITTED,
            MaintenanceRequest.Status.ACKNOWLEDGED,
            MaintenanceRequest.Status.ASSIGNED,
            MaintenanceRequest.Status.IN_PROGRESS,
            MaintenanceRequest.Status.ON_HOLD,
        ],
    )

    return {
        "property_count": properties.count(),
        "unit_count": units.count(),
        "occupied_unit_count": units.filter(status=Unit.UnitStatus.OCCUPIED).count(),
        "vacant_unit_count": units.filter(status=Unit.UnitStatus.VACANT).count(),
        "scheduled_rent": (
            Lease.objects.filter(unit__tenant=tenant, status=Lease.LeaseStatus.ACTIVE).aggregate(total=Sum("rent_amount"))["total"]
            or Decimal("0.00")
        ),
        "outstanding_receivables": open_invoices.aggregate(total=Sum("balance_due"))["total"] or Decimal("0.00"),
        "payments_collected": payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
        "open_maintenance_count": open_requests.count(),
        "properties": list(
            properties.annotate(unit_count=Count("units")).values("id", "name", "property_type", "unit_count")
        ),
    }


def build_caretaker_portal_summary(*, user):
    caretaker = _get_caretaker_profile(user)
    if caretaker is None:
        return {
            "caretaker_id": None,
            "assigned_open_count": 0,
            "completed_count": 0,
            "due_schedule_count": 0,
            "conversation_count": 0,
            "tasks": [],
        }

    tasks = MaintenanceRequest.objects.filter(assigned_to=caretaker).select_related("property", "unit")
    open_tasks = tasks.exclude(
        status__in=[MaintenanceRequest.Status.COMPLETED, MaintenanceRequest.Status.CANCELLED]
    )
    due_schedules = MaintenanceSchedule.objects.filter(
        assigned_to=caretaker,
        is_active=True,
    )
    return {
        "caretaker_id": caretaker.pk,
        "assigned_open_count": open_tasks.count(),
        "completed_count": tasks.filter(status=MaintenanceRequest.Status.COMPLETED).count(),
        "due_schedule_count": due_schedules.count(),
        "conversation_count": Conversation.objects.filter(participants=user).distinct().count(),
        "tasks": list(
            open_tasks.order_by("-created_at").values(
                "id",
                "title",
                "status",
                "priority",
                "property__name",
                "unit__unit_number",
            )[:10]
        ),
    }


def get_tenant_portal_invoice_queryset(user):
    resident = _get_resident_profile(user)
    if resident is None:
        return Invoice.objects.none()
    return Invoice.objects.filter(resident=resident).select_related("property", "unit", "lease")


def get_tenant_portal_payment_queryset(user):
    resident = _get_resident_profile(user)
    if resident is None:
        return Payment.objects.none()
    return Payment.objects.filter(resident=resident).select_related("property", "unit", "invoice", "lease")


def get_tenant_portal_maintenance_queryset(user):
    resident = _get_resident_profile(user)
    if resident is None:
        return MaintenanceRequest.objects.none()
    return MaintenanceRequest.objects.filter(resident=resident).select_related("property", "unit", "assigned_to")


def get_caretaker_portal_task_queryset(user):
    caretaker = _get_caretaker_profile(user)
    if caretaker is None:
        return MaintenanceRequest.objects.none()
    return MaintenanceRequest.objects.filter(assigned_to=caretaker).select_related("property", "unit", "resident")
