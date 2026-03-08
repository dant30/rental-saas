"""Serializers for the accounts app."""

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from django.conf import settings


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "tenant",
            "user_type",
            "job_title",
            "is_landlord",
            "is_agency_admin",
            "is_owner",
            "is_tenant_user",
            "is_caretaker",
            "avatar",
            "last_seen_at",
        ]
        read_only_fields = [
            "id",
            "tenant",
            "is_landlord",
            "is_agency_admin",
            "is_owner",
            "is_tenant_user",
            "is_caretaker",
            "last_seen_at",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone_number",
            "password",
            "first_name",
            "last_name",
            "user_type",
            "job_title",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data["refresh"])
            token.blacklist()
        except TokenError as exc:
            raise serializers.ValidationError({"refresh": _("Invalid or expired refresh token.")}) from exc


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        email = self.validated_data["email"].lower().strip()
        user = User.objects.filter(email=email, is_active=True).first()
        if user is None:
            return None

        uid = urlsafe_base64_encode(str(user.pk).encode("utf-8"))
        token = default_token_generator.make_token(user)
        reset_base_url = getattr(settings, "FRONTEND_PASSWORD_RESET_URL", "").strip()
        if reset_base_url:
            reset_url = f"{reset_base_url}?uid={uid}&token={token}"
        else:
            reset_url = f"/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Reset your Rental SaaS password",
            message=f"Use this link to reset your password: {reset_url}",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@rentalsaas.local"),
            recipient_list=[user.email],
            fail_silently=False,
        )
        return {"uid": uid, "token": token}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError({"uid": _("Invalid password reset user.")}) from exc

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": _("Invalid or expired password reset token.")})

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
