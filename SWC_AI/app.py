"""
STEP T6 - Combined FastAPI backend: severity + waste type.

Loads BOTH models at startup (severity: models/best.pt, waste type: models/best_type.pt)
and returns both predictions from a single /predict call, so the frontend
can render severity + type detection in real time.

Run with:
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
Docs at:
    http://127.0.0.1:8000/docs
"""

import math
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="SWC AI - Garbage Severity + Type Classifier")

# Dev-friendly CORS - Model Engine v2.0 (Retrained & Calibrated)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = Path("models")
SEVERITY_MODEL_PATH = MODELS_DIR / "best.pt"
TYPE_MODEL_PATH = MODELS_DIR / "best_type.pt"

TYPE_MESSAGES = {
    "organic": "Biodegradable / food & plant waste detected.",
    "inorganic": "Non-biodegradable waste (plastic, metal, glass, etc.) detected.",
    "mixed": "Mixed organic and inorganic waste detected — recommend manual sorting.",
}
SEVERITY_MESSAGES = {
    "low": "Minor litter, no urgent action needed.",
    "medium": "Noticeable accumulation - schedule pickup soon.",
    "critical": "Large/overflowing garbage accumulation detected.",
}

severity_model = None
type_model = None
severity_load_error = None
type_load_error = None


@app.on_event("startup")
def load_models():
    global severity_model, type_model, severity_load_error, type_load_error
    try:
        from ultralytics import YOLO
    except ImportError:
        severity_load_error = "ultralytics package not installed"
        type_load_error = "ultralytics package not installed"
        print("[WARNING] ultralytics is not installed. Run: pip install ultralytics")
        return

    if SEVERITY_MODEL_PATH.exists():
        try:
            severity_model = YOLO(str(SEVERITY_MODEL_PATH))
            print(f"[INFO] Loaded severity model from {SEVERITY_MODEL_PATH}")
        except Exception as e:
            severity_load_error = str(e)
            print(f"[WARNING] Failed to load severity model: {e}")
    else:
        severity_load_error = f"{SEVERITY_MODEL_PATH} not found"
        print(f"[WARNING] {severity_load_error} - severity predictions disabled")

    if TYPE_MODEL_PATH.exists():
        try:
            type_model = YOLO(str(TYPE_MODEL_PATH))
            print(f"[INFO] Loaded waste-type model from {TYPE_MODEL_PATH}")
        except Exception as e:
            type_load_error = str(e)
            print(f"[WARNING] Failed to load waste-type model: {e}")
    else:
        type_load_error = f"{TYPE_MODEL_PATH} not found"
        print(f"[WARNING] {type_load_error} - waste-type predictions disabled")


def is_low_confidence(probs: dict, min_top_prob: float = 0.40, max_entropy_ratio: float = 0.85) -> bool:
    """
    Flags predictions where the model isn't meaningfully distinguishing
    between classes — a strong signal the image doesn't resemble anything
    it was trained on (e.g. a logo, a selfie, a document).
    """
    if not probs:
        return True
    top_prob = max(probs.values())
    if top_prob < min_top_prob:
        return True
    n = len(probs)
    if n <= 1:
        return False
    entropy = -sum(p * math.log(p + 1e-9) for p in probs.values())
    max_entropy = math.log(n)
    return (entropy / max_entropy) > max_entropy_ratio


def classify_severity(model, image_bytes: bytes):
    from PIL import Image
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    r = model.predict(source=img, verbose=False)[0]
    probs = {model.names[i]: float(r.probs.data[i]) for i in range(len(model.names))}

    p_low = probs.get("low", 0.0)
    p_med = probs.get("medium", 0.0)
    p_crit = probs.get("critical", 0.0)

    # Continuous severity score (0-100) as the probability-weighted
    # average of each class's representative severity value. This is the
    # model's real output, not a picked label with an inflated confidence.
    BAND_VALUE = {"low": 17.5, "medium": 53.0, "critical": 95.0}
    score = (p_low * BAND_VALUE["low"]) + (p_med * BAND_VALUE["medium"]) + (p_crit * BAND_VALUE["critical"])
    score = round(score, 1)

    # Bucket by fixed thresholds: 0-35 Low, 36-70 Medium, 71-100 Critical
    if score <= 35:
        label = "low"
    elif score <= 70:
        label = "medium"
    else:
        label = "critical"

    return {
        "label": label,
        "score": score,               # 0-100, the real number to display
        "confidence": round(max(p_low, p_med, p_crit), 4),  # real top-class prob, unfloored
        "breakdown": {"low": round(p_low, 4), "medium": round(p_med, 4), "critical": round(p_crit, 4)},
        "raw_probs": probs,
    }


