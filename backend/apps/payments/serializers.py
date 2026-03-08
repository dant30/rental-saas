"""Serializers for billing, payments, and expenses."""

from rest_framework import serializers

from .models import Arrear, Expense, Invoice, Payment


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id",
            "tenant",
            "lease",
            "resident",
            "property",
            "unit",
            "invoice_number",
            "billing_period_start",
            "billing_period_end",
            "due_date",
            "subtotal_amount",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "balance_due",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "resident", "property", "unit", "created_at", "updated_at"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "tenant",
            "lease",
            "resident",
            "invoice",
            "property",
            "unit",
            "amount",
            "payment_date",
            "method",
            "status",
            "reference",
            "gateway_transaction_id",
            "received_by",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "resident", "property", "unit", "created_at", "updated_at"]


class ArrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arrear
        fields = [
            "id",
            "tenant",
            "lease",
            "resident",
            "invoice",
            "amount_due",
            "amount_paid",
            "outstanding_amount",
            "status",
            "due_date",
            "resolved_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "resident", "outstanding_amount", "created_at", "updated_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            "id",
            "tenant",
            "property",
            "unit",
            "category",
            "title",
            "description",
            "amount",
            "expense_date",
            "vendor_name",
            "receipt",
            "status",
            "submitted_by",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "submitted_by", "approved_by", "approved_at", "created_at", "updated_at"]
