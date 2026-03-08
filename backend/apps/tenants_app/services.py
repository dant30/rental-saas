"""Service helpers for resident and lease workflows."""

from apps.tenants_app.models import Lease, Resident


def get_resident_queryset_for_user(user):
    return Resident.objects.filter(user__tenant_id=user.tenant_id).select_related("user")


def get_lease_queryset_for_user(user):
    return Lease.objects.filter(resident__user__tenant_id=user.tenant_id).select_related(
        "resident",
        "resident__user",
        "unit",
        "unit__property",
    )


def save_resident_for_user(serializer, user):
    resident_user = serializer.validated_data["user"]
    if resident_user.tenant_id != user.tenant_id:
        raise ValueError("Resident user must belong to the current tenant.")
    return serializer.save()


def save_lease_for_user(serializer, user):
    lease = serializer.save()
    if lease.resident.user.tenant_id != user.tenant_id or lease.unit.tenant_id != user.tenant_id:
        raise ValueError("Lease parties must belong to the current tenant.")
    return lease
