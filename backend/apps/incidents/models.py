from django.db import models
from core.models import BaseModel
from django.conf import settings

class CivicIncident(BaseModel):
    """
    Aggregation representing a distinct public issue (e.g. overflowing bin at X street).
    Groups multiple individual citizen reports.
    """
    STATUS_CHOICES = (
        ('reported', 'Reported'),
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )

    administrative_area = models.ForeignKey(
        'geography.AdministrativeArea',
        on_delete=models.PROTECT,
        related_name='incidents',
        db_index=True
    )
    authority = models.ForeignKey(
        'authorities.Authority',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incidents',
        db_index=True
    )
    category = models.CharField(max_length=50, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported', db_index=True)
    representative_location = models.ForeignKey(
        'geography.Location',
        on_delete=models.PROTECT,
        related_name='representative_incidents'
    )
    citizen_report_count = models.PositiveIntegerField(default=1)
    first_reported_at = models.DateTimeField(db_index=True)
    last_reported_at = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"Incident {self.id} - Category: {self.category} ({self.status})"

class CitizenReport(BaseModel):
    """
    Individual ticket filed by a citizen containing specific evidence and description.
    """
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    evidence = models.ForeignKey(
        'evidence.Evidence',
        on_delete=models.PROTECT,
        related_name='reports'
    )
    location = models.ForeignKey(
        'geography.Location',
        on_delete=models.PROTECT,
        related_name='reports'
    )
    # Linked aggregated incident (populated on ingestion/resolution)
    incident = models.ForeignKey(
        CivicIncident,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports',
        db_index=True
    )
    description = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    # Unique submission identifier for offline retry dedup
    client_uuid = models.UUIDField(unique=True, null=True, blank=True, db_index=True)

    def __str__(self):
        return f"Report {self.id} - Citizen: {self.citizen.username} ({self.submitted_at})"
