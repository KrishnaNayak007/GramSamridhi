"""
SWC AI - STEP 4: Prepare / Split the Dataset (Severity: low, medium, critical)
----------------------------------------------
Takes images from:
    dataset_raw/low/, dataset_raw/medium/, dataset_raw/critical/

And builds the folder structure Ultralytics YOLO classification expects:
    dataset/train/low/  dataset/train/medium/  dataset/train/critical/
    dataset/val/low/    dataset/val/medium/    dataset/val/critical/

IMPORTANT - SMALL DATASET HANDLING (as requested):
    - 0 images in a class  -> skipped with a clear warning (nothing to copy)
    - 1 image in a class   -> that single image is copied to BOTH train and val,
                               with a loud warning that this is pipeline-testing only
    - 2 images in a class  -> 1 goes to train, 1 goes to val
    - 3+ images in a class -> normal 80/20 split (at least 1 image guaranteed in val)

This NEVER crashes on a tiny dataset. It just warns you clearly.
Once you add more images, re-run this script and it will automatically
switch to a proper train/val split.

Save this file as:  SWC_AI/prepare_dataset.py
Run with:            python prepare_dataset.py
"""

import shutil
from pathlib import Path
import random

RAW_DATASET_DIR = Path("dataset_raw")
OUTPUT_DIR = Path("dataset")
CLASSES = ["low", "medium", "critical"]
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VAL_SPLIT = 0.2
SEED = 42


def clean_output_dir():
    """Remove any previous split so re-running this script is always safe/repeatable."""
    for split in ["train", "val"]:
        for cls in CLASSES:
            folder = OUTPUT_DIR / split / cls
            if folder.exists():
                shutil.rmtree(folder)
            folder.mkdir(parents=True, exist_ok=True)


def split_class_images(images, val_split=VAL_SPLIT):
    """Return (train_list, val_list) for one class, handling tiny counts gracefully."""
    random.seed(SEED)
    images = list(images)
    random.shuffle(images)
    n = len(images)

    if n == 0:
        return [], []
    if n == 1:
        return images, images
    if n == 2:
        return [images[0]], [images[1]]

    n_val = max(1, round(n * val_split))
    n_val = min(n_val, n - 1)
    val_imgs = images[:n_val]
    train_imgs = images[n_val:]
    return train_imgs, val_imgs


def prepare_dataset():
    if not RAW_DATASET_DIR.exists():
        print(f"[ERROR] {RAW_DATASET_DIR} not found. Create folders dataset_raw/low, dataset_raw/medium, dataset_raw/critical and add images.")
        return

    clean_output_dir()

    print("=" * 55)
    print("SWC AI - DATASET PREPARATION / SPLIT (SEVERITY)")
    print("=" * 55)

    warnings = []
    summary = []

    for cls in CLASSES:
        cls_dir = RAW_DATASET_DIR / cls
        images = []
        if cls_dir.exists():
            images = [
                f for f in cls_dir.iterdir()
                if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS
            ]

        if len(images) == 0:
            warnings.append(f"'{cls}' has 0 images - it will be MISSING from training. Add images and re-run.")
            summary.append((cls, 0, 0))
            continue

        if len(images) == 1:
            warnings.append(
                f"'{cls}' has only 1 image. Using it for BOTH train and val "
                f"(pipeline test only - not a real evaluation)."
            )

        train_imgs, val_imgs = split_class_images(images)

        for img in train_imgs:
            shutil.copy2(img, OUTPUT_DIR / "train" / cls / img.name)
        for img in val_imgs:
            dest = OUTPUT_DIR / "val" / cls / img.name
            if dest.exists() and img in train_imgs and img in val_imgs:
                dest = OUTPUT_DIR / "val" / cls / f"val_{img.name}"
            shutil.copy2(img, dest)

        summary.append((cls, len(train_imgs), len(val_imgs)))

    print(f"\n{'Class':<12}{'Train imgs':<13}{'Val imgs'}")
    print("-" * 35)
    for cls, ntr, nva in summary:
        print(f"{cls:<12}{ntr:<13}{nva}")

    if warnings:
        print("\n[WARNINGS]")
        for w in warnings:
            print(f"  - {w}")

    total_train = sum(s[1] for s in summary)
    total_val = sum(s[2] for s in summary)

    if total_train == 0:
        print("\n[ERROR] No training images available at all. Add images to dataset_raw/ and re-run.")
    else:
        print(f"\nDone. dataset/train has {total_train} images, dataset/val has {total_val} images.")
        print("Continue to train.py.")


if __name__ == "__main__":
    prepare_dataset()
