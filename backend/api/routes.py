from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import os

from core import pdf_loader, chunking
from core.llm import llm_query  # LLM query module
from core.image_extractor import extract_images_from_pdf

router = APIRouter()

# Temporary storage for the currently uploaded PDF
current_pdf_chunks = []  # List of dicts: [{"page": int, "text": str}]
current_pdf_images = []


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

        # 🖼️ Extract images
        images = extract_images_from_pdf(path)

        # Convert to URLs
        image_urls = [
            f"http://localhost:8000/static/images/{os.path.basename(img)}"
            for img in images
        ]

        current_pdf_chunks = all_chunks
        current_pdf_images = image_urls

        print(f"✅ PDF processed")
        print(f"📦 Chunks: {len(all_chunks)}")
        print(f"🖼️ Images: {len(image_urls)}")

    except Exception as e:
        print(f"❌ Error: {e}")
        current_pdf_chunks = []
        current_pdf_images = []



@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF and process it synchronously.
    Returns both text chunks and extracted images immediately.
    """
    global current_pdf_chunks, current_pdf_images

    try:
        # Save uploaded PDF
        pdf_path = f"data/pdf/{file.filename}"
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        # Process PDF synchronously
        process_pdf(pdf_path)

        return {
            "status": "PDF processed successfully.",
            "chunks": current_pdf_chunks,
            "images": current_pdf_images
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})



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



@router.post("/ask")
async def ask_question(question: str):
    global current_pdf_chunks, current_pdf_images

    if not current_pdf_chunks:
        return JSONResponse(
            status_code=400,
            content={"error": "No PDF processed yet."}
        )

    try:
        answer = llm_query(question, current_pdf_chunks)

        return {
            "answer": answer,
            "images": current_pdf_images,
            "confidence": 0.85,  # optional heuristic
            "sources": list({f"Page {c['page']}" for c in current_pdf_chunks[:5]})
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
