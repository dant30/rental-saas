from django.contrib import admin

from .models import Lease, Resident


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "phone_number", "occupation", "move_in_date", "move_out_date")
    list_filter = ("status",)
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "national_id_number")


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ("lease_number", "resident", "unit", "status", "start_date", "end_date", "rent_amount")
    list_filter = ("status", "billing_cycle")
    search_fields = ("lease_number", "resident__user__username", "resident__user__email", "unit__unit_number", "unit__property__name")
