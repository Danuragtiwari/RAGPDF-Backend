from sentence_transformers import SentenceTransformer

# load once at startup
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embeddings(chunks):
    """
    Input: list[str]
    Output: list[list[float]]
    """
    return model.encode(chunks).tolist()

def get_query_embedding(query: str):
    """
    Input: single query string
    Output: list[float]
    """
    return model.encode([query])[0].tolist()