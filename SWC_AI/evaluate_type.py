"""
STEP T4 - Evaluate the WASTE-TYPE classifier (organic / inorganic / mixed)

Prints accuracy + per-class precision/recall/F1 and saves a confusion
matrix image, same as evaluate.py does for the severity model.
"""

from pathlib import Path
import sys
import numpy as np

MODEL_PATH = Path("models/best_type.pt")
DATA_DIR = Path("dataset_type")
OUT_IMG = Path("models/confusion_matrix_type.png")


def main():
    if not MODEL_PATH.exists():
        print(f"[ERROR] Model not found at {MODEL_PATH}. Run train_type.py first.")
        return
    if not (DATA_DIR / "val").exists():
        print(f"[ERROR] '{DATA_DIR}/val' not found. Run prepare_dataset_type.py first.")
        return

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics is not installed. Run: pip install ultralytics")
        sys.exit(1)

    model = YOLO(str(MODEL_PATH))

    print("[INFO] Running validation for Waste-Type Classifier...")
    metrics = model.val(data=str(DATA_DIR))

    try:
        top1 = metrics.top1
        top5 = metrics.top5
        print(f"\nTop-1 accuracy: {top1:.4f}")
        print(f"Top-5 accuracy: {top5:.4f}")
    except Exception as e:
        print(f"[WARNING] Could not read summary metrics ({e}). "
              f"Check the console output above for per-class details.")

    run_dir = Path(metrics.save_dir) if hasattr(metrics, "save_dir") else None
    if run_dir:
        candidate = run_dir / "confusion_matrix.png"
        if candidate.exists():
            import shutil
            OUT_IMG.parent.mkdir(exist_ok=True)
            shutil.copy2(candidate, OUT_IMG)
            print(f"Confusion matrix saved to: {OUT_IMG}")
        else:
            print(f"[WARNING] No confusion matrix image found in {run_dir}.")

    n_val_total = sum(
        len(list(d.glob("*"))) for d in (DATA_DIR / "val").iterdir() if d.is_dir()
    )
    if n_val_total < 30:
        print(f"\n[WARNING] Only {n_val_total} validation images total. "
              f"These numbers can show 100% or 0% purely by chance — not "
              f"meaningful until you evaluate on a much larger validation set.")


if __name__ == "__main__":
    main()
