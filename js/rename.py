"""
rename_images.py
Renames all image files in the current folder to sequential numbers.
Usage: place this script in the folder with your images and run: python rename_images.py
"""

import os
from pathlib import Path

# ---------- CONFIG ----------
FOLDER = "."  # current folder — change to a specific path if needed
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
START_NUMBER = 1
PAD_WIDTH = 0  # set to 2 for 01, 02... or 3 for 001, 002...

# ---------- SCRIPT ----------
def main():
    folder = Path(FOLDER).resolve()
    print(f"📁 Folder: {folder}\n")

    # Get all image files
    files = sorted([
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in EXTENSIONS
    ])

    if not files:
        print("❌ No image files found.")
        return

    print(f"🖼  Found {len(files)} image file(s):\n")
    for f in files:
        print(f"   - {f.name}")

    print("\n🔄 Renaming...\n")

    # Rename to temporary names first (avoids collisions)
    temp_files = []
    for i, f in enumerate(files, start=START_NUMBER):
        temp_name = f"__temp_{i}__{f.suffix.lower()}"
        temp_path = folder / temp_name
        f.rename(temp_path)
        temp_files.append((temp_path, f.suffix.lower(), i))

    # Rename to final numeric names
    for temp_path, ext, i in temp_files:
        number = str(i).zfill(PAD_WIDTH) if PAD_WIDTH > 0 else str(i)
        final_name = f"{number}{ext}"
        final_path = folder / final_name
        temp_path.rename(final_path)
        print(f"   ✅ {final_name}")

    print(f"\n🎉 Done! Renamed {len(files)} files.")


if __name__ == "__main__":
    main()
