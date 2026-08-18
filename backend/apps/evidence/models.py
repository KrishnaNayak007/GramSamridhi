from django.db import models
from core.models import BaseModel

class Evidence(BaseModel):
    """
    Metadata registry for uploaded binary evidence files (images/video).
    Deduplicated via unique cryptographic checksums.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed / Upload Complete'),
        ('failed', 'Upload Failed'),
    )

    storage_key = models.CharField(max_length=512)
    media_type = models.CharField(max_length=100)
    captured_at = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Unique checksum (typically SHA-256) of file content for idempotency checks
    checksum = models.CharField(max_length=64, unique=True, db_index=True)

    def __str__(self):
        return f"Evidence {self.id} ({self.media_type}) - Status: {self.status}"
