from django.db import models
from core.models import BaseModel

class AIAnalysisResult(BaseModel):
    """
    Persisted result of AI provider evidence content analysis (objects, severity, category classification).
    """
    evidence = models.ForeignKey(
        'evidence.Evidence',
        on_delete=models.CASCADE,
        related_name='ai_analysis_results',
        db_index=True
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    severity = models.CharField(max_length=20) # LOW, MEDIUM, HIGH
    detected_objects = models.JSONField(default=list)
    confidence = models.FloatField()
    raw_response = models.JSONField(default=dict)

    def __str__(self):
        return f"AI Analysis for Evidence {self.evidence.id} - Cat: {self.category} (Conf: {self.confidence})"
