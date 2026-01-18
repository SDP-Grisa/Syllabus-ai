import os
import requests
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError("HF_TOKEN not found in environment variables")

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct:fastest"


def llm_query(question: str, chunks: list) -> str:
    """
    Ask Meta-LLaMA using PDF chunks as context.
    """
    if not chunks:
        return "No content available from the PDF."

    # 🔒 Limit context to avoid token overflow
    context = "\n".join(
        f"Page {c['page']}: {c['text']}"
        for c in chunks[:20]
    )

    prompt = f"""
You are a professional technical assistant.

Your task:
- Answer strictly using the provided PDF content.
- Do NOT return keyword lists.
- Format the answer based on the question type.

Formatting rules:
1. If the question starts with or implies:
   "what are", "list", "common uses", "advantages", "types"
   → Return the answer as BULLET POINTS.
   - Each bullet must be a full sentence.
   - Use "•" for bullets.

2. If the question includes:
   "explain", "describe", "write", "essay", "notes"
   → Return the answer in PARAGRAPHS.
   - Clear, well-structured paragraphs.
   - No bullet points unless explicitly requested.

3. If the answer is not present in the document:
   → Respond exactly with:
   "Answer not found in the document."

PDF CONTENT:
{context}

QUESTION:
{question}

IMPORTANT:
- Be clear, structured, and professional.
- Do NOT compress answers into short phrases.
"""


    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You answer strictly from the given PDF."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 300,
        "temperature": 0.1
    }

    try:
        response = requests.post(
            HF_API_URL,
            headers=HEADERS,
            json=payload,
            timeout=60
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"HF LLaMA API Error: {response.text}"
            )

        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

    except requests.exceptions.RequestException as e:
        return f"❌ LLM request failed: {str(e)}"



# from transformers import AutoTokenizer, AutoModelForCausalLM
# import torch

# tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
# model = AutoModelForCausalLM.from_pretrained(
#     "mistralai/Mistral-7B-Instruct-v0.2",
#     torch_dtype=torch.float16,
#     device_map="auto"
# )

# def generate_answer(prompt):
#     inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
#     outputs = model.generate(**inputs, max_new_tokens=400)
#     return tokenizer.decode(outputs[0], skip_special_tokens=True)


# from openai import OpenAI, RateLimitError, OpenAIError
# import os
# from dotenv import load_dotenv

# load_dotenv()

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# def llm_query(question: str, chunks: list) -> str:
#     if not chunks:
#         return "No content available from the PDF."

#     context = "\n".join(
#         f"Page {c['page']}: {c['text']}" for c in chunks
#     )

#     prompt = f"""
# Answer the question strictly using the PDF content.
# If the answer is not present, say:
# "Answer not found in the document."

# PDF CONTENT:
# {context}

# QUESTION:
# {question}
# """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": "You answer only from the provided PDF."},
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.2,
#             max_tokens=400
#         )

#         return response.choices[0].message.content.strip()

#     except RateLimitError:
#         return "❌ LLM quota exceeded. Enable billing or use a local LLM."

#     except OpenAIError as e:
#         return f"❌ LLM error: {str(e)}"

#     except Exception as e:
#         return f"❌ Unexpected error: {str(e)}"
