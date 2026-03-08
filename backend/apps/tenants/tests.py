"""Tests for tenant onboarding."""

from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.tenants.models import Domain, Tenant
from apps.accounts.models import User


class TenantSignupTests(APITestCase):
    def setUp(self):
        self.url = reverse("tenant_signup")

        # Ensure public schema is reachable during tests.
        # django-tenants resolves host to tenant via Domain entries.
        public_tenant, _ = Tenant.objects.get_or_create(
            schema_name="public", defaults={"name": "Public"}
        )
        Domain.objects.get_or_create(
            domain="testserver",
            tenant=public_tenant,
            defaults={"is_primary": True},
        )

    @patch("apps.tenants.services.Tenant.create_schema")
    def test_signup_creates_tenant_and_admin(self, mock_create_schema):
        payload = {
            "schema_name": "acme",
            "name": "Acme Properties",
            "domain": "acme.localhost",
            "admin_username": "admin",
            "admin_email": "admin@acme.localhost",
            "admin_password": "SuperSecret123",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(Tenant.objects.filter(schema_name="acme").exists())
        tenant = Tenant.objects.get(schema_name="acme")

        self.assertTrue(
            User.objects.filter(username="admin", tenant=tenant).exists(),
            "Expected an admin user to be created and linked to the tenant",
        )

        mock_create_schema.assert_called_once()

    def test_signup_rejects_bad_schema_name(self):
        payload = {
            "schema_name": "Invalid Schema",
            "name": "Acme Properties",
            "domain": "acme.localhost",
            "admin_username": "admin",
            "admin_email": "admin@acme.localhost",
            "admin_password": "SuperSecret123",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("schema_name", response.data.get("detail", ""))

    def test_signup_rejects_invalid_domain(self):
        payload = {
            "schema_name": "acme",
            "name": "Acme Properties",
            "domain": "not a domain",
            "admin_username": "admin",
            "admin_email": "admin@acme.localhost",
            "admin_password": "SuperSecret123",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("domain", response.data.get("detail", ""))

    def test_signup_rejects_common_password(self):
        payload = {
            "schema_name": "acme",
            "name": "Acme Properties",
            "domain": "acme.localhost",
            "admin_username": "admin2",
            "admin_email": "admin2@acme.localhost",
            "admin_password": "password",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("admin_password", response.data)

    def test_signup_rejects_duplicate_username(self):
        User.objects.create_user(
            username="existing",
            email="existing@acme.localhost",
            password="SuperSecret123",
        )

        payload = {
            "schema_name": "acme2",
            "name": "Acme Properties 2",
            "domain": "acme2.localhost",
            "admin_username": "existing",
            "admin_email": "existing2@acme.localhost",
            "admin_password": "SuperSecret123",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("admin_username", response.data)
