"""Tests for billing and payment APIs."""

import datetime
from decimal import Decimal

from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.notifications.models import Notification
from apps.payments.models import Expense, Invoice, Payment, PaymentGatewayTransaction
from apps.payments.services import (
    build_aged_receivables_report,
    build_property_profit_and_loss_report,
    build_rent_roll_report,
    generate_monthly_invoices,
)
from apps.payments.tasks import generate_monthly_invoices_task, sync_overdue_invoices_task
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

    def test_recurring_invoice_generation_and_overdue_sync(self):
        generated = generate_monthly_invoices(billing_date=datetime.date(2026, 3, 1), tenant=self.tenant)
        self.assertEqual(len(generated), 1)
        self.assertEqual(Invoice.objects.count(), 1)

        invoice = Invoice.objects.get()
        self.assertEqual(invoice.invoice_number, f"INV-{self.tenant.id}-202603-{self.lease.id}")
        self.assertEqual(invoice.balance_due, Decimal("1200.00"))

        generated_again = generate_monthly_invoices_task()
        self.assertEqual(generated_again, 0)

        invoice.due_date = datetime.date(2026, 3, 1)
        invoice.balance_due = Decimal("1200.00")
        invoice.status = Invoice.InvoiceStatus.OPEN
        invoice.save(update_fields=["due_date", "balance_due", "status", "updated_at"])

        sync_overdue_invoices_task()
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, Invoice.InvoiceStatus.OVERDUE)
        self.assertTrue(self.lease.arrears.exists())
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.resident.user,
                notification_type="payment",
            ).exists()
        )

    def test_reporting_endpoints(self):
        invoice = Invoice.objects.create(
            lease=self.lease,
            resident=self.resident,
            property=self.property,
            unit=self.unit,
            tenant=self.tenant,
            invoice_number="INV-REPORT-1",
            billing_period_start=datetime.date(2026, 3, 1),
            billing_period_end=datetime.date(2026, 3, 31),
            due_date=datetime.date(2026, 3, 5),
            subtotal_amount=Decimal("1200.00"),
            total_amount=Decimal("1200.00"),
            balance_due=Decimal("600.00"),
            status=Invoice.InvoiceStatus.OVERDUE,
        )
        self.client.post(
            "/api/payments/",
            {
                "lease": self.lease.id,
                "invoice": invoice.id,
                "amount": "800.00",
                "payment_date": "2026-03-02",
                "method": "bank_transfer",
                "status": "succeeded",
                "reference": "PAY-REPORT-1",
            },
            format="json",
            **self._headers(),
        )
        self.client.post(
            "/api/expenses/",
            {
                "property": self.property.id,
                "unit": self.unit.id,
                "category": "maintenance",
                "title": "Paint",
                "amount": "300.00",
                "expense_date": "2026-03-10",
            },
            format="json",
            **self._headers(),
        )

        rent_roll = self.client.get("/api/reports/rent-roll/", **self._headers())
        self.assertEqual(rent_roll.status_code, status.HTTP_200_OK)
        self.assertEqual(rent_roll.data["occupied_units"], 1)

        aged = self.client.get("/api/reports/aged-receivables/", **self._headers())
        self.assertEqual(aged.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(Decimal(aged.data["grand_total"]), Decimal("0.00"))

        pnl = self.client.get(
            "/api/reports/property-profit-loss/?start_date=2026-03-01&end_date=2026-03-31",
            **self._headers(),
        )
        self.assertEqual(pnl.status_code, status.HTTP_200_OK)
        self.assertEqual(len(pnl.data["items"]), 1)

        direct_rent_roll = build_rent_roll_report(tenant=self.tenant)
        direct_aged = build_aged_receivables_report(tenant=self.tenant)
        direct_pnl = build_property_profit_and_loss_report(
            tenant=self.tenant,
            start_date=datetime.date(2026, 3, 1),
            end_date=datetime.date(2026, 3, 31),
        )
        self.assertEqual(direct_rent_roll["occupied_units"], 1)
        self.assertIn("grand_total", direct_aged)
        self.assertEqual(len(direct_pnl["items"]), 1)

    def test_mpesa_initiation_and_webhook_callback(self):
        invoice = Invoice.objects.create(
            lease=self.lease,
            resident=self.resident,
            property=self.property,
            unit=self.unit,
            tenant=self.tenant,
            invoice_number="INV-MPESA-1",
            billing_period_start=datetime.date(2026, 3, 1),
            billing_period_end=datetime.date(2026, 3, 31),
            due_date=datetime.date(2026, 3, 5),
            subtotal_amount=Decimal("1200.00"),
            total_amount=Decimal("1200.00"),
            balance_due=Decimal("1200.00"),
            status=Invoice.InvoiceStatus.OPEN,
        )
        response = self.client.post(
            "/api/payments/mpesa/initiate/",
            {
                "lease": self.lease.id,
                "invoice": invoice.id,
                "amount": "1200.00",
                "phone_number": "+254700000001",
            },
            format="json",
            **self._headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["gateway"], PaymentGatewayTransaction.Gateway.MPESA)

        transaction = PaymentGatewayTransaction.objects.get(pk=response.data["id"])
        callback = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": transaction.merchant_request_id,
                    "CheckoutRequestID": transaction.checkout_request_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 1200},
                            {"Name": "MpesaReceiptNumber", "Value": "RCP123456"},
                            {"Name": "PhoneNumber", "Value": 254700000001},
                        ]
                    },
                }
            }
        }
        webhook_response = self.client.post(
            "/api/payments/mpesa/webhook/",
            callback,
            format="json",
            **self._headers(),
        )
        self.assertEqual(webhook_response.status_code, status.HTTP_200_OK)

        transaction.refresh_from_db()
        invoice.refresh_from_db()
        self.assertEqual(transaction.status, PaymentGatewayTransaction.Status.SUCCEEDED)
        self.assertEqual(invoice.status, Invoice.InvoiceStatus.PAID)
        self.assertTrue(Payment.objects.filter(invoice=invoice, method=Payment.PaymentMethod.MOBILE_MONEY).exists())

    def test_bank_payment_recording_endpoint(self):
        invoice = Invoice.objects.create(
            lease=self.lease,
            resident=self.resident,
            property=self.property,
            unit=self.unit,
            tenant=self.tenant,
            invoice_number="INV-BANK-1",
            billing_period_start=datetime.date(2026, 3, 1),
            billing_period_end=datetime.date(2026, 3, 31),
            due_date=datetime.date(2026, 3, 5),
            subtotal_amount=Decimal("1200.00"),
            total_amount=Decimal("1200.00"),
            balance_due=Decimal("1200.00"),
            status=Invoice.InvoiceStatus.OPEN,
        )
        response = self.client.post(
            "/api/payments/bank/record/",
            {
                "lease": self.lease.id,
                "invoice": invoice.id,
                "amount": "1200.00",
                "reference": "BANK-REF-001",
                "bank_name": "KCB",
                "bank_account_name": "Tenant Resident",
                "bank_account_number": "0011223344",
            },
            format="json",
            **self._headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["gateway"], PaymentGatewayTransaction.Gateway.BANK)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, Invoice.InvoiceStatus.PAID)

    def test_expense_receipt_ocr_scan_endpoint(self):
        expense = Expense.objects.create(
            tenant=self.tenant,
            property=self.property,
            unit=self.unit,
            category="maintenance",
            title="Hardware store receipt",
            amount=Decimal("150.00"),
            expense_date=datetime.date(2026, 3, 4),
            vendor_name="BuildMart",
            submitted_by=self.admin_user,
            receipt=SimpleUploadedFile(
                "receipt.txt",
                b"BuildMart\nReceipt 2026-03-04\nKES 150.00\nThank you",
                content_type="text/plain",
            ),
        )
        response = self.client.post(
            f"/api/expenses/{expense.id}/scan_receipt/",
            {"provider": "text"},
            format="json",
            **self._headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.ocr_status, Expense.OCRStatus.SUCCEEDED)
        self.assertEqual(expense.detected_vendor_name, "BuildMart")
        self.assertEqual(expense.detected_amount, Decimal("150.00"))

    def test_failed_mpesa_callback_sets_retry_metadata(self):
        transaction = PaymentGatewayTransaction.objects.create(
            tenant=self.tenant,
            lease=self.lease,
            resident=self.resident,
            invoice=None,
            property=self.property,
            unit=self.unit,
            gateway=PaymentGatewayTransaction.Gateway.MPESA,
            transaction_type=PaymentGatewayTransaction.TransactionType.STK_PUSH,
            status=PaymentGatewayTransaction.Status.PENDING,
            amount=Decimal("1200.00"),
            external_reference="MPESA-FAIL-1",
            merchant_request_id="merchant-fail-1",
            checkout_request_id="checkout-fail-1",
        )
        response = self.client.post(
            "/api/payments/mpesa/webhook/",
            {
                "Body": {
                    "stkCallback": {
                        "MerchantRequestID": "merchant-fail-1",
                        "CheckoutRequestID": "checkout-fail-1",
                        "ResultCode": 1032,
                        "ResultDesc": "Request cancelled by user",
                    }
                }
            },
            format="json",
            **self._headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, PaymentGatewayTransaction.Status.FAILED)
        self.assertEqual(transaction.retry_count, 1)
        self.assertIsNotNone(transaction.next_retry_at)
