"""Development settings."""

from .base import *  # noqa: F401,F403

# Override settings for local development
DEBUG = True

ALLOWED_HOSTS = ["*"]

# Simplify email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
