import sys
import os

# Add src folder to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi import FastAPI, UploadFile
from core.document import extract_text, sliding_window_chunk
from core.embeddings import get_embeddings
from core.rag import store_chunks, query_pdf
from core.llm import generate_answer
import shutil, os

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
@app.post("/upload")
async def upload_pdf(file: UploadFile):
    file_path = f"data/pdfs/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = extract_text(file_path)
    chunks = sliding_window_chunk(text)
    embeddings = get_embeddings(chunks)
    store_chunks(file.filename, chunks, embeddings)
    return {"status": "uploaded", "chunks": len(chunks)}

@app.post("/query")
async def query_pdf_endpoint(pdf_id: str, query: str):
    query_emb = get_embeddings([query])[0]
    retrieved = query_pdf(pdf_id, query_emb)
    answer = generate_answer(query, retrieved)
    return {"answer": answer}
