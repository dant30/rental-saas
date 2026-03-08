"""Views for account management and role-specific portals."""

from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCaretakerPortalUser, IsOwnerPortalUser, IsTenantPortalUser
from apps.accounts.services import (
    _get_resident_profile,
    build_caretaker_portal_summary,
    build_owner_portal_summary,
    build_tenant_portal_summary,
    get_caretaker_portal_task_queryset,
    get_tenant_portal_invoice_queryset,
    get_tenant_portal_maintenance_queryset,
    get_tenant_portal_payment_queryset,
)
from apps.caretakers.serializers import (
    CaretakerTaskSerializer,
    TenantMaintenanceRequestSerializer,
)
from apps.caretakers.services import save_maintenance_request_for_user
from apps.payments.serializers import InvoiceSerializer, PaymentSerializer
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class TenantPortalSummaryView(APIView):
    permission_classes = [IsTenantPortalUser]

    def get(self, request):
        return Response(build_tenant_portal_summary(user=request.user), status=status.HTTP_200_OK)


class OwnerPortalSummaryView(APIView):
    permission_classes = [IsOwnerPortalUser]

    def get(self, request):
        return Response(build_owner_portal_summary(user=request.user), status=status.HTTP_200_OK)


class CaretakerPortalSummaryView(APIView):
    permission_classes = [IsCaretakerPortalUser]

    def get(self, request):
        return Response(build_caretaker_portal_summary(user=request.user), status=status.HTTP_200_OK)


class TenantPortalInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsTenantPortalUser]

    def get_queryset(self):
        return get_tenant_portal_invoice_queryset(self.request.user)


class TenantPortalPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsTenantPortalUser]

    def get_queryset(self):
        return get_tenant_portal_payment_queryset(self.request.user)


class TenantPortalMaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TenantMaintenanceRequestSerializer
    permission_classes = [IsTenantPortalUser]

    def get_queryset(self):
        return get_tenant_portal_maintenance_queryset(self.request.user)

    def perform_create(self, serializer):
        resident = _get_resident_profile(self.request.user)
        if resident is None:
            raise serializers.ValidationError({"detail": "Only resident accounts can submit maintenance requests."})
        serializer.validated_data["resident"] = resident
        save_maintenance_request_for_user(serializer, self.request.user)


class CaretakerPortalTaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCaretakerPortalUser]
    serializer_class = CaretakerTaskSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return get_caretaker_portal_task_queryset(self.request.user)
