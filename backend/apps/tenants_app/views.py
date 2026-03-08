"""Views for tenant / renter management."""

from rest_framework import serializers, viewsets

from .models import Lease, Resident
from .permissions import IsTenantAdmin
from .serializers import LeaseSerializer, ResidentSerializer
from .services import (
    get_lease_queryset_for_user,
    get_resident_queryset_for_user,
    save_lease_for_user,
    save_resident_for_user,
)


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_resident_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        try:
            save_resident_for_user(serializer, self.request.user)
        except ValueError as exc:
            raise serializers.ValidationError({"user": str(exc)}) from exc


class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.all()
    serializer_class = LeaseSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_lease_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        try:
            save_lease_for_user(serializer, self.request.user)
        except ValueError as exc:
            raise serializers.ValidationError({"non_field_errors": [str(exc)]}) from exc
