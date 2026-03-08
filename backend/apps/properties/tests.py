"""Tests for the properties API."""

from django.core.management import call_command

from rest_framework import status
from rest_framework.test import APIClient

from django_tenants.test.cases import TenantTestCase

from apps.accounts.models import User


class PropertyAPITests(TenantTestCase):
    tenant = None
    domain = None

    @classmethod
    def setup_tenant(cls, tenant):
        # Ensure required tenant fields are populated.
        tenant.name = "Test Tenant"

        # Enable schema auto-creation for tests, so the tenant schema exists.
        tenant.auto_create_schema = True

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Make sure tenant schema has all migrations applied.
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

        # Use APIClient so we can easily authenticate using DRF helpers.
        self.client = APIClient()
        self.url = "/api/properties/"

        self.user = User.objects.create_user(
            username="tenant_admin",
            email="admin@tenant.test.com",
            password="SuperSecret123",
            tenant=self.tenant,
            is_landlord=True,
        )
        self.client.force_authenticate(user=self.user)

    @classmethod
    def tearDownClass(cls):
        from django.db import connection
        from django_tenants.utils import schema_exists

        # Clean up shared-domain data and tenant record, avoiding cascading into the tenant schema.
        connection.set_schema_to_public()
        cls.domain.delete()

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

    def _api_post(self, payload):
        # Ensure tenant resolution uses the expected host.
        return self.client.post(
            self.url,
            payload,
            format="json",
            HTTP_HOST=self.get_test_tenant_domain(),
        )

    def test_create_property(self):
        payload = {
            "name": "Main Street Building",
            "address": "123 Main St, Springfield",
            "property_type": "apartment",
            "description": "A small apartment building",
        }

        response = self._api_post(payload)
        if response.status_code != status.HTTP_201_CREATED:
            print("Response content:", response.content)
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            f"Expected 201 but got {response.status_code}: {response.content}",
        )
        self.assertEqual(response.data["name"], payload["name"])
