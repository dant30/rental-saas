"""Tests for billing and payment APIs."""

import datetime

from django.core.management import call_command

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.payments.models import Invoice
from apps.properties.models import Property, Unit
from apps.tenants_app.models import Lease, Resident


class PaymentsAPITests(TenantTestCase):
    @classmethod
    def setup_tenant(cls, tenant):
        tenant.name = "Billing Tenant"
        tenant.auto_create_schema = True

    @staticmethod
    def get_test_schema_name():
        return "payments_test"

    @staticmethod
    def get_test_tenant_domain():
        return "payments.test.com"

    @classmethod
    def setUpClass(cls):
        from django.db import connection
        from django_tenants.utils import schema_exists

        connection.set_schema_to_public()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM tenants_domain WHERE domain = %s", [cls.get_test_tenant_domain()])
            cursor.execute("DELETE FROM tenants_tenant WHERE schema_name = %s", [cls.get_test_schema_name()])
            if schema_exists(cls.get_test_schema_name()):
                cursor.execute(
                    f'DROP SCHEMA IF EXISTS "{cls.get_test_schema_name()}" CASCADE'
                )
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
        self.admin_user = User.objects.create_user(
            username="billing_admin",
            email="billing-admin@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            is_landlord=True,
        )
        self.client.force_authenticate(self.admin_user)

        resident_user = User.objects.create_user(
            username="billing_resident",
            email="billing-resident@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
        )
        self.resident = Resident.objects.create(user=resident_user, phone_number="+254700000001")
        self.property = Property.objects.create(
            tenant=self.tenant,
            name="Billing House",
            property_type="apartment",
            address="123 Billing Street",
        )
        self.unit = Unit.objects.create(
            tenant=self.tenant,
            property=self.property,
            unit_number="B1",
            rent_amount="1200.00",
            deposit_amount="500.00",
            status="occupied",
        )
        self.lease = Lease.objects.create(
            resident=self.resident,
            unit=self.unit,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=365),
            rent_amount="1200.00",
            deposit_amount="500.00",
            status="active",
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
            cursor.execute(
                f"DELETE FROM \"{tenant_table}\" WHERE schema_name = %s",
                [cls.tenant.schema_name],
            )

        try:
            if schema_exists(cls.tenant.schema_name):
                with connection.cursor() as cursor:
                    cursor.execute(
                        f'DROP SCHEMA IF EXISTS "{cls.tenant.schema_name}" CASCADE'
                    )
        except Exception:
            pass

        cls.remove_allowed_test_domain()

    def test_invoice_payment_and_expense_flow(self):
        invoice_payload = {
            "lease": self.lease.id,
            "invoice_number": "INV-1001",
            "billing_period_start": "2026-03-01",
            "billing_period_end": "2026-03-31",
            "due_date": "2026-03-05",
            "subtotal_amount": "1200.00",
            "tax_amount": "0.00",
            "discount_amount": "0.00",
            "total_amount": "1200.00",
            "notes": "March rent",
        }
        invoice_response = self.client.post(
            "/api/invoices/", invoice_payload, format="json", **self._headers()
        )
        self.assertEqual(invoice_response.status_code, status.HTTP_201_CREATED)

        invoice_id = invoice_response.data["id"]
        payment_payload = {
            "lease": self.lease.id,
            "invoice": invoice_id,
            "amount": "1200.00",
            "payment_date": "2026-03-03",
            "method": "bank_transfer",
            "status": "succeeded",
            "reference": "PAY-1001",
        }
        payment_response = self.client.post(
            "/api/payments/", payment_payload, format="json", **self._headers()
        )
        self.assertEqual(payment_response.status_code, status.HTTP_201_CREATED)

        invoice = Invoice.objects.get(pk=invoice_id)
        self.assertEqual(str(invoice.balance_due), "0.00")
        self.assertEqual(invoice.status, Invoice.InvoiceStatus.PAID)

        expense_payload = {
            "property": self.property.id,
            "unit": self.unit.id,
            "category": "maintenance",
            "title": "Plumbing repair",
            "description": "Fixed sink leak",
            "amount": "150.00",
            "expense_date": "2026-03-04",
            "vendor_name": "Tenant Plumbers",
        }
        expense_response = self.client.post(
            "/api/expenses/", expense_payload, format="json", **self._headers()
        )
        self.assertEqual(expense_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get("/api/payments/", **self._headers())
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
