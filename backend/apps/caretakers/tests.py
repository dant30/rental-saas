"""Tests for caretaker and maintenance APIs."""

from django.core.management import call_command

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.caretakers.models import MaintenanceRequest
from apps.properties.models import Property, Unit
from apps.tenants_app.models import Resident


class CaretakerAPITests(TenantTestCase):
    @classmethod
    def setup_tenant(cls, tenant):
        tenant.name = "Maintenance Tenant"
        tenant.auto_create_schema = True

    @staticmethod
    def get_test_schema_name():
        return "caretakers_test"

    @staticmethod
    def get_test_tenant_domain():
        return "caretakers.test.com"

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
            username="maintenance_admin",
            email="maintenance-admin@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            is_landlord=True,
        )
        self.caretaker_user = User.objects.create_user(
            username="caretaker_user",
            email="caretaker@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
        )
        resident_user = User.objects.create_user(
            username="maintenance_resident",
            email="maintenance-resident@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
        )
        self.resident = Resident.objects.create(user=resident_user)
        self.property = Property.objects.create(
            tenant=self.tenant,
            name="Maintenance Court",
            property_type="apartment",
        )
        self.unit = Unit.objects.create(
            tenant=self.tenant,
            property=self.property,
            unit_number="M1",
            status="occupied",
        )
        self.client.force_authenticate(self.admin_user)

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

    def test_caretaker_and_maintenance_request_flow(self):
        caretaker_payload = {
            "user": self.caretaker_user.id,
            "employee_id": "CT-01",
            "phone_number": "+254700000002",
            "skills": "Electrical, Plumbing",
            "service_areas": "Nairobi",
            "max_open_tasks": 5,
            "is_available": True,
            "status": "active",
        }
        caretaker_response = self.client.post(
            "/api/caretakers/", caretaker_payload, format="json", **self._headers()
        )
        self.assertEqual(caretaker_response.status_code, status.HTTP_201_CREATED)

        request_payload = {
            "resident": self.resident.id,
            "property": self.property.id,
            "unit": self.unit.id,
            "assigned_to": caretaker_response.data["id"],
            "title": "Broken tap",
            "description": "Kitchen tap leaking",
            "priority": "high",
            "status": "assigned",
        }
        request_response = self.client.post(
            "/api/maintenance-requests/", request_payload, format="json", **self._headers()
        )
        self.assertEqual(request_response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(request_response.data["assigned_at"])

        schedule_payload = {
            "property": self.property.id,
            "unit": self.unit.id,
            "assigned_to": caretaker_response.data["id"],
            "title": "Water tank inspection",
            "description": "Monthly water system check",
            "frequency": "monthly",
            "next_due_at": "2026-04-01",
            "is_active": True,
        }
        schedule_response = self.client.post(
            "/api/maintenance-schedules/", schedule_payload, format="json", **self._headers()
        )
        self.assertEqual(schedule_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MaintenanceRequest.objects.count(), 1)
