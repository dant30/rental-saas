"""Serializers for billing, payments, and expenses."""

from rest_framework import serializers

from .models import Arrear, Expense, Invoice, Payment, PaymentGatewayTransaction


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


class PaymentGatewayTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGatewayTransaction
        fields = [
            "id",
            "tenant",
            "payment",
            "lease",
            "resident",
            "invoice",
            "property",
            "unit",
            "gateway",
            "transaction_type",
            "status",
            "amount",
            "currency",
            "phone_number",
            "account_reference",
            "external_reference",
            "merchant_request_id",
            "checkout_request_id",
            "gateway_transaction_id",
            "bank_name",
            "bank_account_name",
            "bank_account_number",
            "result_code",
            "result_description",
            "request_payload",
            "callback_payload",
            "processed_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "tenant",
            "resident",
            "property",
            "unit",
            "merchant_request_id",
            "checkout_request_id",
            "gateway_transaction_id",
            "result_code",
            "result_description",
            "request_payload",
            "callback_payload",
            "processed_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]


class MpesaSTKPushSerializer(serializers.Serializer):
    lease = serializers.PrimaryKeyRelatedField(queryset=Payment._meta.get_field("lease").remote_field.model.objects.all())
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(),
        required=False,
        allow_null=True,
    )
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    phone_number = serializers.CharField(max_length=30)
    account_reference = serializers.CharField(max_length=120, required=False, allow_blank=True)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)


class BankPaymentSerializer(serializers.Serializer):
    lease = serializers.PrimaryKeyRelatedField(queryset=Payment._meta.get_field("lease").remote_field.model.objects.all())
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(),
        required=False,
        allow_null=True,
    )
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_date = serializers.DateField(required=False)
    reference = serializers.CharField(max_length=120)
    bank_name = serializers.CharField(max_length=255)
    bank_account_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bank_account_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


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
