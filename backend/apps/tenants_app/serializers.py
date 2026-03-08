"""Serializers for tenant / renter management."""

from django.db import models
from rest_framework import serializers

from apps.tenants_app.models import Lease, Resident


class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = [
            "id",
            "user",
            "status",
            "phone_number",
            "alternate_phone_number",
            "emergency_contact",
            "emergency_phone_number",
            "national_id_number",
            "occupation",
            "employer_name",
            "monthly_income",
            "date_of_birth",
            "move_in_date",
            "move_out_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = [
            "id",
            "resident",
            "unit",
            "lease_number",
            "start_date",
            "end_date",
            "move_in_date",
            "move_out_date",
            "rent_amount",
            "deposit_amount",
            "late_fee_amount",
            "billing_cycle",
            "due_day",
            "status",
            "signed_at",
            "terminated_at",
            "termination_reason",
            "terms",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        """Validate that the selected unit does not already have an overlapping lease."""
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        unit = attrs.get("unit")

        if not start or not unit:
            return attrs

        overlapping = Lease.objects.filter(unit=unit).exclude(
            status__in=[Lease.LeaseStatus.TERMINATED, Lease.LeaseStatus.EXPIRED]
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        proposed_end = end or start
        overlapping = overlapping.filter(start_date__lte=proposed_end).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=start)
        )

        if overlapping.exists():
            raise serializers.ValidationError(
                "This unit already has a lease that overlaps the selected dates."
            )

        return attrs
