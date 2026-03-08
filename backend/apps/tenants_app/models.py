"""Models for tenant / renter management."""

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import TimeStampedModel


class Resident(TimeStampedModel):
    """A person renting a unit within a tenant schema."""

    class Status(models.TextChoices):
        PROSPECT = "prospect", "Prospect"
        ACTIVE = "active", "Active"
        NOTICE = "notice", "Notice Given"
        FORMER = "former", "Former"
        BLOCKED = "blocked", "Blocked"

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="resident_profile",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    phone_number = models.CharField(max_length=30, blank=True)
    alternate_phone_number = models.CharField(max_length=30, blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    emergency_phone_number = models.CharField(max_length=30, blank=True)
    national_id_number = models.CharField(max_length=100, blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    employer_name = models.CharField(max_length=255, blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    move_in_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ["user__first_name", "user__last_name", "user__username"]

    def __str__(self):
        return str(self.user)


class Lease(TimeStampedModel):
    """A lease agreement between a resident and a unit."""

    class LeaseStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        TERMINATED = "terminated", "Terminated"
        RENEWED = "renewed", "Renewed"

    class BillingCycle(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        YEARLY = "yearly", "Yearly"

    resident = models.ForeignKey(
        Resident,
        on_delete=models.CASCADE,
        related_name="leases",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.PROTECT,
        related_name="leases",
    )
    lease_number = models.CharField(max_length=50, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    move_in_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)
    rent_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    billing_cycle = models.CharField(
        max_length=20,
        choices=BillingCycle.choices,
        default=BillingCycle.MONTHLY,
    )
    due_day = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(
        max_length=32,
        choices=LeaseStatus.choices,
        default=LeaseStatus.PENDING,
    )
    signed_at = models.DateTimeField(null=True, blank=True)
    terminated_at = models.DateTimeField(null=True, blank=True)
    termination_reason = models.TextField(blank=True)
    terms = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["unit", "resident"],
                name="unique_unit_resident_lease",
            ),
        ]

    def __str__(self):
        return f"Lease for {self.resident} on {self.unit} ({self.status})"

    def clean(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValidationError("Lease end date cannot be earlier than start date.")
        if self.due_day < 1 or self.due_day > 31:
            raise ValidationError("Due day must be between 1 and 31.")
        if self.resident_id and self.unit_id:
            resident_tenant_id = self.resident.user.tenant_id
            unit_tenant_id = self.unit.tenant_id
            if resident_tenant_id and unit_tenant_id and resident_tenant_id != unit_tenant_id:
                raise ValidationError("Resident and unit must belong to the same tenant.")

        overlapping = Lease.objects.filter(unit=self.unit).exclude(
            status__in=[self.LeaseStatus.TERMINATED, self.LeaseStatus.EXPIRED]
        )
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        proposed_end = self.end_date or self.start_date
        overlapping = overlapping.filter(start_date__lte=proposed_end).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=self.start_date)
        )

        if overlapping.exists():
            raise ValidationError(
                "This unit already has a lease that overlaps the selected dates."
            )

    @property
    def is_active(self) -> bool:
        return self.status == self.LeaseStatus.ACTIVE
