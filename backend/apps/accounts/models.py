"""Accounts models for authentication and user management."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for Rental SaaS."""

    is_landlord = models.BooleanField(default=False)
    is_agency_admin = models.BooleanField(default=False)

    # If using schema-based multi-tenancy, this can be null for public users.
    tenant = models.ForeignKey(
        "tenants.Tenant",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
    )

    def __str__(self):
        return self.get_full_name() or self.username
