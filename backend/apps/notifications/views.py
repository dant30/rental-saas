"""Views for notifications, announcements, and messaging."""

from rest_framework import viewsets

from apps.properties.permissions import IsTenantAdmin, IsTenantMember

from .models import Announcement, Conversation, Message, Notification, NotificationPreference, NotificationTemplate
from .serializers import (
    AnnouncementSerializer,
    ConversationSerializer,
    MessageSerializer,
    NotificationPreferenceSerializer,
    NotificationSerializer,
    NotificationTemplateSerializer,
)
from .services import (
    get_announcement_queryset_for_user,
    get_conversation_queryset_for_user,
    get_message_queryset_for_user,
    get_notification_queryset_for_user,
    get_preference_queryset_for_user,
    get_template_queryset_for_user,
    save_announcement_for_user,
    save_conversation_for_user,
    save_message_for_user,
    save_notification_for_user,
    save_preference_for_user,
    save_template_for_user,
)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_template_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_template_for_user(serializer, self.request.user)


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return get_preference_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_preference_for_user(serializer, self.request.user)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return get_notification_queryset_for_user(self.request.user)


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return get_announcement_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_announcement_for_user(serializer, self.request.user)


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return get_conversation_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_conversation_for_user(serializer, self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return get_message_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        save_message_for_user(serializer, self.request.user)
