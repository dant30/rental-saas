"""Views for invoices, payments, arrears, and expenses."""

from rest_framework import serializers, viewsets

from apps.properties.permissions import IsTenantAdmin

from .models import Arrear, Expense, Invoice, Payment
from .serializers import ArrearSerializer, ExpenseSerializer, InvoiceSerializer, PaymentSerializer
from .services import (
    get_arrear_queryset_for_user,
    get_expense_queryset_for_user,
    get_invoice_queryset_for_user,
    get_payment_queryset_for_user,
    save_arrear_for_user,
    save_expense_for_user,
    save_invoice_for_user,
    save_payment_for_user,
)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_invoice_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        try:
            save_invoice_for_user(serializer, self.request.user)
        except ValueError as exc:
            raise serializers.ValidationError({"non_field_errors": [str(exc)]}) from exc


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_payment_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_payment_for_user(serializer, self.request.user)


class ArrearViewSet(viewsets.ModelViewSet):
    queryset = Arrear.objects.all()
    serializer_class = ArrearSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_arrear_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_arrear_for_user(serializer, self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_expense_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_expense_for_user(serializer, self.request.user)
