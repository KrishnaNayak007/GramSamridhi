"""
SWC AI - STEP 3: Inspect Your Dataset
----------------------------------------
Inspects raw datasets in dataset_raw/ (severity) and dataset_type_raw/ (type).
Reports counts of valid images, identifies corrupted files, and warns
if classes have too few images for meaningful training.
"""

from pathlib import Path
from PIL import Image

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
SEVERITY_CLASSES = ["low", "medium", "critical"]
TYPE_CLASSES = ["organic", "inorganic", "mixed"]


def inspect_folder(raw_dir: Path, classes: list, title: str):
    print("=" * 60)
    print(f"INSPECTING: {title} ({raw_dir})")
    print("=" * 60)

    if not raw_dir.exists():
        print(f"[ERROR] Directory '{raw_dir}' does not exist.")
        print(f"Please create subfolders: {', '.join(classes)} and add photos.\n")
        return

    summary = []
    corrupted = []

    for cls in classes:
        cls_dir = raw_dir / cls
        if not cls_dir.exists():
            summary.append((cls, 0, "[MISSING FOLDER]"))
            continue

        valid_count = 0
        for f in cls_dir.iterdir():
            if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS:
                try:
                    with Image.open(f) as img:
                        img.verify()
                    valid_count += 1
                except Exception:
                    corrupted.append(f)

        status = "[OK]"
        if valid_count == 0:
            status = "[EMPTY - 0 images]"
        elif valid_count < 10:
            status = f"[TINY - {valid_count} images (pipeline testing only)]"
        elif valid_count < 50:
            status = f"[SMALL - {valid_count} images]"
        else:
            status = f"[GOOD - {valid_count} images]"

        summary.append((cls, valid_count, status))

    print(f"{'Class':<15}{'Images':<10}{'Status'}")
    print("-" * 50)
    for cls, count, status in summary:
        print(f"{cls:<15}{count:<10}{status}")

    if corrupted:
        print(f"\n[WARNING] Found {len(corrupted)} corrupted image(s):")
        for c in corrupted:
            print(f"  - {c}")

    total_images = sum(s[1] for s in summary)
    print(f"\nTotal valid images: {total_images}\n")


def main():
    inspect_folder(Path("dataset_raw"), SEVERITY_CLASSES, "Severity Dataset")
    inspect_folder(Path("dataset_type_raw"), TYPE_CLASSES, "Waste-Type Dataset")


if __name__ == "__main__":
    main()
