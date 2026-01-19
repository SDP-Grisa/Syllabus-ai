# core/vector_store.py
# core/vector_store.py
import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DIR = os.path.join(BASE_DIR, "data", "chroma")

os.makedirs(CHROMA_DIR, exist_ok=True)

client = chromadb.PersistentClient(
    path=CHROMA_DIR,
    settings=Settings(
        anonymized_telemetry=False
    )
)

collection = client.get_or_create_collection(name="pdf_chunks")

embedder = SentenceTransformer("all-MiniLM-L6-v2")


# import faiss
# import numpy as np

# class VectorDB:
#     def __init__(self, dim):
#         self.index = faiss.IndexFlatIP(dim)
#         self.meta = []

#     def add(self, embeddings, metadata):
#         self.index.add(np.array(embeddings))
#         self.meta.extend(metadata)

#     def search(self, query_emb, k):
#         scores, idx = self.index.search(query_emb, k)
#         return [(self.meta[i], scores[0][pos]) for pos, i in enumerate(idx[0])]
