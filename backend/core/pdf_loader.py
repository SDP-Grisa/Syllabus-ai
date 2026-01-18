import fitz
from PIL import Image
import os

def extract_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text_chunks = []
    image_paths = []

    for i, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            text_chunks.append((i + 1, text))

        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base = doc.extract_image(xref)
            img_bytes = base["image"]
            img_path = f"data/images/page_{i+1}_{img_index}.png"
            with open(img_path, "wb") as f:
                f.write(img_bytes)
            image_paths.append((i + 1, img_path))

    return text_chunks, image_paths
