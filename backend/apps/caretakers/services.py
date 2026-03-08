"""Service helpers for caretaker and maintenance workflows."""

import datetime

from django.db.models import Count, Q
from django.utils import timezone

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


def _normalize_skill_text(value: str) -> set[str]:
    return {item.strip().lower() for item in (value or "").replace("/", ",").split(",") if item.strip()}


def choose_best_caretaker(*, tenant, request=None, schedule=None):
    caretakers = (
        Caretaker.objects.filter(
            tenant=tenant,
            is_available=True,
            status=Caretaker.EmploymentStatus.ACTIVE,
        )
        .annotate(
            open_task_count=Count(
                "assigned_requests",
                filter=Q(
                    assigned_requests__status__in=[
                        MaintenanceRequest.Status.SUBMITTED,
                        MaintenanceRequest.Status.ACKNOWLEDGED,
                        MaintenanceRequest.Status.ASSIGNED,
                        MaintenanceRequest.Status.IN_PROGRESS,
                        MaintenanceRequest.Status.ON_HOLD,
                    ]
                ),
            )
        )
        .order_by("open_task_count", "created_at")
    )
    if not caretakers.exists():
        return None

    desired_terms = _normalize_skill_text(
        (request.description if request else "") or (schedule.description if schedule else "")
    ) | _normalize_skill_text((request.title if request else "") or (schedule.title if schedule else ""))

    ranked = []
    for caretaker in caretakers:
        skills = _normalize_skill_text(caretaker.skills)
        skill_score = len(desired_terms & skills)
        capacity_penalty = caretaker.open_task_count / max(caretaker.max_open_tasks, 1)
        ranked.append((skill_score - capacity_penalty, caretaker.open_task_count, caretaker))

    ranked.sort(key=lambda item: (-item[0], item[1], item[2].pk))
    return ranked[0][2]


def save_caretaker_for_user(serializer, user):
    caretaker_user = serializer.validated_data["user"]
    if caretaker_user.tenant_id != user.tenant_id:
        raise ValueError("Caretaker user must belong to the current tenant.")
    return serializer.save(tenant=user.tenant)


def save_maintenance_request_for_user(serializer, user):
    instance = serializer.save(tenant=user.tenant, reported_by=user)
    if instance.assigned_to_id is None:
        caretaker = choose_best_caretaker(tenant=user.tenant, request=instance)
        if caretaker is not None:
            instance.assigned_to = caretaker
            instance.status = MaintenanceRequest.Status.ASSIGNED
            instance.save(update_fields=["assigned_to", "status", "assigned_at", "updated_at"])
    return instance


def save_maintenance_schedule_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_attachment_for_user(serializer, user):
    return serializer.save(uploaded_by=user)


def _advance_schedule_date(schedule):
    current = schedule.next_due_at
    if schedule.frequency == MaintenanceSchedule.Frequency.WEEKLY:
        return current + datetime.timedelta(days=7)
    if schedule.frequency == MaintenanceSchedule.Frequency.MONTHLY:
        return current + datetime.timedelta(days=30)
    if schedule.frequency == MaintenanceSchedule.Frequency.QUARTERLY:
        return current + datetime.timedelta(days=90)
    if schedule.frequency == MaintenanceSchedule.Frequency.BIANNUAL:
        return current + datetime.timedelta(days=182)
    return current + datetime.timedelta(days=365)


def create_preventive_work_orders(*, today=None, tenant=None):
    today = today or timezone.localdate()
    schedules = MaintenanceSchedule.objects.filter(is_active=True, next_due_at__lte=today).select_related(
        "property",
        "unit",
        "tenant",
        "assigned_to",
    )
    if tenant is not None:
        schedules = schedules.filter(tenant=tenant)

    created_requests = []
    for schedule in schedules:
        existing = MaintenanceRequest.objects.filter(
            tenant=schedule.tenant,
            property=schedule.property,
            unit=schedule.unit,
            title=schedule.title,
            status__in=[
                MaintenanceRequest.Status.SUBMITTED,
                MaintenanceRequest.Status.ACKNOWLEDGED,
                MaintenanceRequest.Status.ASSIGNED,
                MaintenanceRequest.Status.IN_PROGRESS,
                MaintenanceRequest.Status.ON_HOLD,
            ],
        ).exists()
        if existing:
            continue

        caretaker = schedule.assigned_to or choose_best_caretaker(tenant=schedule.tenant, schedule=schedule)
        work_order = MaintenanceRequest.objects.create(
            tenant=schedule.tenant,
            property=schedule.property,
            unit=schedule.unit,
            assigned_to=caretaker,
            title=schedule.title,
            description=schedule.description or f"Preventive maintenance for {schedule.title}",
            priority=MaintenanceRequest.Priority.MEDIUM,
            status=(
                MaintenanceRequest.Status.ASSIGNED
                if caretaker is not None
                else MaintenanceRequest.Status.SUBMITTED
            ),
            internal_notes="Auto-created from maintenance schedule.",
        )
        created_requests.append(work_order)
        schedule.last_done_at = today
        schedule.next_due_at = _advance_schedule_date(schedule)
        schedule.save(update_fields=["last_done_at", "next_due_at", "updated_at"])

    return created_requests
