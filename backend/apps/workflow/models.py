from django.db import models
from core.models import BaseModel
from django.conf import settings

class Assignment(BaseModel):
    """
    Tracks the assignment of a CivicIncident to a specific municipal officer.
    """
    incident = models.ForeignKey(
        'incidents.CivicIncident',
        on_delete=models.CASCADE,
        related_name='assignments',
        db_index=True
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='officer_assignments',
        db_index=True
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_assignments'
    )

    def __str__(self):
        return f"Incident {self.incident.id} assigned to {self.officer.username}"

class StatusHistory(BaseModel):
    """
    Audit history of workflow state transitions for a CivicIncident.
    """
    incident = models.ForeignKey(
        'incidents.CivicIncident',
        on_delete=models.CASCADE,
        related_name='status_histories',
        db_index=True
    )
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='status_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Status Histories'

    def __str__(self):
        return f"Incident {self.incident.id} status transition: {self.from_status} -> {self.to_status}"
