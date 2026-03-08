"""Tests for role-specific portal APIs."""

import datetime
from decimal import Decimal

from django.core.management import call_command

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.caretakers.models import Caretaker, MaintenanceRequest
from apps.payments.models import Invoice, Payment
from apps.properties.models import Property, Unit
from apps.tenants_app.models import Lease, Resident


class PortalAPITests(TenantTestCase):
    @classmethod
    def setup_tenant(cls, tenant):
        tenant.name = "Portal Tenant"
        tenant.auto_create_schema = True

    @staticmethod
    def get_test_schema_name():
        return "portal_test"

    @staticmethod
    def get_test_tenant_domain():
        return "portal.test.com"

    @classmethod
    def setUpClass(cls):
        from django.db import connection
        from django_tenants.utils import schema_exists

        connection.set_schema_to_public()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM tenants_domain WHERE domain = %s", [cls.get_test_tenant_domain()])
            cursor.execute("DELETE FROM tenants_tenant WHERE schema_name = %s", [cls.get_test_schema_name()])
            if schema_exists(cls.get_test_schema_name()):
                cursor.execute(f'DROP SCHEMA IF EXISTS "{cls.get_test_schema_name()}" CASCADE')
        super().setUpClass()
        call_command(
            "migrate_schemas",
            "--tenant",
            "--schema",
            cls.get_test_schema_name(),
            interactive=False,
            verbosity=0,
        )

    def setUp(self):
        from django.db import connection

        connection.set_tenant(self.tenant)
        self.client = APIClient()
        self.owner_user = User.objects.create_user(
            username="owner_user",
            email="owner@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            user_type=User.UserType.LANDLORD,
        )
        self.caretaker_user = User.objects.create_user(
            username="caretaker_user_portal",
            email="caretaker@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            user_type=User.UserType.CARETAKER,
        )
        self.tenant_user = User.objects.create_user(
            username="tenant_user_portal",
            email="tenant@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            user_type=User.UserType.TENANT,
        )
        self.resident = Resident.objects.create(user=self.tenant_user, phone_number="+254700000111")
        self.property = Property.objects.create(
            tenant=self.tenant,
            name="Portal Heights",
            property_type="apartment",
        )
        self.unit = Unit.objects.create(
            tenant=self.tenant,
            property=self.property,
            unit_number="P1",
            rent_amount="1500.00",
            status="occupied",
        )
        self.lease = Lease.objects.create(
            resident=self.resident,
            unit=self.unit,
            start_date=datetime.date(2026, 3, 1),
            end_date=datetime.date(2027, 2, 28),
            rent_amount="1500.00",
            deposit_amount="500.00",
            status="active",
        )
        self.invoice = Invoice.objects.create(
            lease=self.lease,
            resident=self.resident,
            property=self.property,
            unit=self.unit,
            tenant=self.tenant,
            invoice_number="INV-PORTAL-1",
            billing_period_start=datetime.date(2026, 3, 1),
            billing_period_end=datetime.date(2026, 3, 31),
            due_date=datetime.date(2026, 3, 5),
            subtotal_amount=Decimal("1500.00"),
            total_amount=Decimal("1500.00"),
            balance_due=Decimal("1500.00"),
            status="open",
        )
        Payment.objects.create(
            tenant=self.tenant,
            lease=self.lease,
            resident=self.resident,
            invoice=self.invoice,
            property=self.property,
            unit=self.unit,
            amount=Decimal("500.00"),
            payment_date=datetime.date(2026, 3, 2),
            method=Payment.PaymentMethod.BANK_TRANSFER,
            status=Payment.PaymentStatus.SUCCEEDED,
            reference="PAY-PORTAL-1",
        )
        self.caretaker = Caretaker.objects.create(
            tenant=self.tenant,
            user=self.caretaker_user,
            employee_id="CT-P1",
            status=Caretaker.EmploymentStatus.ACTIVE,
            is_available=True,
        )
        self.request = MaintenanceRequest.objects.create(
            tenant=self.tenant,
            resident=self.resident,
            property=self.property,
            unit=self.unit,
            assigned_to=self.caretaker,
            title="Door repair",
            description="Front door hinge is loose",
            status=MaintenanceRequest.Status.ASSIGNED,
        )

    def _headers(self):
        return {"HTTP_HOST": self.get_test_tenant_domain()}

    @classmethod
    def tearDownClass(cls):
        from django.db import connection
        from django_tenants.utils import schema_exists

        connection.set_schema_to_public()
        if getattr(cls, "domain", None):
            cls.domain.delete()

        tenant_table = cls.tenant._meta.db_table
        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM \"{tenant_table}\" WHERE schema_name = %s", [cls.tenant.schema_name])

        try:
            if schema_exists(cls.tenant.schema_name):
                with connection.cursor() as cursor:
                    cursor.execute(f'DROP SCHEMA IF EXISTS "{cls.tenant.schema_name}" CASCADE')
        except Exception:
            pass

        cls.remove_allowed_test_domain()

    def test_tenant_portal_summary_and_self_service_endpoints(self):
        self.client.force_authenticate(self.tenant_user)

        summary = self.client.get("/api/auth/portal/tenant/summary/", **self._headers())
        self.assertEqual(summary.status_code, status.HTTP_200_OK)
        self.assertEqual(summary.data["resident_id"], self.resident.id)

        invoices = self.client.get("/api/auth/portal/tenant/invoices/", **self._headers())
        self.assertEqual(invoices.status_code, status.HTTP_200_OK)
        self.assertEqual(len(invoices.data), 1)

        create_request = self.client.post(
            "/api/auth/portal/tenant/maintenance-requests/",
            {
                "property": self.property.id,
                "unit": self.unit.id,
                "title": "Window latch issue",
                "description": "Bedroom window latch is broken",
                "priority": "medium",
            },
            format="json",
            **self._headers(),
        )
        self.assertEqual(create_request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_request.data["resident"], self.resident.id)

    def test_owner_and_caretaker_portal_endpoints(self):
        self.client.force_authenticate(self.owner_user)
        owner_summary = self.client.get("/api/auth/portal/owner/summary/", **self._headers())
        self.assertEqual(owner_summary.status_code, status.HTTP_200_OK)
        self.assertEqual(owner_summary.data["property_count"], 1)

        self.client.force_authenticate(self.caretaker_user)
        caretaker_summary = self.client.get("/api/auth/portal/caretaker/summary/", **self._headers())
        self.assertEqual(caretaker_summary.status_code, status.HTTP_200_OK)
        self.assertEqual(caretaker_summary.data["assigned_open_count"], 1)

        tasks = self.client.get("/api/auth/portal/caretaker/tasks/", **self._headers())
        self.assertEqual(tasks.status_code, status.HTTP_200_OK)
        self.assertEqual(len(tasks.data), 1)

        task_update = self.client.patch(
            f"/api/auth/portal/caretaker/tasks/{self.request.id}/",
            {"status": "in_progress", "internal_notes": "Visited site and ordered hinges."},
            format="json",
            **self._headers(),
        )
        self.assertEqual(task_update.status_code, status.HTTP_200_OK)
