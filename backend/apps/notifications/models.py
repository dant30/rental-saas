"""Notification, preference, and messaging models."""

from django.db import models

from apps.core.models import TenantAwareModel, TimeStampedModel


class NotificationTemplate(TenantAwareModel):
    class Channel(models.TextChoices):
        IN_APP = "in_app", "In App"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        WHATSAPP = "whatsapp", "WhatsApp"

    code = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    channel = models.CharField(max_length=20, choices=Channel.choices)
    subject_template = models.CharField(max_length=255, blank=True)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "code", "channel"],
                name="unique_notification_template_per_channel_tenant",
            ),
        ]

    def __str__(self):
        return self.name


class NotificationPreference(TenantAwareModel):
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    whatsapp_enabled = models.BooleanField(default=False)
    marketing_opt_in = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Notification preference"
        verbose_name_plural = "Notification preferences"

    def __str__(self):
        return f"Preferences for {self.user}"

    def save(self, *args, **kwargs):
        if self.user_id and self.user.tenant_id:
            self.tenant_id = self.user.tenant_id
        super().save(*args, **kwargs)


class Notification(TenantAwareModel):
    class NotificationType(models.TextChoices):
        GENERAL = "general", "General"
        PAYMENT = "payment", "Payment"
        LEASE = "lease", "Lease"
        MAINTENANCE = "maintenance", "Maintenance"
        ANNOUNCEMENT = "announcement", "Announcement"
        MESSAGE = "message", "Message"

    class Channel(models.TextChoices):
        IN_APP = "in_app", "In App"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        WHATSAPP = "whatsapp", "WhatsApp"

    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        related_name="notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )
    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
        default=Channel.IN_APP,
    )
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    context = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read", "created_at"])]

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient}"

    def save(self, *args, **kwargs):
        if self.recipient_id and self.recipient.tenant_id:
            self.tenant_id = self.recipient.tenant_id
        super().save(*args, **kwargs)


class Announcement(TenantAwareModel):
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="announcements",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    send_email = models.BooleanField(default=False)
    send_sms = models.BooleanField(default=False)
    publish_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Conversation(TenantAwareModel):
    subject = models.CharField(max_length=255, blank=True)
    participants = models.ManyToManyField(
        "accounts.User",
        related_name="conversations",
        blank=True,
    )
    last_message_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["-last_message_at", "-created_at"]

    def __str__(self):
        return self.subject or f"Conversation {self.pk}"


class Message(TimeStampedModel):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    body = models.TextField()
    is_system_generated = models.BooleanField(default=False)
    read_by = models.ManyToManyField(
        "accounts.User",
        related_name="read_messages",
        blank=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message {self.pk}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.sender.tenant_id and not self.conversation.tenant_id:
            self.conversation.tenant_id = self.sender.tenant_id
        self.conversation.last_message_at = self.created_at
        self.conversation.save(update_fields=["tenant", "last_message_at"])
