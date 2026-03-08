from django.contrib import admin

from .models import Domain, Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "schema_name", "paid_until", "on_trial", "created_on")
    list_filter = ("on_trial",)
    search_fields = ("name", "schema_name")


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ("domain", "tenant")
    search_fields = ("domain",)
