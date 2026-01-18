import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

SYSTEM_PROMPT = """
You are a university professor.
Answer strictly from the provided syllabus content.
Do not hallucinate.
If the answer is not in the syllabus, clearly say so.
Write exam-oriented, structured answers.
"""

def generate_answer(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=500
    )

    return response.choices[0].message.content.strip()
