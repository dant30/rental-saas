"""Accounts models for authentication and user management."""

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


phone_validator = RegexValidator(
    regex=r"^\+?[1-9]\d{7,14}$",
    message="Phone number must be in international format, for example +254712345678.",
)


class User(AbstractUser):
    """Custom user model for Rental SaaS."""

    class UserType(models.TextChoices):
        PLATFORM_ADMIN = "platform_admin", "Platform Admin"
        LANDLORD = "landlord", "Landlord"
        AGENCY_ADMIN = "agency_admin", "Agency Admin"
        AGENCY_STAFF = "agency_staff", "Agency Staff"
        TENANT = "tenant", "Tenant"
        CARETAKER = "caretaker", "Caretaker"
        OWNER = "owner", "Owner"

    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],
    )
    user_type = models.CharField(
        max_length=32,
        choices=UserType.choices,
        default=UserType.LANDLORD,
    )
    is_landlord = models.BooleanField(default=False)
    is_agency_admin = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False)
    is_tenant_user = models.BooleanField(default=False)
    is_caretaker = models.BooleanField(default=False)
    job_title = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True)
    last_seen_at = models.DateTimeField(blank=True, null=True)

    # If using schema-based multi-tenancy, this can be null for public users.
    tenant = models.ForeignKey(
        "tenants.Tenant",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
    )

    class Meta:
        ordering = ["username"]

    def __str__(self):
        return self.get_full_name() or self.email or self.username

    @property
    def display_name(self) -> str:
        return self.get_full_name() or self.username

    def mark_seen(self, commit: bool = True) -> None:
        self.last_seen_at = timezone.now()
        if commit:
            self.save(update_fields=["last_seen_at"])

    def save(self, *args, **kwargs):
        self.email = (self.email or "").lower().strip()
        self.is_landlord = self.user_type == self.UserType.LANDLORD or self.is_landlord
        self.is_agency_admin = (
            self.user_type == self.UserType.AGENCY_ADMIN or self.is_agency_admin
        )
        self.is_owner = self.user_type == self.UserType.OWNER or self.is_owner
        self.is_tenant_user = self.user_type == self.UserType.TENANT or self.is_tenant_user
        self.is_caretaker = self.user_type == self.UserType.CARETAKER or self.is_caretaker
        super().save(*args, **kwargs)
