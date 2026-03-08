"""Routes for property management API."""

from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet, PropertyViewSet, UnitViewSet


router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"units", UnitViewSet, basename="unit")


urlpatterns = router.urls
