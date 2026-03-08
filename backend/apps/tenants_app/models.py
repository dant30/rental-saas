"""Models for tenant / renter management."""

from django.db import models

from apps.accounts.models import User
from apps.properties.models import Unit


class Resident(models.Model):
    """A person renting a unit within a tenant schema."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="resident_profile"
    )
    phone_number = models.CharField(max_length=30, blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return str(self.user)


class Lease(models.Model):
    """A lease agreement between a resident and a unit."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("terminated", "Terminated"),
    ]

    resident = models.ForeignKey(
        Resident, on_delete=models.CASCADE, related_name="leases"
    )
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="leases")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        """Validate that leases do not overlap for the same unit."""
        from django.core.exceptions import ValidationError

        overlapping = Lease.objects.filter(unit=self.unit)
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        overlapping = overlapping.filter(
            start_date__lte=self.end_date or self.start_date,
            end_date__gte=self.start_date,
        )

        if overlapping.exists():
            raise ValidationError(
                "This unit already has a lease that overlaps the selected dates."
            )
