from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Conversation, Message
from apps.accounts.models import User
from apps.surplus.models import Listing

@transaction.atomic
def start_conversation(*, creator, participant_ids: list, related_listing_id: str = None) -> Conversation:
    """
    Initializes a new message exchange thread.
    """
    # 1. Validate participants
    unique_ids = list(set(participant_ids + [str(creator.id)]))
    participants = User.objects.filter(id__in=unique_ids)
    if participants.count() != len(unique_ids):
        raise ValidationError({"participant_ids": "One or more participant IDs are invalid."})

    # 2. Get optional surplus listing
    listing = None
    if related_listing_id:
        try:
            listing = Listing.objects.get(id=related_listing_id)
        except (Listing.DoesNotExist, ValueError):
            raise ValidationError({"related_listing_id": "Invalid listing reference."})

    # 3. Create Conversation
    conversation = Conversation.objects.create(related_listing=listing)
    conversation.participants.set(participants)
    return conversation

@transaction.atomic
def send_message(*, conversation: Conversation, sender, body: str) -> Message:
    """
    Appends a new chat message to a conversation thread.
    """
    if sender not in conversation.participants.all():
        raise ValidationError("Sender is not a participant in this conversation.")

    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        body=body
    )
    
    # Touch conversation to update its updated_at timestamp
    conversation.save(update_fields=['updated_at'])
    
    return message
