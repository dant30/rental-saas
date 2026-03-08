"""Serializers for notifications and messaging."""

from rest_framework import serializers

from .models import Announcement, Conversation, Message, Notification, NotificationPreference, NotificationTemplate


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "tenant",
            "code",
            "name",
            "channel",
            "subject_template",
            "body_template",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_at", "updated_at"]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "tenant",
            "user",
            "email_enabled",
            "sms_enabled",
            "in_app_enabled",
            "whatsapp_enabled",
            "marketing_opt_in",
            "quiet_hours_start",
            "quiet_hours_end",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "user", "created_at", "updated_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "tenant",
            "recipient",
            "template",
            "notification_type",
            "channel",
            "subject",
            "content",
            "context",
            "is_read",
            "read_at",
            "sent_at",
            "failed_at",
            "error_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "read_at", "sent_at", "failed_at", "created_at", "updated_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "tenant",
            "created_by",
            "title",
            "message",
            "send_email",
            "send_sms",
            "send_whatsapp",
            "publish_at",
            "expires_at",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "created_by", "created_at", "updated_at"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "body",
            "is_system_generated",
            "read_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sender", "created_at", "updated_at"]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "tenant",
            "subject",
            "participants",
            "last_message_at",
            "is_archived",
            "messages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "last_message_at", "created_at", "updated_at"]
