"""URL configuration for Rental SaaS."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health"),

    # Authentication
    path("api/auth/", include("apps.accounts.urls")),

    # Tenant onboarding
    path("api/tenants/", include("apps.tenants.urls")),

    # Properties (tenant-scoped)
    path("api/", include("apps.properties.urls")),

    # Tenant rental management (residents + leases)
    path("api/tenants/", include("apps.tenants_app.urls")),
]
