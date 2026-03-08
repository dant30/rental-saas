"""Views for tenant / renter management."""

from rest_framework import viewsets

from .models import Lease, Resident
from .permissions import IsTenantAdmin
from .serializers import LeaseSerializer, ResidentSerializer


class ResidentViewSet(viewsets.ModelViewSet):
    """CRUD for renter profiles within a tenant."""

    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        # Ensure only residents for the current tenant are returned.
        return Resident.objects.filter(user__tenant_id=self.request.user.tenant_id)


class LeaseViewSet(viewsets.ModelViewSet):
    """CRUD for leases attached to a tenant's units."""

    queryset = Lease.objects.all()
    serializer_class = LeaseSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return Lease.objects.filter(resident__user__tenant_id=self.request.user.tenant_id)
