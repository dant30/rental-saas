"""API views for tenant onboarding."""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import TenantSerializer, TenantSignupSerializer
from .services import TenantSignupError, create_tenant_with_admin


class TenantSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TenantSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            tenant, user = create_tenant_with_admin(
                schema_name=data["schema_name"],
                name=data["name"],
                domain=data["domain"],
                admin_username=data["admin_username"],
                admin_email=data["admin_email"],
                admin_password=data["admin_password"],
            )
        except TenantSignupError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_serializer = TenantSerializer(
            {
                "id": tenant.id,
                "schema_name": tenant.schema_name,
                "name": tenant.name,
                "created_on": tenant.created_on,
                "domain": data["domain"],
            }
        )
        return Response(tenant_serializer.data, status=status.HTTP_201_CREATED)
