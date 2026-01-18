def classify_question(q):
    q = q.lower()
    if "diagram" in q or "draw" in q:
        return "diagram"
    if "compare" in q:
        return "comparison"
    if "define" in q:
        return "definition"
    return "explanation"
