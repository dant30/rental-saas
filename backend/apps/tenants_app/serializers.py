"""Serializers for tenant / renter management."""

from rest_framework import serializers

from apps.tenants_app.models import Lease, Resident


class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = [
            "id",
            "user",
            "phone_number",
            "emergency_contact",
            "date_of_birth",
        ]
        read_only_fields = ["id"]


class LeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = [
            "id",
            "resident",
            "unit",
            "start_date",
            "end_date",
            "rent_amount",
            "deposit_amount",
            "status",
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

        overlapping = Lease.objects.filter(unit=unit)
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        overlapping = overlapping.filter(
            start_date__lte=end or start,
            end_date__gte=start,
        )

        if overlapping.exists():
            raise serializers.ValidationError(
                "This unit already has a lease that overlaps the selected dates."
            )

        return attrs
