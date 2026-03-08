"""Serializers for caretaker and maintenance workflows."""

from rest_framework import serializers

from .models import Caretaker, MaintenanceAttachment, MaintenanceRequest, MaintenanceSchedule


class CaretakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caretaker
        fields = [
            "id",
            "tenant",
            "user",
            "employee_id",
            "phone_number",
            "bio",
            "skills",
            "service_areas",
            "hourly_rate",
            "max_open_tasks",
            "is_available",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_at", "updated_at"]


class MaintenanceAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceAttachment
        fields = ["id", "request", "uploaded_by", "file", "caption", "created_at", "updated_at"]
        read_only_fields = ["id", "uploaded_by", "created_at", "updated_at"]


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    attachments = MaintenanceAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "tenant",
            "resident",
            "property",
            "unit",
            "assigned_to",
            "title",
            "description",
            "priority",
            "status",
            "reported_by",
            "assigned_at",
            "completed_at",
            "estimated_cost",
            "actual_cost",
            "access_notes",
            "internal_notes",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "reported_by", "assigned_at", "completed_at", "created_at", "updated_at"]


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceSchedule
        fields = [
            "id",
            "tenant",
            "property",
            "unit",
            "assigned_to",
            "title",
            "description",
            "frequency",
            "last_done_at",
            "next_due_at",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_at", "updated_at"]
