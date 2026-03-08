"""Base Django settings for Rental SaaS."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes"}


SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "unsafe-local-secret-key-change-me-please-32chars-min",
)
DEBUG = _env_bool("DJANGO_DEBUG", True)

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split()

# Application definition
INSTALLED_APPS = [
    # Tenant management (must come before django.contrib apps)
    "django_tenants",

    # Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "channels",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Local apps
    "apps.core",
    "apps.tenants",
    "apps.accounts",
]

MIDDLEWARE = [
    "django_tenants.middleware.main.TenantMainMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        # django-tenants requires PostgreSQL; use `django_tenants.postgresql_backend`.
        "ENGINE": os.getenv(
            "DJANGO_DB_ENGINE", "django_tenants.postgresql_backend"
        ),
        "NAME": os.getenv("DJANGO_DB_NAME", "postgres"),
        "USER": os.getenv("DJANGO_DB_USER", "postgres"),
        "PASSWORD": os.getenv("DJANGO_DB_PASSWORD", "postgres"),
        "HOST": os.getenv("DJANGO_DB_HOST", "localhost"),
        "PORT": os.getenv("DJANGO_DB_PORT", "5432"),
    }
}

AUTH_USER_MODEL = "accounts.User"

# Django Tenants configuration
TENANT_MODEL = "tenants.Tenant"
TENANT_DOMAIN_MODEL = "tenants.Domain"
PUBLIC_SCHEMA_URLCONF = "config.urls"
TENANT_URLCONF = "config.urls"

# Shared/tenant app configuration for django-tenants.
SHARED_APPS = [
    "django_tenants",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.admin",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "channels",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "apps.core",
    "apps.tenants",
    "apps.accounts",
]

TENANT_APPS = [
    "apps.properties",
    "apps.tenants_app",
    "apps.payments",
    "apps.caretakers",
    "apps.notifications",
]

INSTALLED_APPS = SHARED_APPS + TENANT_APPS

DATABASE_ROUTERS = ("django_tenants.routers.TenantSyncRouter",)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Notifications
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@rentalsaas.local")
FRONTEND_PASSWORD_RESET_URL = os.getenv("FRONTEND_PASSWORD_RESET_URL", "")
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "console")
WHATSAPP_PROVIDER = os.getenv("WHATSAPP_PROVIDER", "console")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")

# OCR
OCR_PROVIDER = os.getenv("OCR_PROVIDER", "mock")
OCR_SPACE_API_KEY = os.getenv("OCR_SPACE_API_KEY", "")
OCR_SPACE_ENDPOINT = os.getenv("OCR_SPACE_ENDPOINT", "https://api.ocr.space/parse/image")

# M-Pesa
MPESA_PROVIDER = os.getenv("MPESA_PROVIDER", "mock")
MPESA_ENVIRONMENT = os.getenv("MPESA_ENVIRONMENT", "sandbox")
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY", "")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "")
MPESA_TRANSACTION_TYPE = os.getenv("MPESA_TRANSACTION_TYPE", "CustomerPayBillOnline")

# CORS
CORS_ALLOW_ALL_ORIGINS = _env_bool("CORS_ALLOW_ALL_ORIGINS", True)

# REST framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": os.getenv("CHANNEL_LAYER_BACKEND", "channels.layers.InMemoryChannelLayer"),
    }
}

# Celery
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    "generate-monthly-invoices": {
        "task": "apps.payments.tasks.generate_monthly_invoices_task",
        "schedule": 86400.0,
    },
    "sync-overdue-invoices": {
        "task": "apps.payments.tasks.sync_overdue_invoices_task",
        "schedule": 86400.0,
    },
    "create-preventive-work-orders": {
        "task": "apps.caretakers.tasks.create_preventive_work_orders_task",
        "schedule": 86400.0,
    },
    "retry-payment-webhooks": {
        "task": "apps.payments.tasks.retry_gateway_transactions_task",
        "schedule": 300.0,
    },
}

# Default auto field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
