"""Audit tenant-scoped schemas for cross-tenant integrity drift."""

from dataclasses import dataclass, field

from django.core.management.base import BaseCommand, CommandError
from django_tenants.utils import tenant_context

from apps.accounts.models import User
from apps.caretakers.models import Caretaker, MaintenanceRequest, MaintenanceSchedule
from apps.notifications.models import Conversation, Notification
from apps.payments.models import Expense, Invoice, Payment, PaymentGatewayTransaction
from apps.properties.models import Property, Unit
from apps.tenants.models import Tenant
from apps.tenants_app.models import Lease, Resident


@dataclass
class AuditIssue:
    category: str
    object_label: str
    detail: str


@dataclass
class TenantAuditSummary:
    schema_name: str
    issues: list[AuditIssue] = field(default_factory=list)


class Command(BaseCommand):
    help = "Audit tenant schemas for cross-tenant linkage drift and report integrity issues."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fail-on-issues",
            action="store_true",
            help="Exit with a non-zero status if any audit issue is detected.",
        )

    def handle(self, *args, **options):
        existing_schemas = self._get_existing_schemas()
        summaries = []
        for tenant in Tenant.objects.exclude(schema_name="public").order_by("schema_name"):
            summaries.append(self._audit_tenant(tenant, existing_schemas))

        total_issues = sum(len(summary.issues) for summary in summaries)
        for summary in summaries:
            self.stdout.write(f"[{summary.schema_name}] issues={len(summary.issues)}")
            for issue in summary.issues:
                self.stdout.write(f"  - {issue.category}: {issue.object_label} -> {issue.detail}")

        if total_issues == 0:
            self.stdout.write(self.style.SUCCESS("Tenant isolation audit passed with no issues detected."))
            return

        message = f"Tenant isolation audit detected {total_issues} issue(s)."
        if options["fail_on_issues"]:
            raise CommandError(message)
        self.stdout.write(self.style.WARNING(message))

    def _audit_tenant(self, tenant, existing_schemas):
        summary = TenantAuditSummary(schema_name=tenant.schema_name)
        if tenant.schema_name not in existing_schemas:
            summary.issues.append(
                AuditIssue("schema", f"tenant:{tenant.pk}", f"schema '{tenant.schema_name}' does not exist")
            )
            return summary
        with tenant_context(tenant):
            self._audit_users(tenant, summary)
            self._audit_properties(tenant, summary)
            self._audit_units(tenant, summary)
            self._audit_residents_and_leases(tenant, summary)
            self._audit_payments(tenant, summary)
            self._audit_maintenance(tenant, summary)
            self._audit_notifications(tenant, summary)
        return summary

    def _get_existing_schemas(self):
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute("select schema_name from information_schema.schemata")
            return {row[0] for row in cursor.fetchall()}

    def _audit_users(self, tenant, summary):
        for user in User.objects.exclude(tenant_id=tenant.pk):
            summary.issues.append(
                AuditIssue("user", f"user:{user.pk}", f"user tenant_id={user.tenant_id} expected {tenant.pk}")
            )

    def _audit_properties(self, tenant, summary):
        for prop in Property.objects.exclude(tenant_id=tenant.pk):
            summary.issues.append(
                AuditIssue("property", f"property:{prop.pk}", f"property tenant_id={prop.tenant_id} expected {tenant.pk}")
            )

    def _audit_units(self, tenant, summary):
        for unit in Unit.objects.select_related("property"):
            if unit.tenant_id != tenant.pk:
                summary.issues.append(
                    AuditIssue("unit", f"unit:{unit.pk}", f"unit tenant_id={unit.tenant_id} expected {tenant.pk}")
                )
            if unit.property_id and unit.tenant_id != unit.property.tenant_id:
                summary.issues.append(
                    AuditIssue("unit", f"unit:{unit.pk}", "unit tenant does not match property tenant")
                )

    def _audit_residents_and_leases(self, tenant, summary):
        for resident in Resident.objects.select_related("user"):
            if resident.user.tenant_id != tenant.pk:
                summary.issues.append(
                    AuditIssue("resident", f"resident:{resident.pk}", "resident user tenant mismatch")
                )
        for lease in Lease.objects.select_related("resident__user", "unit"):
            if lease.unit.tenant_id != lease.resident.user.tenant_id:
                summary.issues.append(
                    AuditIssue("lease", f"lease:{lease.pk}", "lease unit tenant does not match resident user tenant")
                )

    def _audit_payments(self, tenant, summary):
        for invoice in Invoice.objects.select_related("lease__unit", "resident__user"):
            if invoice.tenant_id != tenant.pk:
                summary.issues.append(
                    AuditIssue("invoice", f"invoice:{invoice.pk}", f"invoice tenant_id={invoice.tenant_id} expected {tenant.pk}")
                )
            if invoice.lease.unit.tenant_id != invoice.tenant_id:
                summary.issues.append(
                    AuditIssue("invoice", f"invoice:{invoice.pk}", "invoice tenant does not match lease unit tenant")
                )
        for payment in Payment.objects.select_related("lease__unit", "resident__user", "invoice"):
            if payment.tenant_id != tenant.pk:
                summary.issues.append(
                    AuditIssue("payment", f"payment:{payment.pk}", f"payment tenant_id={payment.tenant_id} expected {tenant.pk}")
                )
            if payment.invoice_id and payment.invoice.tenant_id != payment.tenant_id:
                summary.issues.append(
                    AuditIssue("payment", f"payment:{payment.pk}", "payment invoice tenant mismatch")
                )
        for expense in Expense.objects.select_related("property"):
            if expense.tenant_id != expense.property.tenant_id:
                summary.issues.append(
                    AuditIssue("expense", f"expense:{expense.pk}", "expense tenant does not match property tenant")
                )
        for gateway in PaymentGatewayTransaction.objects.select_related("lease__unit", "payment"):
            if gateway.lease.unit.tenant_id != gateway.tenant_id:
                summary.issues.append(
                    AuditIssue("gateway", f"gateway:{gateway.pk}", "gateway tenant does not match lease unit tenant")
                )
            if gateway.payment_id and gateway.payment.tenant_id != gateway.tenant_id:
                summary.issues.append(
                    AuditIssue("gateway", f"gateway:{gateway.pk}", "gateway payment tenant mismatch")
                )

    def _audit_maintenance(self, tenant, summary):
        for caretaker in Caretaker.objects.select_related("user"):
            if caretaker.user.tenant_id != tenant.pk:
                summary.issues.append(
                    AuditIssue("caretaker", f"caretaker:{caretaker.pk}", "caretaker user tenant mismatch")
                )
        for request in MaintenanceRequest.objects.select_related("property", "unit", "resident__user", "assigned_to"):
            if request.property.tenant_id != request.tenant_id:
                summary.issues.append(
                    AuditIssue("maintenance_request", f"request:{request.pk}", "request tenant does not match property tenant")
                )
            if request.resident_id and request.resident.user.tenant_id != request.tenant_id:
                summary.issues.append(
                    AuditIssue("maintenance_request", f"request:{request.pk}", "request resident tenant mismatch")
                )
            if request.assigned_to_id and request.assigned_to.tenant_id != request.tenant_id:
                summary.issues.append(
                    AuditIssue("maintenance_request", f"request:{request.pk}", "request caretaker tenant mismatch")
                )
        for schedule in MaintenanceSchedule.objects.select_related("property", "assigned_to"):
            if schedule.property.tenant_id != schedule.tenant_id:
                summary.issues.append(
                    AuditIssue("maintenance_schedule", f"schedule:{schedule.pk}", "schedule tenant mismatch")
                )
            if schedule.assigned_to_id and schedule.assigned_to.tenant_id != schedule.tenant_id:
                summary.issues.append(
                    AuditIssue("maintenance_schedule", f"schedule:{schedule.pk}", "schedule caretaker tenant mismatch")
                )

    def _audit_notifications(self, tenant, summary):
        for notification in Notification.objects.select_related("recipient"):
            if notification.recipient.tenant_id != notification.tenant_id:
                summary.issues.append(
                    AuditIssue("notification", f"notification:{notification.pk}", "notification recipient tenant mismatch")
                )
        for conversation in Conversation.objects.prefetch_related("participants"):
            for participant in conversation.participants.all():
                if participant.tenant_id != conversation.tenant_id:
                    summary.issues.append(
                        AuditIssue("conversation", f"conversation:{conversation.pk}", "conversation participant tenant mismatch")
                    )
