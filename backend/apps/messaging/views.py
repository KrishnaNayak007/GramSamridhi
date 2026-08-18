from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    ConversationSerializer,
    ConversationCreateInputSerializer,
    MessageSerializer,
    MessageSendInputSerializer
)
from .selectors import list_conversations, get_conversation, list_messages
from .services import start_conversation, send_message

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = list_conversations(user=request.user)
        return Response(ConversationSerializer(conversations, many=True).data)

    def post(self, request):
        serializer = ConversationCreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        conversation = start_conversation(
            creator=request.user,
            participant_ids=[str(pid) for pid in serializer.validated_data['participant_ids']],
            related_listing_id=serializer.validated_data.get('related_listing_id')
        )
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        messages = list_messages(user=request.user, conversation_id=pk)
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        # 1. Verify access
        conversation = get_conversation(user=request.user, conversation_id=pk)
        
        serializer = MessageSendInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Append message
        message = send_message(
            conversation=conversation,
            sender=request.user,
            body=serializer.validated_data['body']
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
