from django.db import models
from core.models import BaseModel
from django.conf import settings

class Notification(BaseModel):
    """
    User notification registry storing structural updates (incidents status shifts, messages).
    """
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    type = models.CharField(max_length=50) # INCIDENT_STATUS_UPDATE, LISTING_RESERVED, etc.
    payload = models.JSONField(default=dict)
    read_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Notification {self.type} for {self.recipient.username}"
