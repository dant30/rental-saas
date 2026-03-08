"""Serializers for tenant signup and tenant objects."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


User = get_user_model()


class TenantSignupSerializer(serializers.Serializer):
    schema_name = serializers.CharField(max_length=63)
    name = serializers.CharField(max_length=255)
    domain = serializers.CharField(max_length=255)
    admin_username = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True, min_length=8)

    def validate_admin_username(self, value: str) -> str:
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate_admin_password(self, value: str) -> str:
        # Enforce Django's password strength validators
        validate_password(value)
        return value


class TenantSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    schema_name = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    created_on = serializers.DateField(read_only=True)
    domain = serializers.CharField(read_only=True)
