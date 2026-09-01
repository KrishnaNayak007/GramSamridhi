"""
SWC AI - STEP T5: Predict Severity + Waste Type on a Single Image
-------------------------------------------------------------------
Loads BOTH:
  - models/best.pt (Severity: low, medium, critical)
  - models/best_type.pt (Waste Type: organic, inorganic, mixed)
and prints dual-line outputs and renders a combined banner visualization.
"""

from pathlib import Path
import sys
from io import BytesIO
from PIL import Image

SEVERITY_MODEL_PATH = Path("models/best.pt")
TYPE_MODEL_PATH = Path("models/best_type.pt")
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

SEVERITY_MESSAGES = {
    "low": "Minor litter, no urgent action needed.",
    "medium": "Noticeable accumulation - schedule pickup soon.",
    "critical": "Large/overflowing garbage accumulation detected.",
}

TYPE_MESSAGES = {
    "organic": "Biodegradable / food & plant waste detected.",
    "inorganic": "Non-biodegradable waste (plastic, metal, glass, etc.) detected.",
    "mixed": "Mixed organic and inorganic waste detected — recommend manual sorting.",
}


def classify_image(model, img: Image.Image):
    results = model.predict(source=img, verbose=False)
    r = results[0]
    top1_idx = int(r.probs.top1)
    label = r.names[top1_idx]
    confidence = float(r.probs.top1conf)
    return label, confidence


def predict_dual(image_path: Path):
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found at '{image_path}'")

    if image_path.suffix.lower() not in VALID_EXTENSIONS:
        raise ValueError(f"Unsupported format '{image_path.suffix}'")

    from ultralytics import YOLO

    img = Image.open(image_path).convert("RGB")
    out = {}

    if SEVERITY_MODEL_PATH.exists():
        try:
            sev_model = YOLO(str(SEVERITY_MODEL_PATH))
            label, conf = classify_image(sev_model, img)
            out["severity"] = {
                "label": label,
                "confidence": conf,
                "message": SEVERITY_MESSAGES.get(label, ""),
            }
        except Exception as e:
            out["severity"] = {"error": str(e)}
    else:
        out["severity"] = {"error": f"Model not found at {SEVERITY_MODEL_PATH}"}

    if TYPE_MODEL_PATH.exists():
        try:
            type_model = YOLO(str(TYPE_MODEL_PATH))
            label, conf = classify_image(type_model, img)
            out["waste_type"] = {
                "label": label,
                "confidence": conf,
                "message": TYPE_MESSAGES.get(label, ""),
            }
        except Exception as e:
            out["waste_type"] = {"error": str(e)}
    else:
        out["waste_type"] = {"error": f"Model not found at {TYPE_MODEL_PATH}"}

    return out


def show_dual_banner(image_path: Path, result: dict):
    try:
        import matplotlib.pyplot as plt

        img = Image.open(image_path)
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.imshow(img)
        ax.axis("off")

        sev = result.get("severity", {})
        wtype = result.get("waste_type", {})

        sev_text = f"Severity: {sev.get('label', 'N/A').upper()} ({sev.get('confidence', 0)*100:.1f}%)" if "label" in sev else "Severity: N/A"
        type_text = f"Type: {wtype.get('label', 'N/A').upper()} ({wtype.get('confidence', 0)*100:.1f}%)" if "label" in wtype else "Type: N/A"

        plt.title(f"[{sev_text}]  |  [{type_text}]", fontsize=12, color="#ffffff",
                  weight="bold", backgroundcolor="#333333", pad=15)
        plt.tight_layout()
        plt.show()
    except Exception as e:
        print(f"[NOTE] Could not open GUI display: {e}")


def main():
    if len(sys.argv) > 1:
        test_image = Path(sys.argv[1])
    else:
        test_image = Path("test.jpg")

    print("=" * 55)
    print("SWC GARBAGE SEVERITY + TYPE DUAL PREDICTION")
    print("=" * 55)
    print(f"Image: {test_image.name}\n")

    try:
        res = predict_dual(test_image)

        if "label" in res.get("severity", {}):
            s = res["severity"]
            print(f"Severity:   {s['label'].upper()} ({s['confidence']*100:.1f}%)")
            print(f"Message:    {s['message']}\n")
        else:
            print(f"Severity:   {res.get('severity', {}).get('error')}\n")

        if "label" in res.get("waste_type", {}):
            t = res["waste_type"]
            print(f"Waste Type: {t['label'].upper()} ({t['confidence']*100:.1f}%)")
            print(f"Message:    {t['message']}\n")
        else:
            print(f"Waste Type: {res.get('waste_type', {}).get('error')}\n")

        print("=" * 55)
        show_dual_banner(test_image, res)
    except Exception as e:
        print(f"[ERROR] {e}")


if __name__ == "__main__":
    main()
