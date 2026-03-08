"""Views for invoices, payments, arrears, expenses, gateways, and reporting."""

from rest_framework import permissions
from django.utils.dateparse import parse_date
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.properties.permissions import IsTenantAdmin

from .models import Arrear, Expense, Invoice, Payment, PaymentGatewayTransaction
from .serializers import (
    ArrearSerializer,
    BankPaymentSerializer,
    ExpenseSerializer,
    ExpenseOCRScanSerializer,
    InvoiceSerializer,
    MpesaSTKPushSerializer,
    PaymentGatewayTransactionSerializer,
    PaymentSerializer,
)
from .services import (
    build_aged_receivables_report,
    build_property_profit_and_loss_report,
    build_rent_roll_report,
    get_arrear_queryset_for_user,
    get_expense_queryset_for_user,
    get_gateway_transaction_queryset_for_user,
    get_invoice_queryset_for_user,
    get_payment_queryset_for_user,
    initiate_mpesa_stk_push,
    process_mpesa_callback,
    record_bank_payment,
    retry_gateway_transaction,
    save_arrear_for_user,
    save_expense_for_user,
    save_invoice_for_user,
    save_payment_for_user,
    scan_expense_receipt,
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


class PaymentGatewayTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentGatewayTransaction.objects.all()
    serializer_class = PaymentGatewayTransactionSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_gateway_transaction_queryset_for_user(self.request.user)

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        transaction = self.get_object()
        transaction = retry_gateway_transaction(transaction=transaction)
        return Response(self.get_serializer(transaction).data, status=status.HTTP_200_OK)


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

    @action(detail=True, methods=["post"])
    def scan_receipt(self, request, pk=None):
        expense = self.get_object()
        serializer = ExpenseOCRScanSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        try:
            expense = scan_expense_receipt(expense=expense, provider=serializer.validated_data.get("provider"))
        except Exception as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc
        return Response(self.get_serializer(expense).data, status=status.HTTP_200_OK)


class RentRollReportView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request):
        property_id = request.query_params.get("property_id")
        payload = build_rent_roll_report(
            tenant=request.user.tenant,
            property_id=property_id,
        )
        return Response(payload, status=status.HTTP_200_OK)


class AgedReceivablesReportView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request):
        property_id = request.query_params.get("property_id")
        payload = build_aged_receivables_report(
            tenant=request.user.tenant,
            property_id=property_id,
        )
        return Response(payload, status=status.HTTP_200_OK)


class PropertyProfitLossReportView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request):
        start_date = parse_date(request.query_params.get("start_date", ""))
        end_date = parse_date(request.query_params.get("end_date", ""))
        if not start_date or not end_date:
            raise serializers.ValidationError(
                {"detail": "start_date and end_date query params are required in YYYY-MM-DD format."}
            )

        property_id = request.query_params.get("property_id")
        payload = build_property_profit_and_loss_report(
            tenant=request.user.tenant,
            start_date=start_date,
            end_date=end_date,
            property_id=property_id,
        )
        return Response(payload, status=status.HTTP_200_OK)


class MpesaSTKPushView(APIView):
    permission_classes = [IsTenantAdmin]

    def post(self, request):
        serializer = MpesaSTKPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            transaction = initiate_mpesa_stk_push(user=request.user, **serializer.validated_data)
        except Exception as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc
        payload = PaymentGatewayTransactionSerializer(transaction).data
        return Response(payload, status=status.HTTP_201_CREATED)


class BankPaymentCaptureView(APIView):
    permission_classes = [IsTenantAdmin]

    def post(self, request):
        serializer = BankPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            transaction = record_bank_payment(user=request.user, **serializer.validated_data)
        except Exception as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc
        payload = PaymentGatewayTransactionSerializer(transaction).data
        return Response(payload, status=status.HTTP_201_CREATED)


class MpesaWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            transaction = process_mpesa_callback(callback_payload=request.data)
        except Exception as exc:
            return Response(
                {
                    "ResultCode": 1,
                    "ResultDesc": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": "Accepted",
                "transaction_id": transaction.pk,
                "status": transaction.status,
            },
            status=status.HTTP_200_OK,
        )
