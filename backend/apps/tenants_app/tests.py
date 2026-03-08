"""Tests for tenant/renter and lease APIs."""

import datetime

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.properties.models import Property, Unit
from apps.tenants_app.models import Resident


class TenantRentalAPITests(TenantTestCase):
    """Test tenant-scoped renter and lease management endpoints."""

    @classmethod
    def setup_tenant(cls, tenant):
        # Ensure the tenant schema is created when the tenant is saved.
        tenant.auto_create_schema = True

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Make sure tenant schema has all migrations applied.
        from django.core.management import call_command

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

        # Ensure the test runs within the tenant schema.
        connection.set_tenant(self.tenant)

        self.client = APIClient()

        # A tenant admin user (landlord) used for API calls.
        self.admin_user = User.objects.create_user(
            username="landlord",
            email="landlord@tenant.test.com",
            password="SuperSecret123",
            tenant=self.tenant,
            is_landlord=True,
        )
        self.client.force_authenticate(self.admin_user)

        # Create a resident user and basic property/unit data.
        self.resident_user = User.objects.create_user(
            username="resident",
            email="resident@tenant.test.com",
            password="SuperSecret123",
            tenant=self.tenant,
        )

        self.property = Property.objects.create(
            tenant=self.tenant,
            name="Tenant Property",
            address="100 Tenant Ave",
            property_type="apartment",
            description="Test property",
        )
        self.unit = Unit.objects.create(
            tenant=self.tenant,
            property=self.property,
            unit_number="101",
            bedrooms=1,
            rent_amount="1100.00",
            deposit_amount="550.00",
            status="vacant",
        )

    @classmethod
    def tearDownClass(cls):
        from django.db import connection
        from django_tenants.utils import schema_exists

        # Clean up shared objects and tenant record (without cascading into the tenant schema).
        connection.set_schema_to_public()
        cls.domain.delete()

        # Remove the tenant record directly to avoid cascade deletion tries on tenant schema tables.
        tenant_table = cls.tenant._meta.db_table
        with connection.cursor() as cursor:
            cursor.execute(
                f"DELETE FROM \"{tenant_table}\" WHERE schema_name = %s",
                [cls.tenant.schema_name],
            )

        # Drop the tenant schema after the test is finished.
        try:
            if schema_exists(cls.tenant.schema_name):
                with connection.cursor() as cursor:
                    cursor.execute(
                        f'DROP SCHEMA IF EXISTS "{cls.tenant.schema_name}" CASCADE'
                    )
        except Exception:
            pass

        cls.remove_allowed_test_domain()

    def _tenant_headers(self):
        return {"HTTP_HOST": self.get_test_tenant_domain()}

    def test_resident_crud(self):
        # Create a new resident record.
        payload = {
            "user": self.resident_user.id,
            "phone_number": "555-1234",
            "emergency_contact": "Emergency Contact",
            "date_of_birth": "1990-01-01",
        }
        response = self.client.post(
            "/api/tenants/residents/", payload, format="json", **self._tenant_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["phone_number"], payload["phone_number"])

        resident_id = response.data["id"]

        # List residents (should include the one we created)
        list_response = self.client.get(
            "/api/tenants/residents/", **self._tenant_headers()
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(r["id"] == resident_id for r in list_response.data))

        # Update resident
        update_response = self.client.patch(
            f"/api/tenants/residents/{resident_id}/",
            {"phone_number": "555-4321"},
            format="json",
            **self._tenant_headers(),
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["phone_number"], "555-4321")

        # Delete resident
        delete_response = self.client.delete(
            f"/api/tenants/residents/{resident_id}/", **self._tenant_headers()
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_lease_overlap_prevention(self):
        # Create a resident record first
        resident = Resident.objects.create(
            user=self.resident_user,
            phone_number="555-1234",
            emergency_contact="Emergency Contact",
        )

        start = datetime.date.today()
        end = start + datetime.timedelta(days=30)

        payload = {
            "resident": resident.id,
            "unit": self.unit.id,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "rent_amount": "1200.00",
            "deposit_amount": "600.00",
            "status": "active",
        }

        response = self.client.post(
            "/api/tenants/leases/", payload, format="json", **self._tenant_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Create a second resident so the database uniqueness constraint does not trigger.
        resident2_user = User.objects.create_user(
            username="resident2",
            email="resident2@tenant.test.com",
            password="SuperSecret123",
            tenant=self.tenant,
        )
        resident2 = Resident.objects.create(
            user=resident2_user,
            phone_number="555-5678",
            emergency_contact="Emergency Contact 2",
        )

        # Attempt to create a second overlapping lease for the same unit but different resident.
        overlap_payload = {
            "resident": resident2.id,
            "unit": self.unit.id,
            "start_date": start.isoformat(),
            "end_date": (start + datetime.timedelta(days=15)).isoformat(),
            "rent_amount": "1200.00",
            "deposit_amount": "600.00",
            "status": "active",
        }
        overlap_response = self.client.post(
            "/api/tenants/leases/", overlap_payload, format="json", **self._tenant_headers()
        )
        self.assertEqual(overlap_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(
            any("overlaps" in str(v).lower() for v in overlap_response.data.values()),
            f"Expected overlap error; got {overlap_response.data!r}",
        )
