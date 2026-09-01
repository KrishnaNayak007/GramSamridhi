"""
STEP T3 - Train the WASTE-TYPE classifier (organic / inorganic / mixed)

Same recipe as the severity classifier: YOLOv8-classification, transfer
learning from ImageNet-pretrained yolov8n-cls.pt, fine-tuned on
dataset_type/train + dataset_type/val.

This is a SEPARATE model from the severity classifier — it answers a
different question (what KIND of waste is it) rather than (how BAD is it).
Both models run independently and their results are combined later in
predict_type.py / app.py.
"""

from pathlib import Path
import sys

DATA_DIR = Path("dataset_type")
MODELS_DIR = Path("models")
EPOCHS = 30
IMG_SIZE = 224


def main():
    if not (DATA_DIR / "train").exists() or not (DATA_DIR / "val").exists():
        print(f"[ERROR] '{DATA_DIR}/train' or '{DATA_DIR}/val' not found. "
              f"Run prepare_dataset_type.py first.")
        return

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics is not installed. Run: pip install ultralytics")
        sys.exit(1)

    MODELS_DIR.mkdir(exist_ok=True)

    # Sanity-check dataset size so tiny test runs don't look like real results
    train_counts = {
        d.name: len(list(d.glob("*")))
        for d in (DATA_DIR / "train").iterdir() if d.is_dir()
    }
    total_train = sum(train_counts.values())
    if total_train < 30:
        print(f"[WARNING] Only {total_train} training images total "
              f"({train_counts}). This run is for pipeline-testing only — "
              f"add more photos per class for a model you can trust.")

    print("[INFO] Loading pretrained yolov8n-cls.pt (ImageNet weights)...")
    model = YOLO("yolov8n-cls.pt")

    print(f"[INFO] Fine-tuning on {DATA_DIR}/ for {EPOCHS} epochs...")
    results = model.train(
        data=str(DATA_DIR),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        project=str(MODELS_DIR),
        name="waste_type_run",
        exist_ok=True,
    )

    # Ultralytics saves weights under models/waste_type_run/weights/best.pt
    best_src = MODELS_DIR / "waste_type_run" / "weights" / "best.pt"
    best_dst = MODELS_DIR / "best_type.pt"

    if best_src.exists():
        import shutil
        shutil.copy2(best_src, best_dst)
        print(f"\nTraining complete. Best model saved to: {best_dst}")
    else:
        print(f"[ERROR] Expected weights at {best_src} but they were not "
              f"found. Check the training log above for errors.")


if __name__ == "__main__":
    main()
