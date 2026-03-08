from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "tenant",
        "user_type",
        "is_staff",
        "is_active",
        "is_landlord",
        "is_agency_admin",
    )
    list_filter = (
        "user_type",
        "is_staff",
        "is_superuser",
        "is_active",
        "is_landlord",
        "is_agency_admin",
        "tenant",
    )
    search_fields = ("username", "email", "first_name", "last_name", "phone_number", "job_title")
