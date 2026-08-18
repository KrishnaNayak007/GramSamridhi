from django.db.models import QuerySet
from .models import Evidence
from core.exceptions import ObjectNotFoundError

def get_evidence(*, evidence_id: str) -> Evidence:
    """
    Retrieves evidence metadata by UUID.
    """
    try:
        return Evidence.objects.get(id=evidence_id)
    except (Evidence.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Evidence with ID {evidence_id} not found.")

def list_evidence() -> QuerySet:
    """
    Retrieves all evidence metadata.
    """
    return Evidence.objects.all().order_by('-uploaded_at')
