import chromadb
from sklearn.metrics.pairwise import cosine_similarity
client = chromadb.Client()
def store_chunks(pdf_id, chunks, embeddings):
    collection_name = f"pdf_{pdf_id}"
    collection = client.create_collection(name=collection_name)
    collection.add(documents=chunks, embeddings=embeddings, metadatas=[{"pdf_id": pdf_id}]*len(chunks))

def query_pdf(pdf_id, query_embedding, top_k=3, threshold=0.7):
    collection = client.get_collection(name=f"pdf_{pdf_id}")
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    # Filter by similarity threshold
    retrieved = []
    for score, doc in zip(results['distances'][0], results['documents'][0]):
        if score >= threshold:
            retrieved.append(doc)
    return retrieved
