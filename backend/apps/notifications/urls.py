"""Routes for notification and messaging API."""

from rest_framework.routers import DefaultRouter

from .views import (
    AnnouncementViewSet,
    ConversationViewSet,
    MessageViewSet,
    NotificationPreferenceViewSet,
    NotificationTemplateViewSet,
    NotificationViewSet,
)


router = DefaultRouter()
router.register(r"notification-templates", NotificationTemplateViewSet, basename="notification-template")
router.register(r"notification-preferences", NotificationPreferenceViewSet, basename="notification-preference")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"announcements", AnnouncementViewSet, basename="announcement")
router.register(r"conversations", ConversationViewSet, basename="conversation")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = router.urls
