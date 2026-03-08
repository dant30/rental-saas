"""Routes for tenant / renter management API."""

from rest_framework.routers import DefaultRouter

from .views import LeaseViewSet, ResidentViewSet


router = DefaultRouter()
router.register(r"residents", ResidentViewSet, basename="resident")
router.register(r"leases", LeaseViewSet, basename="lease")


urlpatterns = router.urls
