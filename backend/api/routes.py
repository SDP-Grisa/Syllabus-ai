from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import re
from core import pdf_loader, chunking
from core.llm import llm_query
from core.image_extractor import extract_images_from_pdf, PDF_IMAGE_HASHES
from core.vector_store import collection, embedder
from PIL import Image
import imagehash
from io import BytesIO
from fastapi import Form, File, UploadFile
import uuid


router = APIRouter()

# Temporary storage for the currently uploaded PDF
current_pdf_chunks = []  # List of dicts: [{"page": int, "text": str}]
current_pdf_images = []

def clear_folder(folder_path: str):
    """
    Delete all files inside a folder (not the folder itself).
    """
    if not os.path.exists(folder_path):
        return

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"⚠️ Failed to delete {file_path}: {e}")


def extract_int(value, default=0):
    """
    Recursively extract first integer from any structure.
    """
    if isinstance(value, int):
        return value
    if isinstance(value, (str, float)) and str(value).isdigit():
        return int(value)
    if isinstance(value, (list, tuple)):
        for v in value:
            found = extract_int(v, default)
            if found != default:
                return found
    if isinstance(value, dict):
        for v in value.values():
            found = extract_int(v, default)
            if found != default:
                return found
    return default


def extract_text(value):
    """
    Recursively extract and join text safely.
    """
    if isinstance(value, str):
        return value
    if isinstance(value, (list, tuple)):
        return " ".join(extract_text(v) for v in value if extract_text(v))
    if isinstance(value, dict):
        return extract_text(value.get("text", ""))
    return ""


def process_pdf(path: str):
    if not isinstance(path, str):
        raise TypeError(f"PDF path must be string, got {type(path)}")

    global current_pdf_chunks, current_pdf_images

    try:
        # ===============================
        # 🧹 CLEAR PREVIOUS VECTOR DATA
        # ===============================
        existing = collection.get()
        if existing and existing.get("ids"):
            collection.delete(ids=existing["ids"])
            print(f"🧹 Cleared {len(existing['ids'])} old vectors")
        else:
            print("🧹 Vector DB already empty")

        # ===============================
        # 📄 EXTRACT PDF TEXT
        # ===============================
        raw_pages = pdf_loader.extract_pdf(path)
        all_chunks = []

        for item in raw_pages:
            page = extract_int(item)
            text = extract_text(item)

            if not text.strip():
                continue

            for chunk in chunking.chunk_text(text):
                all_chunks.append({
                    "page": page,
                    "text": chunk
                })

        if not all_chunks:
            raise ValueError("No text chunks extracted from PDF")

        # ===============================
        # 🧠 STORE IN VECTOR DB
        # ===============================
        texts = [c["text"] for c in all_chunks]
        embeddings = embedder.encode(texts, show_progress_bar=False).tolist()

        ids = [str(uuid.uuid4()) for _ in texts]
        metadatas = [{"page": c["page"], "source": "current_pdf"} for c in all_chunks]

        collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

        # ===============================
        # 🖼️ EXTRACT IMAGES
        # ===============================
        images = extract_images_from_pdf(path)

        image_urls = [
            f"http://localhost:8000/static/images/{os.path.basename(img)}"
            for img in images
        ]

        # ===============================
        # 🧠 CACHE IN MEMORY (DEBUG + FALLBACK)
        # ===============================
        current_pdf_chunks = all_chunks
        current_pdf_images = image_urls

        # ===============================
        # ✅ LOGGING
        # ===============================
        print("✅ PDF processed successfully")
        print(f"📦 Vector chunks stored: {len(texts)}")
        print(f"🖼️ Images extracted: {len(image_urls)}")

    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        current_pdf_chunks = []
        current_pdf_images = []
        

def tokenize(text: str) -> set:
    """Basic tokenizer for overlap scoring."""
    return set(re.findall(r"\b\w+\b", text.lower()))


