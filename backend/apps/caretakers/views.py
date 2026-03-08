"""Views for caretakers and maintenance operations."""

from rest_framework import serializers, viewsets

from apps.properties.permissions import IsTenantAdmin

from .models import Caretaker, MaintenanceAttachment, MaintenanceRequest, MaintenanceSchedule
from .serializers import (
    CaretakerSerializer,
    MaintenanceAttachmentSerializer,
    MaintenanceRequestSerializer,
    MaintenanceScheduleSerializer,
)
from .services import (
    get_attachment_queryset_for_user,
    get_caretaker_queryset_for_user,
    get_maintenance_request_queryset_for_user,
    get_maintenance_schedule_queryset_for_user,
    save_attachment_for_user,
    save_caretaker_for_user,
    save_maintenance_request_for_user,
    save_maintenance_schedule_for_user,
)


class CaretakerViewSet(viewsets.ModelViewSet):
    queryset = Caretaker.objects.all()
    serializer_class = CaretakerSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_caretaker_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        try:
            save_caretaker_for_user(serializer, self.request.user)
        except ValueError as exc:
            raise serializers.ValidationError({"user": str(exc)}) from exc


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_maintenance_request_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_maintenance_request_for_user(serializer, self.request.user)


class MaintenanceAttachmentViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceAttachment.objects.all()
    serializer_class = MaintenanceAttachmentSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_attachment_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_attachment_for_user(serializer, self.request.user)


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_maintenance_schedule_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_maintenance_schedule_for_user(serializer, self.request.user)
