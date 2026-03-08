"""Permissions for tenant-specific rental management endpoints."""

from django.db import connection
from rest_framework.permissions import BasePermission, SAFE_METHODS


def _get_current_tenant():
    # django-tenants attaches the current tenant to the db connection
    return getattr(connection, "tenant", None)


class IsTenantMember(BasePermission):
    """Allows access only to users belonging to the current tenant."""

    def has_permission(self, request, view):
        if not getattr(request, "user", None) or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        current_tenant = _get_current_tenant()
        if current_tenant is None:
            return False

        return request.user.tenant_id == current_tenant.pk


class IsTenantAdmin(IsTenantMember):
    """Allows access to tenant staff (landlords/agency admins) for unsafe methods."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        # Read-only operations are permitted for any tenant member.
        if request.method in SAFE_METHODS:
            return True

        # Only tenant admins may perform write operations.
        if request.user.is_superuser:
            return True

        return bool(request.user.is_landlord or request.user.is_agency_admin)
