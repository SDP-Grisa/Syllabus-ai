import fitz  # PyMuPDF
import os
from PIL import Image
import imagehash
from io import BytesIO
import math

# -------------------------------
# Global trackers
# -------------------------------
SEEN_IMAGE_HASHES = {}     # hash -> count
PAGE_IMAGE_COUNT = {}     # page -> count
PDF_IMAGE_HASHES = {}     # hash -> metadata


# -------------------------------
# Utility: image entropy
# -------------------------------
def image_entropy(img: Image.Image) -> float:
    histogram = img.histogram()
    total = sum(histogram)
    entropy = 0.0

    for count in histogram:
        if count == 0:
            continue
        p = count / total
        entropy -= p * math.log2(p)

    return entropy


# -------------------------------
# Main extractor
# -------------------------------
def extract_images_from_pdf(pdf_path: str):
    global PDF_IMAGE_HASHES, SEEN_IMAGE_HASHES, PAGE_IMAGE_COUNT

    PDF_IMAGE_HASHES.clear()
    SEEN_IMAGE_HASHES.clear()
    PAGE_IMAGE_COUNT.clear()

    images = []
    doc = fitz.open(pdf_path)

    output_dir = "data/images"
    os.makedirs(output_dir, exist_ok=True)

    # ---- Tunable thresholds ----
    HASH_DISTANCE_THRESHOLD = 5      # similarity threshold
    MIN_ENTROPY = 4.0                # logos usually < 3
    MAX_IMAGES_PER_PAGE = 3          # avoid noisy pages

    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)
        PAGE_IMAGE_COUNT[page_index] = 0

        for img_index, img in enumerate(image_list):
            if PAGE_IMAGE_COUNT[page_index] >= MAX_IMAGES_PER_PAGE:
                break

            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]

            pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")

            # 🧠 Skip low-entropy images (logos, watermarks)
            entropy = image_entropy(pil_img)
            if entropy < MIN_ENTROPY:
                continue

            img_hash = imagehash.phash(pil_img)

            # 🔁 Duplicate detection
            is_duplicate = False
            for seen_hash in SEEN_IMAGE_HASHES:
                if abs(img_hash - seen_hash) <= HASH_DISTANCE_THRESHOLD:
                    SEEN_IMAGE_HASHES[seen_hash] += 1
                    is_duplicate = True
                    break

            if is_duplicate:
                continue

            # ✅ Save image
            image_path = f"{output_dir}/page{page_index+1}_{img_index}.{image_ext}"
            with open(image_path, "wb") as f:
                f.write(image_bytes)

            images.append(image_path)

            # 🔑 Track hashes
            SEEN_IMAGE_HASHES[img_hash] = 1
            PAGE_IMAGE_COUNT[page_index] += 1

            PDF_IMAGE_HASHES[str(img_hash)] = {
                "page": page_index + 1,
                "path": image_path
            }

    return images
