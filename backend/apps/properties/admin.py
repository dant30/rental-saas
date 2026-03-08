from django.contrib import admin

from .models import Document, Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "property_type", "management_type", "city", "is_active")
    list_filter = ("property_type", "management_type", "is_active", "tenant")
    search_fields = ("name", "code", "address", "city", "state", "country")


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("unit_number", "property", "tenant", "status", "rent_amount", "deposit_amount")
    list_filter = ("status", "is_furnished", "tenant", "property")
    search_fields = ("unit_number", "property__name", "notes")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "category", "uploaded_by", "is_private", "created_at")
    list_filter = ("category", "is_private", "tenant")
    search_fields = ("title", "description")
