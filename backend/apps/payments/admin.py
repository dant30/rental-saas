from django.contrib import admin

from .models import Arrear, Expense, Invoice, Payment


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "tenant", "resident", "total_amount", "balance_due", "status", "due_date")
    list_filter = ("status", "tenant")
    search_fields = ("invoice_number", "resident__user__username", "resident__user__email")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("reference", "tenant", "resident", "amount", "method", "status", "payment_date")
    list_filter = ("status", "method", "tenant")
    search_fields = ("reference", "gateway_transaction_id", "resident__user__username", "resident__user__email")


@admin.register(Arrear)
class ArrearAdmin(admin.ModelAdmin):
    list_display = ("resident", "tenant", "amount_due", "amount_paid", "outstanding_amount", "status", "due_date")
    list_filter = ("status", "tenant")
    search_fields = ("resident__user__username", "resident__user__email")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "property", "category", "amount", "status", "expense_date")
    list_filter = ("category", "status", "tenant")
    search_fields = ("title", "vendor_name", "property__name")
