import chromadb
from typing import List

# In-memory client - works perfectly on Render free tier (no disk needed)
_client = None

def get_client():
    global _client
    if _client is None:
        _client = chromadb.Client()  # ephemeral in-memory
    return _client


def store_chunks(pdf_id: str, chunks: List[str], embeddings: List[List[float]]):
    client = get_client()
    # Delete existing collection if any (re-upload case)
    try:
        client.delete_collection(name=f"pdf_{pdf_id}")
    except Exception:
        pass
    collection = client.create_collection(
        name=f"pdf_{pdf_id}",
        metadata={"hnsw:space": "cosine"}
    )
    ids = [f"{pdf_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"pdf_id": pdf_id, "chunk_index": i} for i in range(len(chunks))],
        ids=ids
    )


def query_pdf(pdf_id: str, query_embedding: List[float], top_k: int = 5) -> List[str]:
    client = get_client()
    try:
        collection = client.get_collection(name=f"pdf_{pdf_id}")
    except Exception:
        return []

    count = collection.count()
    if count == 0:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count)
    )

    retrieved = []
    if results and results['distances']:
        for score, doc in zip(results['distances'][0], results['documents'][0]):
            if score <= 0.7:
                retrieved.append(doc)

    if not retrieved and results and results['documents']:
        retrieved = results['documents'][0][:3]

    return retrieved


def delete_pdf_collection(pdf_id: str) -> bool:
    client = get_client()
    try:
        client.delete_collection(name=f"pdf_{pdf_id}")
        return True
    except Exception:
        return False


def collection_exists(pdf_id: str) -> bool:
    client = get_client()
    try:
        client.get_collection(name=f"pdf_{pdf_id}")
        return True
    except Exception:
        return False