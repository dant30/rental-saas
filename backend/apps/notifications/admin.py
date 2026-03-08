from django.contrib import admin

from .models import Announcement, Conversation, Message, Notification, NotificationPreference, NotificationTemplate


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "code", "channel", "is_active")
    list_filter = ("channel", "is_active", "tenant")
    search_fields = ("name", "code", "subject_template", "body_template")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "tenant", "email_enabled", "sms_enabled", "in_app_enabled", "whatsapp_enabled")
    list_filter = ("email_enabled", "sms_enabled", "in_app_enabled", "whatsapp_enabled", "tenant")
    search_fields = ("user__username", "user__email")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "tenant", "notification_type", "channel", "is_read", "created_at")
    list_filter = ("notification_type", "channel", "is_read", "tenant")
    search_fields = ("recipient__username", "recipient__email", "subject", "content")


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "created_by", "send_email", "send_sms", "send_whatsapp", "is_active")
    list_filter = ("is_active", "tenant")
    search_fields = ("title", "message")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "subject", "last_message_at", "is_archived")
    list_filter = ("is_archived", "tenant")
    search_fields = ("subject",)
    filter_horizontal = ("participants",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "sender", "is_system_generated", "created_at")
    list_filter = ("is_system_generated",)
    search_fields = ("body", "sender__username", "sender__email")
    filter_horizontal = ("read_by",)
