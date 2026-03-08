import chromadb

client = chromadb.PersistentClient(path="data/chroma")
def store_chunks(pdf_id, chunks, embeddings):
    collection_name = f"pdf_{pdf_id}"
    print("COLLECTION NAME:", collection_name)
    # get or create collection (important fix)
    collection = client.get_or_create_collection(name=collection_name)
    print("COLLECTION INFO BEFORE:", collection.count(), "chunks stored.")

    # unique ids for each chunk
    print(chunks,len(chunks))
    ids = [f"{pdf_id}_{i}" for i in range(len(chunks))]
    print("IDS:", ids)
    # metadata
    metadatas = [{"pdf_id": pdf_id} for _ in chunks]
    print("METADATAS:", metadatas)
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )
    print(f"Stored {len(chunks)} chunks for PDF ID: {pdf_id}")
    print("Collection info:", collection.count(), "chunks stored.")

def query_pdf(pdf_id, query_embedding, top_k=3, threshold=0.7):
    collection_name = f"pdf_{pdf_id}"
    collection = client.get_collection(name=collection_name)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    retrieved = []

    # ⚠️ IMPORTANT: Chroma returns distance, not similarity
    # distance small = more similar

    for distance, doc in zip(results["distances"][0], results["documents"][0]):
        similarity = 1 - distance   # convert to similarity

        if similarity >= threshold:
            retrieved.append(doc)

    return retrieved