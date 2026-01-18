from models.llm import generate_answer

def rag_answer(question, results, q_type):
    context = "\n".join([r[0]["content"] for r in results])

    prompt = f"""
You are a university professor.
Answer strictly from the syllabus content.

Question Type: {q_type}

Syllabus Content:
{context}

Question:
{question}

If not found, say it is not in syllabus.
Answer in exam-oriented format.
"""

    return generate_answer(prompt)
