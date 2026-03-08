"""Serializers for the accounts app."""

from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "tenant",
            "user_type",
            "job_title",
            "is_landlord",
            "is_agency_admin",
            "is_owner",
            "is_tenant_user",
            "is_caretaker",
            "avatar",
            "last_seen_at",
        ]
        read_only_fields = [
            "id",
            "tenant",
            "is_landlord",
            "is_agency_admin",
            "is_owner",
            "is_tenant_user",
            "is_caretaker",
            "last_seen_at",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone_number",
            "password",
            "first_name",
            "last_name",
            "user_type",
            "job_title",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
