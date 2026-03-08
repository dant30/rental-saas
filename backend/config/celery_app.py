"""Optional Celery bootstrap for environments where Celery is installed."""

from __future__ import annotations

import os

try:
    from celery import Celery
except ImportError:  # pragma: no cover
    app = None
else:  # pragma: no cover
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
    app = Celery("rental_saas")
    app.config_from_object("django.conf:settings", namespace="CELERY")
    app.autodiscover_tasks()

__all__ = ("app",)
