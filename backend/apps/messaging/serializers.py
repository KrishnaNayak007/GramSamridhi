from rest_framework import serializers
from .models import Conversation, Message
from apps.accounts.serializers import UserSerializer
from apps.surplus.serializers import ListingSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'body', 'created_at', 'read_at']
        read_only_fields = fields

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    related_listing = ListingSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'related_listing', 'last_message', 'updated_at']
        read_only_fields = fields

    def get_last_message(self, obj) -> dict | None:
        last_msg = obj.messages.order_by('-created_at').first()
        return MessageSerializer(last_msg).data if last_msg else None

class ConversationCreateInputSerializer(serializers.Serializer):
    participant_ids = serializers.ListField(child=serializers.UUIDField(), required=True)
    related_listing_id = serializers.UUIDField(required=False, allow_null=True)

class MessageSendInputSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=5000, required=True)
