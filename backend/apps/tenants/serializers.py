"""Serializers for tenant signup and tenant objects."""

from rest_framework import serializers


class TenantSignupSerializer(serializers.Serializer):
    schema_name = serializers.CharField(max_length=63)
    name = serializers.CharField(max_length=255)
    domain = serializers.CharField(max_length=255)
    admin_username = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True, min_length=8)


class TenantSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    schema_name = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    created_on = serializers.DateField(read_only=True)
    domain = serializers.CharField(read_only=True)
