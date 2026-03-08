"""Property and unit models for tenant-specific data."""

from decimal import Decimal

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import TenantAwareModel, TimeStampedModel


class Property(TenantAwareModel):
    class PropertyType(models.TextChoices):
        APARTMENT = "apartment", "Apartment"
        HOUSE = "house", "House"
        COMMERCIAL = "commercial", "Commercial"
        MIXED_USE = "mixed_use", "Mixed Use"
        HOSTEL = "hostel", "Hostel"
        OTHER = "other", "Other"

    class ManagementType(models.TextChoices):
        SELF_MANAGED = "self_managed", "Self Managed"
        AGENCY_MANAGED = "agency_managed", "Agency Managed"

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True)
    property_type = models.CharField(
        max_length=32,
        choices=PropertyType.choices,
        default=PropertyType.OTHER,
    )
    management_type = models.CharField(
        max_length=20,
        choices=ManagementType.choices,
        default=ManagementType.SELF_MANAGED,
    )
    description = models.TextField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=30, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    year_built = models.PositiveIntegerField(null=True, blank=True)
    total_units = models.PositiveIntegerField(default=1)
    parking_spaces = models.PositiveIntegerField(default=0)
    lot_size = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    market_rent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    acquisition_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "name"],
                name="unique_property_name_per_tenant",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def occupied_units_count(self) -> int:
        return self.units.filter(status=Unit.UnitStatus.OCCUPIED).count()

    @property
    def vacancy_rate(self) -> float:
        total = self.units.count()
        if not total:
            return 0.0
        vacant = self.units.filter(status=Unit.UnitStatus.VACANT).count()
        return round((vacant / total) * 100, 2)


class Unit(TenantAwareModel):
    class UnitStatus(models.TextChoices):
        VACANT = "vacant", "Vacant"
        OCCUPIED = "occupied", "Occupied"
        RESERVED = "reserved", "Reserved"
        MAINTENANCE = "maintenance", "Maintenance"
        OFFLINE = "offline", "Offline"

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="units")
    unit_number = models.CharField(max_length=50)
    floor = models.CharField(max_length=20, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    square_feet = models.PositiveIntegerField(null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(
        max_length=32,
        choices=UnitStatus.choices,
        default=UnitStatus.VACANT,
    )
    is_furnished = models.BooleanField(default=False)
    availability_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["property__name", "unit_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["property", "unit_number"],
                name="unique_unit_number_per_property",
            ),
        ]

    def clean(self):
        if self.tenant_id and self.property_id and self.property.tenant_id:
            if self.tenant_id != self.property.tenant_id:
                raise ValidationError("Unit tenant must match the property's tenant.")

    def save(self, *args, **kwargs):
        if self.property_id and self.property.tenant_id:
            self.tenant_id = self.property.tenant_id
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.property.name} - {self.unit_number}"


class Document(TimeStampedModel):
    """Generic document store for properties, residents, leases, and operations."""

    class DocumentCategory(models.TextChoices):
        LEASE = "lease", "Lease"
        IDENTITY = "identity", "Identity"
        RECEIPT = "receipt", "Receipt"
        INSPECTION = "inspection", "Inspection"
        INVOICE = "invoice", "Invoice"
        MAINTENANCE = "maintenance", "Maintenance"
        OTHER = "other", "Other"

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.PROTECT,
        related_name="documents",
        null=True,
        blank=True,
    )
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="uploaded_documents",
        null=True,
        blank=True,
    )
    category = models.CharField(
        max_length=20,
        choices=DocumentCategory.choices,
        default=DocumentCategory.OTHER,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="documents/")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    is_private = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["content_type", "object_id"])]

    def __str__(self):
        return self.title
