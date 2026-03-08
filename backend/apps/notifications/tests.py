"""Tests for notification and messaging APIs."""

from django.core.management import call_command

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.notifications.models import Notification


class NotificationAPITests(TenantTestCase):
    @classmethod
    def setup_tenant(cls, tenant):
        tenant.name = "Notify Tenant"
        tenant.auto_create_schema = True

    @staticmethod
    def get_test_schema_name():
        return "notifications_test"

    @staticmethod
    def get_test_tenant_domain():
        return "notifications.test.com"

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
            username="notify_admin",
            email="notify-admin@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
            is_landlord=True,
        )
        self.member_user = User.objects.create_user(
            username="notify_member",
            email="notify-member@tenant.test",
            password="SuperSecret123",
            tenant=self.tenant,
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

    def test_notification_and_messaging_flow(self):
        template_payload = {
            "code": "rent-reminder",
            "name": "Rent Reminder",
            "channel": "email",
            "subject_template": "Rent due",
            "body_template": "Your rent is due.",
            "is_active": True,
        }
        template_response = self.client.post(
            "/api/notification-templates/", template_payload, format="json", **self._headers()
        )
        self.assertEqual(template_response.status_code, status.HTTP_201_CREATED)

        Notification.objects.create(
            tenant=self.tenant,
            recipient=self.admin_user,
            template_id=template_response.data["id"],
            notification_type="general",
            channel="in_app",
            subject="Welcome",
            content="Welcome to the platform",
        )

        preference_response = self.client.post(
            "/api/notification-preferences/",
            {"email_enabled": True, "in_app_enabled": True, "sms_enabled": False},
            format="json",
            **self._headers(),
        )
        self.assertEqual(preference_response.status_code, status.HTTP_201_CREATED)

        conversation_response = self.client.post(
            "/api/conversations/",
            {"subject": "Tenant updates", "participants": [self.member_user.id]},
            format="json",
            **self._headers(),
        )
        self.assertEqual(conversation_response.status_code, status.HTTP_201_CREATED)

        message_response = self.client.post(
            "/api/messages/",
            {"conversation": conversation_response.data["id"], "body": "Please review the notice."},
            format="json",
            **self._headers(),
        )
        self.assertEqual(message_response.status_code, status.HTTP_201_CREATED)

        notification_list = self.client.get("/api/notifications/", **self._headers())
        self.assertEqual(notification_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(notification_list.data), 1)
