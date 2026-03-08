"""Routes for payment, billing, and reporting API."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AgedReceivablesReportView,
    ArrearViewSet,
    BankPaymentCaptureView,
    ExpenseViewSet,
    InvoiceViewSet,
    MpesaSTKPushView,
    MpesaWebhookView,
    PaymentViewSet,
    PaymentGatewayTransactionViewSet,
    PropertyProfitLossReportView,
    RentRollReportView,
)


router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"payment-gateway-transactions", PaymentGatewayTransactionViewSet, basename="payment-gateway-transaction")
router.register(r"arrears", ArrearViewSet, basename="arrear")
router.register(r"expenses", ExpenseViewSet, basename="expense")

urlpatterns = [
    *router.urls,
    path("payments/mpesa/initiate/", MpesaSTKPushView.as_view(), name="payment-mpesa-initiate"),
    path("payments/bank/record/", BankPaymentCaptureView.as_view(), name="payment-bank-record"),
    path("payments/mpesa/webhook/", MpesaWebhookView.as_view(), name="payment-mpesa-webhook"),
    path("reports/rent-roll/", RentRollReportView.as_view(), name="report-rent-roll"),
    path("reports/aged-receivables/", AgedReceivablesReportView.as_view(), name="report-aged-receivables"),
    path("reports/property-profit-loss/", PropertyProfitLossReportView.as_view(), name="report-property-profit-loss"),
]
