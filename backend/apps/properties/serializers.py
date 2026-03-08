"""Serializers for property management."""

from rest_framework import serializers

from .models import Document, Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = [
            "id",
            "tenant",
            "property",
            "unit_number",
            "floor",
            "bedrooms",
            "bathrooms",
            "square_feet",
            "rent_amount",
            "deposit_amount",
            "late_fee_amount",
            "status",
            "is_furnished",
            "availability_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_at", "updated_at"]


class PropertySerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)
    occupied_units_count = serializers.ReadOnlyField()
    vacancy_rate = serializers.ReadOnlyField()

    class Meta:
        model = Property
        fields = [
            "id",
            "tenant",
            "name",
            "code",
            "address",
            "property_type",
            "management_type",
            "description",
            "city",
            "state",
            "country",
            "postal_code",
            "bedrooms",
            "bathrooms",
            "year_built",
            "total_units",
            "parking_spaces",
            "lot_size",
            "market_rent",
            "purchase_price",
            "acquisition_date",
            "is_active",
            "occupied_units_count",
            "vacancy_rate",
            "units",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_at", "updated_at"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "tenant",
            "uploaded_by",
            "category",
            "title",
            "description",
            "file",
            "content_type",
            "object_id",
            "is_private",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "uploaded_by", "created_at", "updated_at"]
