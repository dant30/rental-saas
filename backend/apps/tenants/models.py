"""Tenant models for multi-tenancy."""

from django.db import models
from django.utils.text import slugify
from django.utils import timezone

from django_tenants.models import DomainMixin, TenantMixin


class Tenant(TenantMixin):
    """Tenant schema representation."""

    class PlanTier(models.TextChoices):
        STARTER = "starter", "Starter"
        PROFESSIONAL = "professional", "Professional"
        ENTERPRISE = "enterprise", "Enterprise"

    class SubscriptionStatus(models.TextChoices):
        TRIAL = "trial", "Trial"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past Due"
        SUSPENDED = "suspended", "Suspended"
        CANCELLED = "cancelled", "Cancelled"

    name = models.CharField(max_length=255, unique=True)
    legal_name = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to="tenants/logos/", blank=True, null=True)
    paid_until = models.DateField(null=True, blank=True)
    trial_ends_at = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.TRIAL,
    )
    plan_tier = models.CharField(
        max_length=20,
        choices=PlanTier.choices,
        default=PlanTier.STARTER,
    )
    max_properties = models.PositiveIntegerField(default=5)
    max_users = models.PositiveIntegerField(default=10)
    created_on = models.DateField(auto_now_add=True)
    go_live_date = models.DateField(null=True, blank=True)

    # We handle schema creation explicitly in our signup flow.
    # This makes it easy to run migrations for new schemas (auto-create turned off).
    auto_create_schema = False

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_subscription_active(self) -> bool:
        today = timezone.localdate()
        if self.subscription_status in {
            self.SubscriptionStatus.ACTIVE,
            self.SubscriptionStatus.TRIAL,
        }:
            return not self.paid_until or self.paid_until >= today
        return False

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base_slug = slugify(self.name)[:240] or "tenant"
            slug = base_slug
            counter = 2
            while Tenant.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base_slug[:235]}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Domain(DomainMixin):
    """Domain names mapped to tenants."""

    class Meta:
        ordering = ["domain"]

    def __str__(self):
        return self.domain
