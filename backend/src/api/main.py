import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from core.document import extract_text_from_pdf, sliding_window_chunking
from core.embeddings import generate_embeddings, generate_query_embedding
from core.rag import store_chunks, query_pdf, delete_pdf_collection, collection_exists
from core.llm import chat_with_rag, chat_without_rag

app = FastAPI(title="RAG PDF Chatbot API", version="1.0.0")

# CORS - Vercel frontend + local dev
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for uploaded PDFs metadata
uploaded_pdfs: dict = {}  # pdf_id -> {name, chunks_count}


class ChatRequest(BaseModel):
    query: str
    pdf_id: Optional[str] = None
    chat_history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    answer: str
    mode: str
    sources: Optional[List[str]] = []


@app.get("/")
def root():
    return {"message": "RAG PDF Chatbot API is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No text found in PDF. It may be a scanned/image PDF.")

    chunks = sliding_window_chunking(text, window_size=400, step_size=200)
    if not chunks:
        raise HTTPException(status_code=400, detail="Could not create chunks from PDF.")

    try:
        embeddings = generate_embeddings(chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")

    pdf_id = str(uuid.uuid4()).replace("-", "")[:16]
    try:
        store_chunks(pdf_id, chunks, embeddings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store embeddings: {str(e)}")

    uploaded_pdfs[pdf_id] = {
        "name": file.filename,
        "chunks_count": len(chunks),
        "text_length": len(text)
    }

    return {
        "pdf_id": pdf_id,
        "filename": file.filename,
        "chunks_count": len(chunks),
        "message": f"PDF uploaded! Created {len(chunks)} chunks with sliding window."
    }


@app.delete("/remove-pdf/{pdf_id}")
def remove_pdf(pdf_id: str):
    if pdf_id not in uploaded_pdfs:
        raise HTTPException(status_code=404, detail="PDF not found.")

    success = delete_pdf_collection(pdf_id)
    filename = uploaded_pdfs.pop(pdf_id, {}).get("name", "Unknown")

    return {
        "message": f"PDF '{filename}' removed. Chat will now work in normal mode.",
        "pdf_id": pdf_id,
        "deleted": success
    }


@app.get("/list-pdfs")
def list_pdfs():
    return {
        "pdfs": [
            {"pdf_id": pid, **meta}
            for pid, meta in uploaded_pdfs.items()
        ]
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    pdf_id = request.pdf_id
    chat_history = request.chat_history or []

    use_rag = pdf_id and pdf_id in uploaded_pdfs and collection_exists(pdf_id)

    if use_rag:
        try:
            query_embedding = generate_query_embedding(query)
            context_chunks = query_pdf(pdf_id, query_embedding, top_k=5)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {str(e)}")

        if not context_chunks:
            answer = chat_without_rag(query, chat_history)
            return ChatResponse(answer=answer, mode="normal", sources=[])

        try:
            answer = chat_with_rag(query, context_chunks, chat_history)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM call failed: {str(e)}")

        return ChatResponse(answer=answer, mode="rag", sources=context_chunks[:2])

    else:
        try:
            answer = chat_without_rag(query, chat_history)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM call failed: {str(e)}")

        return ChatResponse(answer=answer, mode="normal", sources=[])