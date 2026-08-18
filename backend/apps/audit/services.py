from django.db import transaction
from .models import AuditLog

@transaction.atomic
def log_action(*, actor, action: str, target_type: str, target_id: str, metadata: dict = None) -> AuditLog:
    """
    Creates an append-only audit trail record.
    """
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata=metadata or {}
    )
