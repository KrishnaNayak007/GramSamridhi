import os
import hashlib
from django.db import transaction, IntegrityError
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Evidence

def calculate_checksum(file_obj) -> str:
    """
    Computes SHA-256 checksum of file object.
    """
    hasher = hashlib.sha256()
    for chunk in file_obj.chunks():
        hasher.update(chunk)
    return hasher.hexdigest()

@transaction.atomic
def create_evidence(*, file_obj, checksum: str = None, captured_at=None) -> Evidence:
    """
    Registers a new evidence upload.
    If checksum matches an existing record, returns the existing record (idempotency).
    """
    if not checksum:
        checksum = calculate_checksum(file_obj)
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)

    # 1. Idempotency Check: Return existing evidence if checksum matches
    existing_evidence = Evidence.objects.filter(checksum=checksum).first()
    if existing_evidence:
        return existing_evidence

    # 2. Save file to storage
    if hasattr(file_obj, 'seek'):
        file_obj.seek(0)
    file_path = default_storage.save(
        f"evidence/{checksum}_{file_obj.name}",
        ContentFile(file_obj.read())
    )

    # 3. Create database entry
    try:
        evidence = Evidence.objects.create(
            storage_key=file_path,
            media_type=file_obj.content_type,
            checksum=checksum,
            captured_at=captured_at,
            status='pending'
        )
    except IntegrityError:
        # Fallback if another thread created it concurrently
        evidence = Evidence.objects.get(checksum=checksum)

    return evidence

@transaction.atomic
def confirm_evidence(*, evidence_id: str) -> Evidence:
    """
    Transitions evidence status to confirmed.
    """
    try:
        evidence = Evidence.objects.get(id=evidence_id)
    except (Evidence.DoesNotExist, ValueError):
        from core.exceptions import ObjectNotFoundError
        raise ObjectNotFoundError(f"Evidence with ID {evidence_id} not found.")

    evidence.status = 'confirmed'
    evidence.save()
    return evidence
