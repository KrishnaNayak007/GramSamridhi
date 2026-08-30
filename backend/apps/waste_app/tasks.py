import logging
from celery import shared_task
from django.core.files.storage import default_storage
from django.db import transaction
from apps.evidence.models import Evidence
from apps.ai_analysis.models import AIAnalysisResult
from .services import classify_waste_image

logger = logging.getLogger(__name__)

@shared_task
def classify_waste_image_task(evidence_id: str):
    """
    Asynchronously classifies a waste image and persists the result.
    """
    logger.info(f"Starting waste image classification task for evidence: {evidence_id}")
    try:
        evidence = Evidence.objects.get(id=evidence_id)
    except Evidence.DoesNotExist:
        logger.error(f"Evidence with id {evidence_id} does not exist.")
        return

    try:
        # Load image file from default storage
        with default_storage.open(evidence.storage_key, 'rb') as image_file:
            result = classify_waste_image(image_file)

        # Persist classification result to AIAnalysisResult
        with transaction.atomic():
            analysis_result = AIAnalysisResult.objects.create(
                evidence=evidence,
                title="Waste Image Classification",
                category=result.get("category", "Mixed"),
                severity="LOW",  # Default severity since not part of this simple classification payload
                detected_objects=result.get("detected_items", []),
                confidence=1.0,  # Default confidence
                raw_response=result
            )
        logger.info(f"Successfully classified evidence {evidence_id}: {analysis_result.id}")
        return {
            "analysis_result_id": str(analysis_result.id),
            "category": analysis_result.category,
        }

    except Exception as e:
        logger.error(f"Error in classify_waste_image_task for evidence {evidence_id}: {e}")
        # Transition evidence status to failed if error occurs
        try:
            evidence.status = 'failed'
            evidence.save()
        except Exception as save_err:
            logger.error(f"Failed to update evidence status to failed: {save_err}")
        raise e
