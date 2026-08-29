import json
import logging
from django.conf import settings
from google import genai
from google.genai import types
from PIL import Image

logger = logging.getLogger(__name__)

def classify_waste_image(image_file) -> dict:
    """
    Classifies a waste image using Google Gemini 2.5 Flash.
    Returns the parsed JSON response dict.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    
    # Enable fallback to mock if no API key or AI_PROVIDER is set to mock
    if not api_key or getattr(settings, 'AI_PROVIDER', 'gemini') == 'mock':
        logger.info("Using mock waste classification response.")
        return {
            "category": "Mixed",
            "breakdown": {
                "biotic_percentage": 60,
                "non_biotic_percentage": 40
            },
            "detected_items": ["food scraps", "plastic container", "paper packaging"],
            "reasoning": "Mock classification: Visible organic food residue mixed with dry plastic packaging."
        }

    try:
        # Load image with PIL
        image = Image.open(image_file)

        # Initialize the GenAI Client
        client = genai.Client(api_key=api_key)

        prompt = """You are an expert Waste Classification Agent. Analyze the image and output JSON:
{
  "category": "Biotic" | "Non-biotic" | "Mixed",
  "breakdown": {
    "biotic_percentage": integer,
    "non_biotic_percentage": integer
  },
  "detected_items": list of strings,
  "reasoning": string
}

Rules:
1. "Biotic" = organic materials (food waste, crop residue, dung, plants).
2. "Non-biotic" = recyclable/synthetic (plastics, glass, metal, paper, processed wood).
3. "Mixed" = both present together.
4. Percentages must sum to 100."""

        # Call Gemini 2.5 Flash
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        return json.loads(response.text)

    except Exception as e:
        logger.error(f"Error in classify_waste_image: {e}")
        raise e
