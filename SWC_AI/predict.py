"""
SWC AI - STEP 7 & 8: Predict on a Single Image (Severity)
-----------------------------------------------------------
Loads models/best.pt and predicts severity (low, medium, critical).
Displays prediction details in console and optionally visualizes the image
with a colored severity banner.
"""

from pathlib import Path
import sys
from PIL import Image

MODEL_PATH = Path("models/best.pt")
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

SEVERITY_MESSAGES = {
    "low": "Minor litter, no urgent action needed.",
    "medium": "Noticeable accumulation - schedule pickup soon.",
    "critical": "Large/overflowing garbage accumulation detected.",
}

SEVERITY_COLORS = {
    "low": (76, 175, 80),      # Green
    "medium": (255, 152, 0),   # Orange
    "critical": (244, 67, 54),  # Red
}


def predict_severity(image_path: Path):
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found at '{image_path}'")

    if image_path.suffix.lower() not in VALID_EXTENSIONS:
        raise ValueError(f"Unsupported format '{image_path.suffix}'")

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at '{MODEL_PATH}'. Run train.py first.")

    from ultralytics import YOLO
    model = YOLO(str(MODEL_PATH))

    img = Image.open(image_path).convert("RGB")
    results = model.predict(source=img, verbose=False)
    r = results[0]

    top1_idx = int(r.probs.top1)
    label = r.names[top1_idx]
    confidence = float(r.probs.top1conf)

    return {
        "severity": label,
        "confidence": confidence,
        "message": SEVERITY_MESSAGES.get(label, ""),
    }


def show_prediction_banner(image_path: Path, result: dict):
    try:
        import matplotlib.pyplot as plt
        import matplotlib.patches as patches

        img = Image.open(image_path)
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.imshow(img)
        ax.axis("off")

        label = result["severity"].upper()
        conf = result["confidence"] * 100
        msg = result["message"]

        banner_color = "#F44336" if label == "CRITICAL" else "#4CAF50" if label == "LOW" else "#FF9800"

        title_text = f"[{label}]  Confidence: {conf:.1f}%\n{msg}"
        plt.title(title_text, fontsize=13, color="#ffffff", weight="bold",
                  backgroundcolor=banner_color, pad=15)
        plt.tight_layout()
        plt.show()
    except Exception as e:
        print(f"[NOTE] Could not open GUI display: {e}")


def main():
    if len(sys.argv) > 1:
        test_image = Path(sys.argv[1])
    else:
        test_image = Path("test.jpg")

    print("=" * 45)
    print("SWC GARBAGE SEVERITY ANALYSIS")
    print("=" * 45)
    print(f"Image: {test_image.name}\n")

    try:
        res = predict_severity(test_image)
        print(f"Severity:   {res['severity'].upper()}")
        print(f"Confidence: {res['confidence'] * 100:.1f}%")
        print(f"Message:    {res['message']}")
        print("=" * 45)
        show_prediction_banner(test_image, res)
    except Exception as e:
        print(f"[ERROR] {e}")


if __name__ == "__main__":
    main()
