"""WebSocket consumers for notifications and conversations."""

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django_tenants.utils import tenant_context

from apps.notifications.models import Conversation, Message


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        tenant = self.scope.get("tenant")
        if not getattr(user, "is_authenticated", False) or tenant is None or user.tenant_id != tenant.pk:
            await self.close(code=4401)
            return

        self.group_name = f"user_{tenant.pk}_{user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get("action") == "ping":
            await self.send_json({"type": "pong"})

    async def notify_user(self, event):
        await self.send_json({"type": "notification", "payload": event["payload"]})


class ConversationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        tenant = self.scope.get("tenant")
        self.conversation_id = int(self.scope["url_route"]["kwargs"]["conversation_id"])
        if not getattr(user, "is_authenticated", False) or tenant is None or user.tenant_id != tenant.pk:
            await self.close(code=4401)
            return

        allowed = await self._user_in_conversation(user.pk, tenant, self.conversation_id)
        if not allowed:
            await self.close(code=4403)
            return

        self.group_name = f"conversation_{tenant.pk}_{self.conversation_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        body = (content.get("body") or "").strip()
        if not body:
            await self.send_json({"type": "error", "detail": "Message body is required."})
            return
        message = await self._create_message(
            user_id=self.scope["user"].pk,
            tenant=self.scope["tenant"],
            conversation_id=self.conversation_id,
            body=body,
        )
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "conversation.message",
                "payload": message,
            },
        )

    async def conversation_message(self, event):
        await self.send_json({"type": "message", "payload": event["payload"]})

    @database_sync_to_async
    def _user_in_conversation(self, user_id, tenant, conversation_id):
        with tenant_context(tenant):
            return Conversation.objects.filter(pk=conversation_id, participants__id=user_id).exists()

    @database_sync_to_async
    def _create_message(self, *, user_id, tenant, conversation_id, body):
        with tenant_context(tenant):
            conversation = Conversation.objects.get(pk=conversation_id)
            sender = conversation.participants.get(pk=user_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                body=body,
            )
            conversation.last_message_at = message.created_at
            conversation.save(update_fields=["last_message_at"])
            return {
                "id": message.pk,
                "conversation_id": conversation.pk,
                "sender_id": sender.pk,
                "sender_name": sender.display_name,
                "body": message.body,
                "is_system_generated": message.is_system_generated,
                "created_at": message.created_at.isoformat() if message.created_at else None,
            }