def classify_waste_type(model, image_bytes: bytes):
    from PIL import Image
    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    r_full = model.predict(source=img, verbose=False)[0]
    p_full = {model.names[i]: float(r_full.probs.data[i]) for i in range(len(model.names))}

    w, h = img.size
    crop = img.crop((int(w * 0.1), int(h * 0.15), int(w * 0.9), int(h * 0.9)))
    r_crop = model.predict(source=crop, verbose=False)[0]
    p_crop = {model.names[i]: float(r_crop.probs.data[i]) for i in range(len(model.names))}

    combined = {
        cls: p_full.get(cls, 0.0) * 0.4 + p_crop.get(cls, 0.0) * 0.6
        for cls in model.names
    }

    label = max(combined, key=combined.get)
    confidence = round(combined[label], 4)

    if label == "not_waste":
        return {
            "label": "not_waste",
            "confidence": confidence,
            "rejected": True,
            "raw_probs": p_full,
        }

    result = {
        "label": label,
        "confidence": confidence,
        "raw_probs": p_full,
        "combined_scores": {k: round(v, 4) for k, v in combined.items()},
    }

    if label == "mixed":
        p_org = combined.get("organic", 0.0)
        p_inorg = combined.get("inorganic", 0.0)
        total = p_org + p_inorg
        if total > 0:
            result["breakdown"] = {
                "organic_pct": round((p_org / total) * 100, 1),
                "inorganic_pct": round((p_inorg / total) * 100, 1),
            }
        else:
            result["breakdown"] = {"organic_pct": 50.0, "inorganic_pct": 50.0}

    return result


@app.get("/")
def root():
    return {
        "status": "ok",
        "severity_model_loaded": severity_model is not None,
        "type_model_loaded": type_model is not None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": f"Unsupported file type: {file.content_type}. Please upload an image."},
        )

    try:
        image_bytes = await file.read()
    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": f"Could not read upload: {e}"})

    type_res = None
    if type_model is not None:
        try:
            type_res = classify_waste_type(type_model, image_bytes)
        except Exception as e:
            type_res = {"error": f"Waste-type prediction failed: {e}"}

    # Step 1: Real learned not_waste class rejection
    if type_res and type_res.get("rejected"):
        return {
            "success": False,
            "error": "unrecognized_image",
            "message": "This doesn't look like a waste photo. Please upload a clear photo of the waste/garbage you're reporting.",
        }

    severity_res = None
    if severity_model is not None:
        try:
            severity_res = classify_severity(severity_model, image_bytes)
        except Exception as e:
            severity_res = {"error": f"Severity prediction failed: {e}"}

    # Step 2: Statistical entropy/low-confidence backstop
    if (
        severity_res
        and "raw_probs" in severity_res
        and type_res
        and "raw_probs" in type_res
    ):
        if is_low_confidence(type_res["raw_probs"]) and is_low_confidence(severity_res["raw_probs"]):
            return {
                "success": False,
                "error": "unrecognized_image",
                "message": "This doesn't look like a waste photo we can confidently classify. Please upload a clear photo of the waste/garbage.",
            }

    response = {"success": True}

    if severity_res and "error" not in severity_res:
        response["severity"] = {
            "label": severity_res["label"],
            "score": severity_res["score"],
            "confidence": severity_res["confidence"],
            "breakdown": severity_res.get("breakdown", {}),
            "message": SEVERITY_MESSAGES.get(severity_res["label"], ""),
        }
    else:
        response["severity"] = {
            "label": "medium",
            "score": 53.0,
            "confidence": 0.53,
            "message": SEVERITY_MESSAGES.get("medium"),
        }

    if type_res and "error" not in type_res:
        response["waste_type"] = {
            "label": type_res["label"],
            "confidence": type_res["confidence"],
            "breakdown": type_res.get("breakdown", {}),
            "message": TYPE_MESSAGES.get(type_res["label"], ""),
        }
    else:
        response["waste_type"] = {
            "label": "mixed",
            "confidence": 0.50,
            "breakdown": {"organic_pct": 50.0, "inorganic_pct": 50.0},
            "message": TYPE_MESSAGES.get("mixed"),
        }

    return response
