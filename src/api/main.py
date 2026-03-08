import sys
import os
import shutil
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File

# Add src folder to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.document import extract_text, sliding_window_chunk,clean_name
from core.embeddings import get_embeddings
from core.rag import store_chunks, query_pdf
from core.llm import generate_answer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow everything. Change to specific URLs for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ✅ folders ensure
PDF_DIR = "data/pdfs"
CHROMA_DIR = "data/chroma"

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)


@app.get("/")
def read_root():
    return {"status": "RAG API running 🚀"}


# =========================
# 📥 Upload PDF
# =========================

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(PDF_DIR, file.filename)

        # save file
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # extract text
        text = extract_text(file_path)
        print("TEXT LENGTH:", len(text))


        # chunking
        chunks = sliding_window_chunk(text)
        print("TOTAL CHUNKS:", len(chunks))


        # embeddings
        embeddings = get_embeddings(chunks)
        print("EMBEDDINGS:", len(embeddings))

        # store in vector db
        clean_id = clean_name(file.filename)
        print("CLEAN ID:", clean_id)
        store_chunks(clean_id, chunks, embeddings)
        print("CHUNKS STORED IN VECTOR DB")
        response = {
    "status": "uploaded",
    "file": file.filename,
    "chunks": len(chunks)
}
        print("UPLOAD RESPONSE:", response)
        return response
          
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# 🔎 Query PDF
# =========================
@app.post("/query")
async def query_pdf_endpoint(pdf_id: str, query: str):
    try:
        # query embedding
        query_emb = get_embeddings([query])[0]

        # retrieve relevant chunks
        clean_id = clean_name(pdf_id)
        retrieved_chunks = query_pdf(clean_id, query_emb)
        # retrieved_chunks = query_pdf(pdf_id, query_emb)

        # generate answer
        answer = generate_answer(query, retrieved_chunks)

        return {
            "query": query,
            "answer": answer,
            "chunks_used": len(retrieved_chunks)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))