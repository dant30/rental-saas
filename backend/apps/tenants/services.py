"""Service layer for tenant management."""

import re

from django.db import transaction

from apps.accounts.models import User

from .models import Domain, Tenant


SCHEMA_NAME_RE = re.compile(r"^[a-z][a-z0-9_]{1,62}$")
DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$",
    re.IGNORECASE,
)

# Common schema names reserved by Postgres and django-tenants
RESERVED_SCHEMA_NAMES = {
    "public",
    "information_schema",
    "pg_catalog",
    "pg_toast",
    "pg_temp_1",
    "pg_toast_temp_1",
}


class TenantSignupError(Exception):
    """Raised when tenant signup fails."""


def _validate_schema_name(schema_name: str) -> None:
    if not schema_name:
        raise TenantSignupError("schema_name is required")
    if not SCHEMA_NAME_RE.match(schema_name):
        raise TenantSignupError(
            "schema_name must start with a letter and contain only lower-case letters, numbers, or underscores (max 63 chars)"
        )
    if schema_name in RESERVED_SCHEMA_NAMES:
        raise TenantSignupError(f"schema_name '{schema_name}' is reserved")


def _validate_domain(domain: str) -> None:
    if not domain:
        raise TenantSignupError("domain is required")
    if domain.lower() in {"localhost", "127.0.0.1"}:
        return
    if not DOMAIN_RE.match(domain):
        raise TenantSignupError("domain must be a valid hostname")


def create_tenant_with_admin(
    schema_name: str,
    name: str,
    domain: str,
    admin_username: str,
    admin_email: str,
    admin_password: str,
) -> tuple[Tenant, User]:
    """Create a new tenant schema and an initial admin user.

    This creates:
    1) Tenant (schema) record
    2) Domain record mapping the domain to the tenant
    3) Admin user tied to the tenant

    This function will also create the tenant schema and run migrations for it.
    """

    _validate_schema_name(schema_name)
    _validate_domain(domain)

    if Tenant.objects.filter(schema_name=schema_name).exists():
        raise TenantSignupError("A tenant with that schema_name already exists")

    if Domain.objects.filter(domain=domain).exists():
        raise TenantSignupError("That domain is already in use")

    with transaction.atomic():
        tenant = Tenant(schema_name=schema_name, name=name)
        tenant.save()

        # Create the tenant schema + run migrations for tenant apps.
        # If `auto_create_schema` is enabled, tenant.save() would already do that;
        # we manage it explicitly so we can handle migrations and fail fast.
        tenant.create_schema(check_if_exists=True)

        Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

        user = User.objects.create_user(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            is_staff=True,
            is_superuser=False,
            is_landlord=True,
            tenant=tenant,
        )

    return tenant, user
