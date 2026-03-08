"""Caretaker and maintenance workflow models."""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models import TenantAwareModel, TimeStampedModel


class Caretaker(TenantAwareModel):
    class EmploymentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        OFF_DUTY = "off_duty", "Off Duty"
        SUSPENDED = "suspended", "Suspended"
        INACTIVE = "inactive", "Inactive"

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="caretaker_profile",
    )
    employee_id = models.CharField(max_length=50, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    service_areas = models.TextField(blank=True)
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    max_open_tasks = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )

    class Meta:
        ordering = ["user__first_name", "user__last_name", "user__username"]

    def __str__(self):
        return str(self.user)


class MaintenanceRequest(TenantAwareModel):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In Progress"
        ON_HOLD = "on_hold", "On Hold"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    resident = models.ForeignKey(
        "tenants_app.Resident",
        on_delete=models.SET_NULL,
        related_name="maintenance_requests",
        null=True,
        blank=True,
    )
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="maintenance_requests",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.SET_NULL,
        related_name="maintenance_requests",
        null=True,
        blank=True,
    )
    assigned_to = models.ForeignKey(
        Caretaker,
        on_delete=models.SET_NULL,
        related_name="assigned_requests",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    reported_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="reported_maintenance_requests",
        null=True,
        blank=True,
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    access_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.property_id and self.property.tenant_id:
            self.tenant_id = self.property.tenant_id
        if self.unit_id and not self.property_id:
            self.property_id = self.unit.property_id
            self.tenant_id = self.unit.tenant_id
        if self.assigned_to_id and not self.assigned_at:
            self.assigned_at = timezone.now()
        if self.status == self.Status.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)


class MaintenanceAttachment(TimeStampedModel):
    request = models.ForeignKey(
        MaintenanceRequest,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="maintenance_attachments",
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to="maintenance/attachments/")
    caption = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.caption or f"Attachment {self.pk}"


class MaintenanceSchedule(TenantAwareModel):
    class Frequency(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        BIANNUAL = "biannual", "Biannual"
        ANNUAL = "annual", "Annual"

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="maintenance_schedules",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.SET_NULL,
        related_name="maintenance_schedules",
        null=True,
        blank=True,
    )
    assigned_to = models.ForeignKey(
        Caretaker,
        on_delete=models.SET_NULL,
        related_name="maintenance_schedules",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    frequency = models.CharField(
        max_length=20,
        choices=Frequency.choices,
        default=Frequency.MONTHLY,
    )
    last_done_at = models.DateField(null=True, blank=True)
    next_due_at = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["next_due_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.property_id and self.property.tenant_id:
            self.tenant_id = self.property.tenant_id
        super().save(*args, **kwargs)
