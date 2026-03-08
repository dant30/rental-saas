"""Service helpers for caretaker and maintenance workflows."""

from apps.caretakers.models import (
    Caretaker,
    MaintenanceAttachment,
    MaintenanceRequest,
    MaintenanceSchedule,
)


def get_caretaker_queryset_for_user(user):
    return Caretaker.objects.filter(tenant_id=user.tenant_id).select_related("user")


def get_maintenance_request_queryset_for_user(user):
    return MaintenanceRequest.objects.filter(tenant_id=user.tenant_id).select_related(
        "resident",
        "resident__user",
        "property",
        "unit",
        "assigned_to",
        "reported_by",
    )


def get_maintenance_schedule_queryset_for_user(user):
    return MaintenanceSchedule.objects.filter(tenant_id=user.tenant_id).select_related(
        "property",
        "unit",
        "assigned_to",
    )


def get_attachment_queryset_for_user(user):
    return MaintenanceAttachment.objects.filter(
        request__tenant_id=user.tenant_id
    ).select_related("request", "uploaded_by")


def save_caretaker_for_user(serializer, user):
    caretaker_user = serializer.validated_data["user"]
    if caretaker_user.tenant_id != user.tenant_id:
        raise ValueError("Caretaker user must belong to the current tenant.")
    return serializer.save(tenant=user.tenant)


def save_maintenance_request_for_user(serializer, user):
    return serializer.save(tenant=user.tenant, reported_by=user)


def save_maintenance_schedule_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_attachment_for_user(serializer, user):
    return serializer.save(uploaded_by=user)
