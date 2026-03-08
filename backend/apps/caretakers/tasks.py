"""Async caretaker and maintenance automation tasks."""

from django.utils import timezone

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(func=None, **_kwargs):
        if func is None:
            return lambda f: f
        return func

from apps.caretakers.services import create_preventive_work_orders


@shared_task
def create_preventive_work_orders_task():
    created = create_preventive_work_orders(today=timezone.localdate())
    return len(created)
