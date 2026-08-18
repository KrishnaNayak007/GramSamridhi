from django.db import models
from core.models import BaseModel
from django.conf import settings

class AuditLog(BaseModel):
    """
    Append-only trail recording state mutations and security actions.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        db_index=True
    )
    action = models.CharField(max_length=100) # submit_report, assign_incident, transition_status, etc.
    target_type = models.CharField(max_length=100) # CitizenReport, CivicIncident, etc.
    target_id = models.CharField(max_length=100, db_index=True)
    metadata = models.JSONField(default=dict)

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"{actor_name} performed {self.action} on {self.target_type}:{self.target_id}"
