"""Tenant-aware websocket authentication for Channels."""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import connection
from django_tenants.utils import tenant_context
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import UntypedToken

from apps.tenants.models import Domain


@database_sync_to_async
def _get_tenant_for_host(host: str):
    if not host:
        return None
    normalized_host = host.split(":")[0].lower()
    connection.set_schema_to_public()
    domain = Domain.objects.select_related("tenant").filter(domain=normalized_host).first()
    return domain.tenant if domain else None


@database_sync_to_async
def _get_user_from_token(raw_token: str, tenant):
    if not raw_token or tenant is None:
        return AnonymousUser()
    try:
        UntypedToken(raw_token)
    except InvalidToken:
        return AnonymousUser()

    authenticator = JWTAuthentication()
    validated_token = authenticator.get_validated_token(raw_token)
    with tenant_context(tenant):
        user = authenticator.get_user(validated_token)
    return user or AnonymousUser()


class TenantJWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        host = headers.get(b"host", b"").decode("utf-8")
        tenant = await _get_tenant_for_host(host)
        scope["tenant"] = tenant

        token = ""
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        if "token" in query_params:
            token = query_params["token"][0]
        elif b"authorization" in headers:
            auth_header = headers[b"authorization"].decode("utf-8")
            if auth_header.lower().startswith("bearer "):
                token = auth_header.split(" ", 1)[1]

        scope["user"] = await _get_user_from_token(token, tenant)
        return await self.inner(scope, receive, send)


def TenantJWTAuthMiddlewareStack(inner):
    return TenantJWTAuthMiddleware(inner)
