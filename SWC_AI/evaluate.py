"""
SWC AI - STEP 6: Evaluate the Trained Model (Severity: low, medium, critical)
------------------------------------------------
Runs the trained model on dataset/val/ and reports:
    - Accuracy
    - Precision / Recall / F1-score (per class + overall)
    - Confusion matrix

Save this file as:  SWC_AI/evaluate.py
Run with:            python evaluate.py
"""

from pathlib import Path
import sys
import numpy as np

MODEL_PATH = Path("models/best.pt")
VAL_DIR = Path("dataset/val")
CLASSES = ["low", "medium", "critical"]
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def main():
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics is not installed. Run: pip install ultralytics")
        sys.exit(1)

    try:
        from sklearn.metrics import (
            accuracy_score,
            precision_recall_fscore_support,
            confusion_matrix,
            classification_report,
        )
    except ImportError:
        print("[ERROR] scikit-learn is not installed. Run: pip install scikit-learn")
        sys.exit(1)

    if not MODEL_PATH.exists():
        print(f"[ERROR] Model not found at {MODEL_PATH}. Run train.py first.")
        sys.exit(1)

    if not VAL_DIR.exists():
        print(f"[ERROR] {VAL_DIR} not found. Run prepare_dataset.py first.")
        sys.exit(1)

    model = YOLO(str(MODEL_PATH))

    y_true, y_pred = [], []
    n_images = 0

    print("=" * 55)
    print("SWC AI - MODEL EVALUATION (SEVERITY)")
    print("=" * 55)

    for cls in CLASSES:
        cls_dir = VAL_DIR / cls
        if not cls_dir.exists():
            continue
        image_files = [
            f for f in cls_dir.iterdir()
            if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS
        ]
        for img_path in image_files:
            try:
                result = model.predict(source=str(img_path), verbose=False)[0]
                pred_idx = int(result.probs.top1)
                pred_cls = result.names[pred_idx]
            except Exception as e:
                print(f"[WARNING] Skipping unreadable/failed image {img_path}: {e}")
                continue
            y_true.append(cls)
            y_pred.append(pred_cls)
            n_images += 1

    if n_images == 0:
        print("[ERROR] No validation images could be evaluated.")
        sys.exit(1)

    if n_images < 10:
        print(
            f"\n[WARNING] Only {n_images} validation images available. "
            "The metrics below are for pipeline testing only and are NOT "
            "a reliable measure of real-world accuracy."
        )

    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, labels=CLASSES, average="weighted", zero_division=0
    )

    print(f"\nImages evaluated: {n_images}")
    print(f"Accuracy:  {acc:.3f}")
    print(f"Precision: {precision:.3f} (weighted)")
    print(f"Recall:    {recall:.3f} (weighted)")
    print(f"F1-score:  {f1:.3f} (weighted)")

    print("\nPer-class report:")
    print(classification_report(y_true, y_pred, labels=CLASSES, zero_division=0))

    cm = confusion_matrix(y_true, y_pred, labels=CLASSES)
    print("Confusion matrix (rows = actual, columns = predicted):")
    header = "            " + "".join(f"{c:>10}" for c in CLASSES)
    print(header)
    for i, row in enumerate(cm):
        print(f"{CLASSES[i]:<12}" + "".join(f"{v:>10}" for v in row))

    try:
        import matplotlib.pyplot as plt

        fig, ax = plt.subplots(figsize=(5, 4))
        im = ax.imshow(cm, cmap="Blues")
        ax.set_xticks(range(len(CLASSES)))
        ax.set_yticks(range(len(CLASSES)))
        ax.set_xticklabels(CLASSES)
        ax.set_yticklabels(CLASSES)
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_title("SWC Severity - Confusion Matrix")
        for i in range(len(CLASSES)):
            for j in range(len(CLASSES)):
                ax.text(j, i, cm[i, j], ha="center", va="center", color="black")
        fig.colorbar(im)
        fig.tight_layout()
        out_path = Path("models/confusion_matrix.png")
        out_path.parent.mkdir(exist_ok=True)
        fig.savefig(out_path)
        print(f"\nConfusion matrix image saved to: {out_path.resolve()}")
    except Exception as e:
        print(f"[NOTE] Could not save confusion matrix image: {e}")


if __name__ == "__main__":
    main()
