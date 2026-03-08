from django.contrib import admin

from .models import Caretaker, MaintenanceAttachment, MaintenanceRequest, MaintenanceSchedule


@admin.register(Caretaker)
class CaretakerAdmin(admin.ModelAdmin):
    list_display = ("user", "tenant", "employee_id", "is_available", "status", "max_open_tasks")
    list_filter = ("is_available", "status", "tenant")
    search_fields = ("user__username", "user__email", "employee_id", "skills")


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "property", "unit", "priority", "status", "assigned_to")
    list_filter = ("priority", "status", "tenant")
    search_fields = ("title", "description", "property__name", "unit__unit_number")


@admin.register(MaintenanceAttachment)
class MaintenanceAttachmentAdmin(admin.ModelAdmin):
    list_display = ("request", "uploaded_by", "caption", "created_at")
    search_fields = ("caption", "request__title", "uploaded_by__username")


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "property", "unit", "frequency", "next_due_at", "is_active")
    list_filter = ("frequency", "is_active", "tenant")
    search_fields = ("title", "description", "property__name", "unit__unit_number")
