from django.contrib import admin

from .models import Domain, Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "schema_name",
        "slug",
        "plan_tier",
        "subscription_status",
        "paid_until",
        "on_trial",
        "created_on",
    )
    list_filter = ("on_trial", "plan_tier", "subscription_status")
    search_fields = ("name", "schema_name", "slug", "contact_email", "contact_phone")


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ("domain", "tenant")
    search_fields = ("domain",)
