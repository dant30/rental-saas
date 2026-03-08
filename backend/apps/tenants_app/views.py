"""Views for tenant / renter management."""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Lease, Resident
from .serializers import LeaseSerializer, ResidentSerializer


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [IsAuthenticated]


class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.all()
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]
