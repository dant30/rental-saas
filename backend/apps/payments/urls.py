"""Routes for payment and billing API."""

from rest_framework.routers import DefaultRouter

from .views import ArrearViewSet, ExpenseViewSet, InvoiceViewSet, PaymentViewSet


router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"arrears", ArrearViewSet, basename="arrear")
router.register(r"expenses", ExpenseViewSet, basename="expense")

urlpatterns = router.urls
