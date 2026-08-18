from django.db.models import QuerySet
from .models import Conversation, Message
from core.exceptions import ObjectNotFoundError, PermissionDeniedError

def get_conversation(*, user, conversation_id: str) -> Conversation:
    """
    Retrieves a conversation details, validating participants authorization.
    """
    try:
        conversation = Conversation.objects.prefetch_related('participants').get(id=conversation_id)
    except (Conversation.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Conversation with ID {conversation_id} not found.")

    # Rule 10: Limit access to participants
    if user not in conversation.participants.all():
        raise PermissionDeniedError("You are not a participant in this conversation.")

    return conversation

def list_conversations(*, user) -> QuerySet:
    """
    Lists conversations where the user is an active participant.
    """
    return Conversation.objects.filter(participants=user).order_by('-updated_at')

def list_messages(*, user, conversation_id: str) -> QuerySet:
    """
    Lists all messages inside a conversation. Verifies participant access first.
    """
    conversation = get_conversation(user=user, conversation_id=conversation_id)
    return conversation.messages.select_related('sender').order_by('created_at')
