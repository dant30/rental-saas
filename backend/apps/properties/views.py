"""API views for managing properties, units, and documents."""

from rest_framework import viewsets

from .models import Document, Property, Unit
from .permissions import IsTenantAdmin
from .serializers import DocumentSerializer, PropertySerializer, UnitSerializer
from .services import (
    get_document_queryset_for_user,
    get_property_queryset_for_user,
    get_unit_queryset_for_user,
    save_document_for_user,
    save_property_for_user,
    save_unit_for_user,
)


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_property_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_property_for_user(serializer, self.request.user)


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_unit_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_unit_for_user(serializer, self.request.user)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_document_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_document_for_user(serializer, self.request.user)
