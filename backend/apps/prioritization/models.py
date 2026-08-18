from django.db import models
from core.models import BaseModel

class PriorityAssessment(BaseModel):
    """
    Append-only record of a CivicIncident priority score calculation.
    """
    incident = models.ForeignKey(
        'incidents.CivicIncident',
        on_delete=models.CASCADE,
        related_name='priority_assessments',
        db_index=True
    )
    score = models.FloatField()
    # Breakdown of factors contributing to the score (e.g. {"report_count": 5, "severity": "HIGH", "hours_elapsed": 12})
    factor_breakdown = models.JSONField(default=dict)
    calculated_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Assessment for Incident {self.incident.id} - Score: {self.score}"
