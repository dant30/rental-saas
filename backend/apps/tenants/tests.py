"""Tests for tenant onboarding."""

from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.tenants.models import Tenant
from apps.accounts.models import User


class TenantSignupTests(APITestCase):
    def setUp(self):
        self.url = reverse("tenant_signup")

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
