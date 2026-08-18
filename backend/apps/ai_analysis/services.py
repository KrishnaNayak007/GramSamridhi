import os
import json
import base64
import urllib.request
import logging
from django.conf import settings
from django.db import transaction
from django.core.files.storage import default_storage

from .models import AIAnalysisResult
from apps.evidence.models import Evidence

logger = logging.getLogger(__name__)

class GeminiProvider:
    """
    Google Gemini 2.5 Flash implementation to perform structured analysis of report images.
    """
    def __init__(self):
        # Pull key from django settings (loaded from .env)
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)

    def analyze(self, *, evidence_file: Evidence, citizen_description: str = "") -> AIAnalysisResult | None:
        """
        Sends the image to Gemini multimodal model and returns a validated AIAnalysisResult,
        or None if analysis fails or is disabled.
        """
        if not self.api_key:
            logger.warning("Gemini API key is not configured. Skipping analysis.")
            return None

        # 1. Read and base64-encode image payload
        try:
            with default_storage.open(evidence_file.storage_key, 'rb') as f:
                img_data = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"AI Analysis could not read evidence file: {e}")
            return None

        # Fixed prompt schema defined in Part 3
        system_prompt = (
            "You are analyzing a photo of urban waste for a civic reporting system. "
            "Return ONLY valid JSON matching this schema: "
            '{"title": string, "category": one of [MIXED_WASTE, PLASTIC, ORGANIC, CONSTRUCTION_DEBRIS, ELECTRONIC, OTHER], '
            '"severity": one of [LOW, MEDIUM, HIGH], "confidence": float between 0 and 1, "detected_objects": array of strings}. '
            "Base every field only on what is visibly present in the image. "
            "Do not infer duration, exact quantity, health impact, or any claim not directly observable."
        )

        # 2. Build Gemini payload
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\nCitizen Context Description: {citizen_description}"},
                        {
                            "inlineData": {
                                "mimeType": evidence_file.media_type,
                                "data": img_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {"type": "STRING"},
                        "category": {
                            "type": "STRING", 
                            "enum": ["MIXED_WASTE", "PLASTIC", "ORGANIC", "CONSTRUCTION_DEBRIS", "ELECTRONIC", "OTHER"]
                        },
                        "severity": {
                            "type": "STRING", 
                            "enum": ["LOW", "MEDIUM", "HIGH"]
                        },
                        "confidence": {"type": "NUMBER"},
                        "detected_objects": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"}
                        }
                    },
                    "required": ["title", "category", "severity", "confidence", "detected_objects"]
                }
            }
        }

        # 3. Request execution (wrapped in try/except)
        try:
            headers = {"Content-Type": "application/json"}
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            # Execute with 10s timeout
            with urllib.request.urlopen(req, timeout=10.0) as response:
                res_text = response.read().decode('utf-8')
                res_data = json.loads(res_text)

            # 4. Parse content & validate
            candidates = res_data.get('candidates', [])
            if not candidates:
                logger.error("No candidates returned from Gemini.")
                return None
            
            raw_text = candidates[0]['content']['parts'][0]['text']
            parsed_json = json.loads(raw_text)

            # Schema value constraint checks
            allowed_categories = ["MIXED_WASTE", "PLASTIC", "ORGANIC", "CONSTRUCTION_DEBRIS", "ELECTRONIC", "OTHER"]
            allowed_severities = ["LOW", "MEDIUM", "HIGH"]

            category = parsed_json.get("category")
            severity = parsed_json.get("severity")
            confidence = parsed_json.get("confidence")
            title = parsed_json.get("title")
            detected_objects = parsed_json.get("detected_objects", [])

            if category not in allowed_categories:
                logger.error(f"AI validation failure: category '{category}' not allowed.")
                return None
            if severity not in allowed_severities:
                logger.error(f"AI validation failure: severity '{severity}' not allowed.")
                return None
            if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 1):
                logger.error(f"AI validation failure: confidence '{confidence}' out of range.")
                return None

            # 5. Create AIAnalysisResult record on successful validation
            with transaction.atomic():
                result = AIAnalysisResult.objects.create(
                    evidence=evidence_file,
                    title=str(title)[:255],
                    category=category,
                    severity=severity,
                    detected_objects=detected_objects,
                    confidence=float(confidence),
                    raw_response={"raw_text": raw_text, "gemini_api_response": res_data}
                )
            return result

        except Exception as e:
            # Failure-safe: never block user report submission due to AI issues
            logger.error(f"AI Analysis failed or validation errored: {e}")
            return None

def analyze_report_evidence(*, report) -> AIAnalysisResult | None:
    """
    Shortcut helper function matching the legacy entrypoint.
    """
    if not getattr(settings, 'AI_ANALYSIS_ENABLED', True):
        logger.info("AI Analysis is disabled via settings flag.")
        return None
        
    if not report.evidence:
        return None

    provider = GeminiProvider()
    return provider.analyze(
        evidence_file=report.evidence,
        citizen_description=report.description
    )
