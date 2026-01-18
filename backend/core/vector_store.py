# core/vector_store.py
import chromadb
from sentence_transformers import SentenceTransformer

client = chromadb.Client(
    chromadb.config.Settings(
        persist_directory="data/chroma"
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
