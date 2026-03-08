"""Routes for caretaker and maintenance API."""

from rest_framework.routers import DefaultRouter

from .views import (
    CaretakerViewSet,
    MaintenanceAttachmentViewSet,
    MaintenanceRequestViewSet,
    MaintenanceScheduleViewSet,
)


router = DefaultRouter()
router.register(r"caretakers", CaretakerViewSet, basename="caretaker")
router.register(r"maintenance-requests", MaintenanceRequestViewSet, basename="maintenance-request")
router.register(r"maintenance-attachments", MaintenanceAttachmentViewSet, basename="maintenance-attachment")
router.register(r"maintenance-schedules", MaintenanceScheduleViewSet, basename="maintenance-schedule")

urlpatterns = router.urls
