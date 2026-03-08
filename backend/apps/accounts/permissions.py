"""Role-aware permissions for account and portal APIs."""

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import SAFE_METHODS

from apps.properties.permissions import IsTenantMember


def _has_related_profile(user, attr_name: str) -> bool:
    try:
        getattr(user, attr_name)
        return True
    except ObjectDoesNotExist:
        return False


class IsTenantPortalUser(IsTenantMember):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return bool(
            request.user.is_tenant_user
            or _has_related_profile(request.user, "resident_profile")
            or request.user.is_superuser
        )


class IsOwnerPortalUser(IsTenantMember):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return bool(
            request.user.is_landlord
            or request.user.is_owner
            or request.user.is_agency_admin
            or request.user.is_superuser
        )


class IsCaretakerPortalUser(IsTenantMember):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return bool(
            request.user.is_caretaker
            or _has_related_profile(request.user, "caretaker_profile")
            or request.user.is_superuser
        )


class IsPortalReadOnlyOrAdmin(IsOwnerPortalUser):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return IsTenantMember.has_permission(self, request, view)
        return super().has_permission(request, view)
