"""Service helpers for property management workflows."""

from apps.properties.models import Document, Property, Unit


def get_property_queryset_for_user(user):
    return Property.objects.filter(tenant_id=user.tenant_id).prefetch_related("units")


def get_unit_queryset_for_user(user):
    return Unit.objects.filter(tenant_id=user.tenant_id).select_related("property")


def get_document_queryset_for_user(user):
    return Document.objects.filter(tenant_id=user.tenant_id).select_related(
        "tenant",
        "uploaded_by",
        "content_type",
    )


def save_property_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_unit_for_user(serializer, user):
    return serializer.save(tenant=user.tenant)


def save_document_for_user(serializer, user):
    return serializer.save(tenant=user.tenant, uploaded_by=user)
