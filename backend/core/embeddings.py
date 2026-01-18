from sentence_transformers import SentenceTransformer

# model = SentenceTransformer("BAAI/bge-large-en-v1.5")
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(texts):
    return model.encode(texts, normalize_embeddings=True)
