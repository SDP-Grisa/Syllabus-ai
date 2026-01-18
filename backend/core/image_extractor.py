import fitz  # PyMuPDF
import os
from PIL import Image
import imagehash
from io import BytesIO
import math

SEEN_IMAGE_HASHES = {}
PAGE_IMAGE_COUNT = {}

def image_entropy(img: Image.Image) -> float:
    """
    Measure visual complexity.
    Low entropy = logos / flat patterns
    """
    histogram = img.histogram()
    total = sum(histogram)
    entropy = 0
    for count in histogram:
        if count == 0:
            continue
        p = count / total
        entropy -= p * math.log2(p)
    return entropy


# def extract_images_from_pdf(
#     pdf_path: str,
#     output_dir: str = "data/images",
#     min_width: int = 200,
#     min_height: int = 200,
#     edge_margin_ratio: float = 0.15,
#     entropy_threshold: float = 4.5,
#     repeat_threshold: int = 3
# ):
#     os.makedirs(output_dir, exist_ok=True)
#     doc = fitz.open(pdf_path)

#     extracted = []

#     for page_num in range(len(doc)):
#         page = doc[page_num]
#         page_width = page.rect.width
#         page_height = page.rect.height

#         images = page.get_images(full=True)

#         for img_index, img in enumerate(images):
#             xref = img[0]
#             base_image = doc.extract_image(xref)

#             image_bytes = base_image["image"]
#             ext = base_image["ext"]

#             # 🔹 Image position
#             rects = page.get_image_rects(xref)
#             if not rects:
#                 continue

#             rect = rects[0]
#             x0, y0, x1, y1 = rect

#             image = Image.open(BytesIO(image_bytes)).convert("RGB")
#             width, height = image.size

#             # 🚫 Size filter
#             if width < min_width or height < min_height:
#                 continue

#             # 🚫 Edge filter (headers / footers / side logos)
#             if (
#                 y0 < page_height * edge_margin_ratio or
#                 y1 > page_height * (1 - edge_margin_ratio) or
#                 x0 < page_width * edge_margin_ratio or
#                 x1 > page_width * (1 - edge_margin_ratio)
#             ):
#                 continue

#             # 🚫 Aspect ratio filter (logos are wide & short)
#             aspect_ratio = width / height
#             if aspect_ratio > 4 or aspect_ratio < 0.25:
#                 continue

#             # 🚫 Low entropy images (logos, watermarks)
#             entropy = image_entropy(image)
#             if entropy < entropy_threshold:
#                 continue

#             # 🚫 Repetition detection
#             img_hash = imagehash.phash(image)
#             hash_key = str(img_hash)

#             PAGE_IMAGE_COUNT[hash_key] = PAGE_IMAGE_COUNT.get(hash_key, 0) + 1
#             if PAGE_IMAGE_COUNT[hash_key] >= repeat_threshold:
#                 continue

#             # ✅ SAVE image
#             image_name = f"page_{page_num+1}_img_{img_index}.{ext}"
#             image_path = os.path.join(output_dir, image_name)
#             image.save(image_path)

#             extracted.append({
#                 "page": page_num + 1,
#                 "path": image_path,
#                 "width": width,
#                 "height": height,
#                 "entropy": round(entropy, 2)
#             })

#     return extracted


import fitz  # PyMuPDF
import os

def extract_images_from_pdf(pdf_path: str):
    images = []
    doc = fitz.open(pdf_path)  # MUST be string path

    output_dir = "data/images"
    os.makedirs(output_dir, exist_ok=True)

    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]

            image_path = f"{output_dir}/page{page_index+1}_{img_index}.{image_ext}"
            with open(image_path, "wb") as f:
                f.write(image_bytes)

            images.append(image_path)

    return images
