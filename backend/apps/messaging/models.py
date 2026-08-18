from django.db import models
from core.models import BaseModel
from django.conf import settings

class Conversation(BaseModel):
    """
    Groups chat messages between two or more participants.
    May be associated with a reuse surplus listing.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )
    related_listing = models.ForeignKey(
        'surplus.Listing',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )

    def __str__(self):
        return f"Conversation {self.id} (Listing: {self.related_listing_id})"

class Message(BaseModel):
    """
    Individual chat messages sent within a Conversation group.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        db_index=True
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        db_index=True
    )
    body = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Msg from {self.sender.username} in Conv {self.conversation.id}"
