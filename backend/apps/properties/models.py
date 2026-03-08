"""Property and unit models for tenant-specific data."""

from django.db import models

from apps.core.models import TimeStampedModel


class Property(TimeStampedModel):
    TYPE_CHOICES = [
        ("apartment", "Apartment"),
        ("house", "House"),
        ("commercial", "Commercial"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    property_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default="other")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Unit(TimeStampedModel):
    STATUS_CHOICES = [
        ("vacant", "Vacant"),
        ("occupied", "Occupied"),
        ("maintenance", "Maintenance"),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="units")
    unit_number = models.CharField(max_length=50)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="vacant")

    class Meta:
        unique_together = ("property", "unit_number")

    def __str__(self):
        return f"{self.property.name} - {self.unit_number}"
