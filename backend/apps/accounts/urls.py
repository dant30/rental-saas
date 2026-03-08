from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CaretakerPortalSummaryView,
    CaretakerPortalTaskViewSet,
    CurrentUserView,
    OwnerPortalSummaryView,
    RegisterView,
    TenantPortalInvoiceViewSet,
    TenantPortalMaintenanceRequestViewSet,
    TenantPortalPaymentViewSet,
    TenantPortalSummaryView,
)


router = DefaultRouter()
router.register(r"portal/tenant/invoices", TenantPortalInvoiceViewSet, basename="portal-tenant-invoice")
router.register(r"portal/tenant/payments", TenantPortalPaymentViewSet, basename="portal-tenant-payment")
router.register(
    r"portal/tenant/maintenance-requests",
    TenantPortalMaintenanceRequestViewSet,
    basename="portal-tenant-maintenance-request",
)
router.register(r"portal/caretaker/tasks", CaretakerPortalTaskViewSet, basename="portal-caretaker-task")


urlpatterns = [
    *router.urls,
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("portal/tenant/summary/", TenantPortalSummaryView.as_view(), name="tenant-portal-summary"),
    path("portal/owner/summary/", OwnerPortalSummaryView.as_view(), name="owner-portal-summary"),
    path("portal/caretaker/summary/", CaretakerPortalSummaryView.as_view(), name="caretaker-portal-summary"),
]
