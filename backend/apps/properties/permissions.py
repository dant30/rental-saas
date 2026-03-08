"""Permissions for tenant-scoped property APIs."""

from django.db import connection
from rest_framework.permissions import BasePermission, SAFE_METHODS


def _get_current_tenant():
    # django-tenants attaches the current tenant to the DB connection.
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
    """Allows read access for tenant members and write access only for tenant admins."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        return bool(request.user.is_landlord or request.user.is_agency_admin)
