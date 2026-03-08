"""Repair stale tenant records and missing schema metadata."""

from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import connection, transaction

from apps.tenants.models import Domain, Tenant


@dataclass
class TenantAuditResult:
    tenant_id: int
    schema_name: str
    name: str
    schema_exists: bool
    slug_missing: bool


class Command(BaseCommand):
    help = (
        "Audit tenant rows against PostgreSQL schemas, repair missing slugs, "
        "and optionally delete stale tenant/domain records whose schemas no longer exist."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Persist the planned repairs instead of running in dry-run mode.",
        )
        parser.add_argument(
            "--delete-missing",
            action="store_true",
            help="Delete tenant/domain records for schemas that do not exist.",
        )
        parser.add_argument(
            "--repair-slugs",
            action="store_true",
            help="Populate missing tenant slugs using the model save logic.",
        )

    def handle(self, *args, **options):
        apply_changes = options["apply"]
        delete_missing = options["delete_missing"]
        repair_slugs = options["repair_slugs"]

        if not delete_missing and not repair_slugs:
            delete_missing = True
            repair_slugs = True

        audit = self._audit_tenants()
        if not audit:
            self.stdout.write(self.style.SUCCESS("No tenant rows found."))
            return

        missing_schema = [row for row in audit if not row.schema_exists]
        missing_slug = [row for row in audit if row.slug_missing]

        self.stdout.write("Tenant audit summary:")
        for row in audit:
            self.stdout.write(
                f"- id={row.tenant_id} schema={row.schema_name} "
                f"schema_exists={row.schema_exists} slug_missing={row.slug_missing}"
            )

        if not apply_changes:
            self.stdout.write(self.style.WARNING("Dry run only. Re-run with --apply to persist changes."))
            return

        if repair_slugs and missing_slug:
            repaired = 0
            for row in missing_slug:
                tenant = Tenant.objects.get(pk=row.tenant_id)
                tenant.save()
                repaired += 1
            self.stdout.write(self.style.SUCCESS(f"Repaired slugs for {repaired} tenant(s)."))

        if delete_missing and missing_schema:
            deleted = self._delete_stale_tenants(missing_schema)
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} stale tenant record(s)."))

        self.stdout.write(self.style.SUCCESS("Tenant schema repair completed."))

    def _audit_tenants(self):
        existing_schemas = self._get_existing_schemas()
        return [
            TenantAuditResult(
                tenant_id=tenant.pk,
                schema_name=tenant.schema_name,
                name=tenant.name,
                schema_exists=tenant.schema_name in existing_schemas,
                slug_missing=not bool(tenant.slug),
            )
            for tenant in Tenant.objects.order_by("pk")
        ]

    def _get_existing_schemas(self):
        with connection.cursor() as cursor:
            cursor.execute("select schema_name from information_schema.schemata")
            return {row[0] for row in cursor.fetchall()}

    def _delete_stale_tenants(self, audit_rows):
        tenant_ids = [row.tenant_id for row in audit_rows]
        schema_names = [row.schema_name for row in audit_rows]
        tenant_table = Tenant._meta.db_table
        domain_table = Domain._meta.db_table
        user_table = get_user_model()._meta.db_table

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    f'UPDATE "{user_table}" SET tenant_id = NULL WHERE tenant_id = ANY(%s)',
                    [tenant_ids],
                )
                cursor.execute(
                    f'DELETE FROM "{domain_table}" WHERE tenant_id = ANY(%s)',
                    [tenant_ids],
                )
                cursor.execute(
                    f'DELETE FROM "{tenant_table}" WHERE id = ANY(%s)',
                    [tenant_ids],
                )

        for schema_name in schema_names:
            self.stdout.write(
                self.style.WARNING(
                    f"Removed stale tenant metadata for missing schema '{schema_name}'."
                )
            )
        return len(tenant_ids)
