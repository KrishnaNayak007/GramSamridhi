"""
STEP T2 - Prepare / split the WASTE-TYPE dataset (organic / inorganic / mixed)

Reads images from:
    dataset_type_raw/organic/
    dataset_type_raw/inorganic/
    dataset_type_raw/mixed/

Writes an 80/20 train/val split to:
    dataset_type/train/<class>/
    dataset_type/val/<class>/

Mirrors the behaviour of prepare_dataset.py for the severity classifier:
never crashes, always rebuilds the split from scratch, warns (but still
runs) if a class has very few images.
"""

import shutil
import random
from pathlib import Path

RAW_DIR = Path("dataset_type_raw")
OUT_DIR = Path("dataset_type")
CLASSES = ["organic", "inorganic", "mixed", "not_waste"]
VALID_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VAL_SPLIT = 0.2
SEED = 42


def collect_images(class_dir: Path):
    if not class_dir.exists():
        return []
    return sorted(
        p for p in class_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in VALID_EXT
    )


def main():
    random.seed(SEED)

    if not RAW_DIR.exists():
        print(f"[ERROR] '{RAW_DIR}' not found. Create it with subfolders: "
              f"{', '.join(CLASSES)} and add your photos, then re-run.")
        return

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)

    total_copied = 0
    any_class_populated = False

    for cls in CLASSES:
        class_dir = RAW_DIR / cls
        images = collect_images(class_dir)

        if len(images) == 0:
            print(f"[WARNING] No valid images found for class '{cls}' "
                  f"in {class_dir}. Skipping this class for now — "
                  f"training will fail until you add at least 1 image.")
            continue

        any_class_populated = True
        random.shuffle(images)

        if len(images) == 1:
            print(f"[WARNING] Class '{cls}' has only 1 image. Reusing it "
                  f"for both train and val (pipeline-testing only — not "
                  f"a real evaluation).")
            train_imgs = images
            val_imgs = images
        else:
            n_val = max(1, round(len(images) * VAL_SPLIT))
            val_imgs = images[:n_val]
            train_imgs = images[n_val:]
            if len(train_imgs) == 0:
                train_imgs = val_imgs

        for split_name, split_imgs in (("train", train_imgs), ("val", val_imgs)):
            dest_dir = OUT_DIR / split_name / cls
            dest_dir.mkdir(parents=True, exist_ok=True)
            for img_path in split_imgs:
                shutil.copy2(img_path, dest_dir / img_path.name)
                total_copied += 1

        print(f"[OK] {cls}: {len(train_imgs)} train / {len(val_imgs)} val "
              f"(from {len(images)} source images)")

    if not any_class_populated:
        print("[ERROR] No images found in any class folder. Add photos to "
              f"dataset_type_raw/<class>/ and re-run this script.")
        return

    print(f"\nDone. Copied {total_copied} files into '{OUT_DIR}/'.")
    print("Re-run this script any time you add more images; it always "
          "rebuilds the split from scratch.")


if __name__ == "__main__":
    main()