def calculate_confidence(answer: str, chunks: list) -> float:
    """
    Confidence based on:
    1. Grounding strength (max overlap)
    2. Evidence coverage (how many chunks support it)
    Returns value between 0.0 and 1.0
    """

    if not answer or answer.strip().lower() == "answer not found in the document.":
        return 0.0

    answer_tokens = tokenize(answer)
    if not answer_tokens:
        return 0.0

    overlap_ratios = []

    for c in chunks:
        chunk_text = c.get("text", "")
        if not chunk_text:
            continue

        chunk_tokens = tokenize(chunk_text)
        if not chunk_tokens:
            continue

        overlap = answer_tokens.intersection(chunk_tokens)
        overlap_ratio = len(overlap) / len(answer_tokens)

        overlap_ratios.append(overlap_ratio)

    if not overlap_ratios:
        return 0.0

    # 1️⃣ Grounding strength (best supporting chunk)
    grounding_strength = max(overlap_ratios)

    # 2️⃣ Evidence coverage (how many chunks meaningfully support)
    supporting_chunks = sum(1 for r in overlap_ratios if r >= 0.15)
    coverage = min(supporting_chunks / 5, 1.0)  # cap after 5 chunks

    # 3️⃣ Final confidence (weighted)
    confidence = (
        0.6 * grounding_strength +
        0.4 * coverage
    )

    return round(min(confidence, 1.0), 2)


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF, clear old data, process new PDF synchronously.
    """
    global current_pdf_chunks, current_pdf_images

    try:
        # 📂 Define folders
        pdf_dir = "data/pdf"
        image_dir = "data/images"

        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(image_dir, exist_ok=True)

        # 🧹 Clear old files
        clear_folder(pdf_dir)
        clear_folder(image_dir)

        # 🧠 Clear memory
        current_pdf_chunks = []
        current_pdf_images = []

        # 💾 Save new PDF
        pdf_path = os.path.join(pdf_dir, file.filename)
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        # ⚙️ Process PDF
        process_pdf(pdf_path)

        return {
            "status": "PDF processed successfully.",
            "chunks": current_pdf_chunks,
            "images": current_pdf_images
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@router.get("/current-chunks")
async def get_current_chunks():
    """
    Returns the chunks of the currently processed PDF for verification.
    """
    global current_pdf_chunks
    if not current_pdf_chunks:
        return {"status": "No PDF processed yet."}
    return {"chunks": current_pdf_chunks}


def build_context(chunks, max_chars=4000):
    """
    Convert chunks into a single context string for LLM.
    """
    context = []
    total = 0

    for c in chunks:
        text = c.get("text", "").strip()
        if not text:
            continue

        if total + len(text) > max_chars:
            break

        context.append(f"[Page {c['page']}]\n{text}")
        total += len(text)

    return "\n\n".join(context)


def is_image_from_pdf(uploaded_image_bytes: bytes, threshold=6):
    """
    Check if uploaded image belongs to current PDF
    """
    img = Image.open(BytesIO(uploaded_image_bytes)).convert("RGB")
    uploaded_hash = imagehash.phash(img)

    for pdf_hash_str, meta in PDF_IMAGE_HASHES.items():
        pdf_hash = imagehash.hex_to_hash(pdf_hash_str)
        if abs(uploaded_hash - pdf_hash) <= threshold:
            return True, meta

    return False, None


def retrieve_relevant_chunks(question: str, k: int = 5):
    query_embedding = embedder.encode([question]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=k
    )

    chunks = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append({
            "text": doc,
            "page": meta["page"]
        })

    return chunks



@router.post("/ask")
async def ask_question(
    question: str = Form(...),
    image: UploadFile | None = File(None)
):
    global current_pdf_chunks, current_pdf_images

    if collection.count() == 0:
        return JSONResponse(
            status_code=400,
            content={"error": "No PDF vectors found. Upload PDF first."}
        )


    try:
        matched_image = None

        # 🖼️ Image validation
        if image:
            image_bytes = await image.read()
            uploaded_img = Image.open(BytesIO(image_bytes)).convert("RGB")
            uploaded_hash = imagehash.phash(uploaded_img)

            from core.image_extractor import PDF_IMAGE_HASHES

            for stored_hash, meta in PDF_IMAGE_HASHES.items():
                pdf_hash = imagehash.hex_to_hash(stored_hash)
                if abs(uploaded_hash - pdf_hash) <= 6:
                    matched_image = meta
                    break

            if not matched_image:
                return {
                    "answer": "Uploaded image is not from the provided PDF.",
                    "confidence": 0.0,
                    "images": [],
                    "sources": []
                }

        # 🔍 Vector search
        relevant_chunks = retrieve_relevant_chunks(question)

        if not relevant_chunks:
            return {
                "answer": "Answer not found in the document.",
                "confidence": 0.0,
                "images": [],
                "sources": []
            }

        # 🤖 LLM
        answer = llm_query(question, relevant_chunks)
        confidence = calculate_confidence(answer, relevant_chunks)

        response = {
            "answer": answer,
            "confidence": confidence,
            "sources": list({f"Page {c['page']}" for c in relevant_chunks}),
            "images": current_pdf_images
        }

        # 🎯 If image matched → only that image
        if matched_image:
            response["images"] = [
                f"http://localhost:8000/static/images/{os.path.basename(matched_image['path'])}"
            ]

        return response

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
