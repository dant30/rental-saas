"""URL configuration for Rental SaaS."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.generic import TemplateView

from rest_framework.schemas import get_schema_view
from rest_framework.renderers import CoreJSONRenderer


def health_check(request):
    return JsonResponse({"status": "ok"})


schema_view = get_schema_view(
    title="Rental SaaS API",
    description="OpenAPI schema for the Rental SaaS backend.",
    version="1.0.0",
    renderer_classes=[CoreJSONRenderer],
)


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

    # Billing and collections
    path("api/", include("apps.payments.urls")),

    # Maintenance and caretaker operations
    path("api/", include("apps.caretakers.urls")),

    # Notifications and messaging
    path("api/", include("apps.notifications.urls")),

    # API schema + docs
    path("api/schema/", schema_view, name="openapi-schema"),
    path(
        "api/docs/",
        TemplateView.as_view(
            template_name="swagger-ui.html",
            extra_context={"schema_url": "openapi-schema"},
        ),
        name="swagger-ui",
    ),
]
