"""
SWC AI - STEP 5: Train the Severity Classification Model
------------------------------------------------------------
This script:
  1. Loads the dataset from ./dataset (train/ + val/)
  2. Fine-tunes a small pretrained YOLOv8 classifier on it
  3. Prints training progress per epoch
  4. Saves the best checkpoint to models/best.pt
  5. Saves training curves/results to runs/
"""

from pathlib import Path
import shutil
import sys

DATASET_DIR = Path("dataset")
MODELS_DIR = Path("models")
RUN_NAME = "swc_severity"


def count_images(split):
    total = 0
    split_path = DATASET_DIR / split
    if not split_path.exists():
        return 0
    for cls_dir in split_path.iterdir():
        if cls_dir.is_dir():
            total += len(list(cls_dir.glob("*.*")))
    return total


def main():
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics is not installed. Run: pip install ultralytics")
        sys.exit(1)

    if not DATASET_DIR.exists() or not (DATASET_DIR / "train").exists():
        print("[ERROR] dataset/train not found. Run prepare_dataset.py first.")
        sys.exit(1)

    n_train = count_images("train")
    n_val = count_images("val")

    if n_train == 0:
        print("[ERROR] dataset/train has 0 images. Add images to dataset_raw/ and re-run prepare_dataset.py.")
        sys.exit(1)

    print("=" * 55)
    print("SWC AI - MODEL TRAINING")
    print("=" * 55)
    print(f"Training images: {n_train}   Validation images: {n_val}")

    tiny_dataset = n_train < 30
    if tiny_dataset:
        print(
            "\n[WARNING] Your training set is very small. This run will only prove "
            "the PIPELINE works end-to-end. The resulting model will NOT be "
            "accurate in the real world. Add hundreds of images per class later "
            "and re-run this script - nothing else needs to change."
        )

    # Hyperparameters
    epochs = 15 if tiny_dataset else 50
    imgsz = 224
    batch = min(8, max(2, n_train // 2))

    MODELS_DIR.mkdir(exist_ok=True)

    # Load YOLOv8 classification model
    model = YOLO("yolov8n-cls.pt")

    print(f"\nStarting training: epochs={epochs}, imgsz={imgsz}, batch={batch}\n")

    # Train the model
    results = model.train(
        data=str(DATASET_DIR.resolve()),
        project="runs",
        name=RUN_NAME,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        exist_ok=True,
    )

    # Dynamically locate saved weights folder from Ultralytics trainer
    run_dir = Path(model.trainer.save_dir)
    best_weights = run_dir / "weights" / "best.pt"

    if not best_weights.exists():
        print(f"[ERROR] Training finished but best.pt was not found at {best_weights}")
        sys.exit(1)

    # Copy best weights to models/best.pt
    dest = MODELS_DIR / "best.pt"
    shutil.copy2(best_weights, dest)

    print("\n" + "=" * 55)
    print(f"Training complete. Best model saved to: {dest.resolve()}")
    print(f"Full training logs / plots saved to: {run_dir.resolve()}")
    print("=" * 55)

    if tiny_dataset:
        print(
            "\nReminder: this model was trained on a tiny dataset and is for "
            "pipeline testing only. Do not treat its predictions as reliable yet."
        )

    print("\nNext step: run evaluate.py, then predict.py.")


if __name__ == "__main__":
    main()
