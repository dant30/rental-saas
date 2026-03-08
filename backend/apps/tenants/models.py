"""Tenant models for multi‑tenancy."""

from django.db import models

from django_tenants.models import DomainMixin, TenantMixin


class Tenant(TenantMixin):
    """Tenant schema representation."""

    name = models.CharField(max_length=255, unique=True)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)

    # We handle schema creation explicitly in our signup flow.
    # This makes it easy to run migrations for new schemas (auto-create turned off).
    auto_create_schema = False

    def __str__(self):
        return self.name


class Domain(DomainMixin):
    """Domain names mapped to tenants."""

    def __str__(self):
        return self.domain
