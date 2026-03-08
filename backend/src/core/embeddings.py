from sentence_transformers import SentenceTransformer
from typing import List

_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of text chunks."""
    model = get_model()
    embeddings = model.encode(texts, convert_to_list=True)
    return embeddings


def generate_query_embedding(query: str) -> List[float]:
    """Generate embedding for a single query string."""
    model = get_model()
    embedding = model.encode([query], convert_to_list=True)[0]
    return embedding