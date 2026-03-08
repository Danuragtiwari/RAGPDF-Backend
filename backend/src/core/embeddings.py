from fastembed import TextEmbedding
from typing import List

_model = None

def get_model():
    global _model
    if _model is None:
        _model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _model

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_model()
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]

def generate_query_embedding(query: str) -> List[float]:
    model = get_model()
    embeddings = list(model.embed([query]))
    return embeddings[0].tolist()