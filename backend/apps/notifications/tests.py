"""Tests for notification, messaging, and websocket event APIs."""

from unittest.mock import MagicMock, patch

from django.core import mail
from django.core.management import call_command
from django.test import override_settings

from django_tenants.test.cases import TenantTestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.notifications.models import Notification
from apps.notifications.services import dispatch_notification


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

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        DEFAULT_FROM_EMAIL="no-reply@test.local",
        SMS_PROVIDER="twilio",
        WHATSAPP_PROVIDER="twilio",
        TWILIO_ACCOUNT_SID="AC123",
        TWILIO_AUTH_TOKEN="secret",
        TWILIO_FROM_NUMBER="+15550000000",
        TWILIO_WHATSAPP_FROM="+15550000001",
    )
    @patch("apps.notifications.services.urllib_request.urlopen")
    def test_multi_channel_delivery(self, mocked_urlopen):
        mocked_response = MagicMock()
        mocked_response.__enter__.return_value = mocked_response
        mocked_response.__exit__.return_value = False
        mocked_urlopen.return_value = mocked_response

        self.member_user.phone_number = "+254700123456"
        self.member_user.save(update_fields=["phone_number"])

        self.client.force_authenticate(self.member_user)
        preference_response = self.client.post(
            "/api/notification-preferences/",
            {"email_enabled": True, "sms_enabled": True, "whatsapp_enabled": True, "in_app_enabled": True},
            format="json",
            **self._headers(),
        )
        self.assertEqual(preference_response.status_code, status.HTTP_201_CREATED)

        notifications = dispatch_notification(
            recipient=self.member_user,
            notification_type="general",
            subject="Statement ready",
            content="Your monthly statement is available.",
            channels=["in_app", "email", "sms", "whatsapp"],
        )
        self.assertEqual(len(notifications), 4)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mocked_urlopen.call_count, 2)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_announcement_broadcast_creates_notifications(self):
        self.member_user.phone_number = "+254700123456"
        self.member_user.save(update_fields=["phone_number"])

        self.client.post(
            "/api/notification-preferences/",
            {"email_enabled": True, "sms_enabled": False, "in_app_enabled": True},
            format="json",
            **self._headers(),
        )

        announcement_response = self.client.post(
            "/api/announcements/",
            {
                "title": "Inspection notice",
                "message": "Quarterly inspections start next week.",
                "send_email": True,
                "send_sms": False,
                "send_whatsapp": False,
            },
            format="json",
            **self._headers(),
        )
        self.assertEqual(announcement_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                notification_type="announcement",
                recipient=self.member_user,
            ).exists()
        )

    @patch("apps.notifications.services.async_to_sync", side_effect=lambda fn: fn)
    @patch("apps.notifications.services.get_channel_layer")
    def test_notification_dispatch_emits_websocket_events(self, mocked_get_channel_layer, _mocked_async_to_sync):
        channel_layer = MagicMock()
        mocked_get_channel_layer.return_value = channel_layer

        dispatch_notification(
            recipient=self.member_user,
            notification_type="general",
            subject="Realtime notice",
            content="A websocket payload should be emitted.",
            channels=["in_app"],
        )

        channel_layer.group_send.assert_called()

    def test_asgi_application_is_importable(self):
        from config.asgi import application

        self.assertIsNotNone(application)
