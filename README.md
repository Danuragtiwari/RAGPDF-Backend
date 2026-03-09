# ✦ DocMind — RAG-Powered PDF Intelligence

> Chat with your PDFs using Retrieval-Augmented Generation. Upload any document, ask questions in natural language, and get precise answers grounded in your document's content.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React+Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/LLM-Groq_LLaMA_3.1-F55036?style=flat-square)
![Stack](https://img.shields.io/badge/VectorDB-ChromaDB-FF6B35?style=flat-square)
![Stack](https://img.shields.io/badge/Embeddings-FastEmbed-7B6EF6?style=flat-square)
![Cost](https://img.shields.io/badge/Hosting-100%25_Free-10B981?style=flat-square)

---

## 📌 Table of Contents

- [What is DocMind?](#-what-is-docmind)
- [How It Works (RAG Pipeline)](#-how-it-works-rag-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [API Reference](#-api-reference)
- [Deployment](#-deployment-100-free)
- [Known Limitations](#-known-limitations)

---

## 🧠 What is DocMind?

DocMind solves a fundamental problem with LLMs — **they don't know what's in your documents**.

If you ask GPT "what does my PDF say?", it will hallucinate. DocMind fixes this using **RAG (Retrieval-Augmented Generation)**:

1. Your PDF is chunked, embedded, and indexed into a vector database
2. When you ask a question, the most semantically relevant passages are retrieved
3. Those passages are sent to the LLM as context — grounding the answer in your document

**Result:** Precise, document-grounded answers with source transparency.

---

## ⚙️ How It Works (RAG Pipeline)

```
PDF Upload
    │
    ▼
┌─────────────────────────────────────────┐
│  1. Text Extraction  (PyMuPDF)          │
│     All pages → raw text string         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  2. Sliding Window Chunking             │
│     Window: 400 words                   │
│     Step:   200 words (50% overlap)     │
│     Ensures no context lost at          │
│     chunk boundaries                    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  3. Embedding Generation  (FastEmbed)   │
│     Model: BAAI/bge-small-en-v1.5       │
│     Output: 384-dimensional vectors     │
│     Runtime: ONNX (no PyTorch needed)   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  4. Vector Indexing  (ChromaDB)         │
│     Space: cosine similarity            │
│     Each PDF → isolated collection      │
│     Storage: in-memory (free tier)      │
└─────────────────────────────────────────┘

User Query
    │
    ▼
┌─────────────────────────────────────────┐
│  5. Query Embedding  (same model)       │
│     Query → 384-dim vector              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  6. Similarity Search  (ChromaDB)       │
│     Cosine distance ≤ 0.7              │
│     Top-5 relevant chunks retrieved     │
│     Fallback: top-3 if threshold fails  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  7. LLM Response  (Groq + LLaMA 3.1)   │
│     Context: retrieved chunks           │
│     Instruction: answer from context    │
│     Returns: answer + source chunks     │
└─────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | FastAPI + Python | Async support, auto Swagger docs, fast |
| **PDF Parsing** | PyMuPDF (fitz) | Fast, reliable text extraction |
| **Chunking** | Custom sliding window | 50% overlap prevents boundary info loss |
| **Embeddings** | FastEmbed — BAAI/bge-small-en-v1.5 | ONNX-based, no PyTorch, CPU-fast, free |
| **Vector DB** | ChromaDB (in-memory) | No disk needed, cosine similarity search |
| **LLM** | Groq — llama-3.1-8b-instant | 10x faster than OpenAI, free (14,400 req/day) |
| **Frontend** | React + Vite | Modern, fast HMR, component-based |
| **UI Design** | Glassmorphism dark theme | Animated mesh bg, micro-interactions |
| **Backend Host** | Render (free tier) | Auto-deploy from GitHub, 512MB RAM |
| **Frontend Host** | Vercel (free tier) | Global CDN, instant deploys |

---

## 📁 Project Structure

```
RAGPDF-Backend/
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── main.py           # FastAPI app — all routes & CORS config
│   │   └── core/
│   │       ├── document.py       # PDF text extraction (PyMuPDF)
│   │       ├── embeddings.py     # FastEmbed BAAI/bge-small-en-v1.5
│   │       ├── rag.py            # ChromaDB store / query / delete
│   │       └── llm.py            # Groq LLaMA integration
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # GROQ_API_KEY, ALLOWED_ORIGINS
│
└── frontend-vite/
    ├── src/
    │   ├── App.jsx               # Main UI — chat, upload, PDF management
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── .env                      # VITE_API_BASE=http://localhost:8000
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.11+ (conda recommended)
- Groq API Key → [console.groq.com](https://console.groq.com) (free)

### Backend

```bash
# 1. Activate conda environment
conda activate rag_env

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Create .env file in backend/
GROQ_API_KEY=gsk_your_key_here
ALLOWED_ORIGINS=http://localhost:5173

# 4. Run backend
python -m uvicorn src.api.main:app --port 8000
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
# 1. Install dependencies
cd frontend-vite
npm install

# 2. Create .env file in frontend-vite/
VITE_API_BASE=http://localhost:8000

# 3. Run frontend
npm run dev
# → UI running at http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check ping |
| `POST` | `/upload-pdf` | Upload & index a PDF |
| `GET` | `/list-pdfs` | List all uploaded PDFs |
| `DELETE` | `/remove-pdf/{pdf_id}` | Delete PDF + its vector collection |
| `POST` | `/chat` | Chat in RAG or General mode |

### POST `/chat` — Request Body

```json
{
  "query": "What is the main topic of this document?",
  "pdf_id": "abc123",
  "chat_history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ]
}
```

> `pdf_id` → optional. Omit for general chat (no RAG).  
> `chat_history` → optional. Send last 6 messages for conversational context.

### POST `/chat` — Response

```json
{
  "answer": "The main topic is...",
  "mode": "rag",
  "sources": ["chunk 1 text...", "chunk 2 text..."]
}
```

---

## ☁️ Deployment (100% Free)

```
GitHub Repo
    │
    ├──▶ Render  (backend)   → https://your-app.onrender.com
    └──▶ Vercel  (frontend)  → https://your-app.vercel.app
```

### Backend — Render

1. [render.com](https://render.com) → New Web Service → Connect GitHub repo

2. Configure:

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

3. Add Environment Variables:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_your_actual_key` |
| `ALLOWED_ORIGINS` | `*` |
| `PYTHON_VERSION` | `3.11.9` |

4. Deploy → copy your URL: `https://ragpdf-xxxx.onrender.com`

### Frontend — Vercel

1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set Root Directory: `frontend-vite`
3. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://your-render-url.onrender.com` |

4. Deploy → done in ~2 minutes

### Final Step — Update CORS

Go back to Render → Environment → update:
```
ALLOWED_ORIGINS = https://your-app.vercel.app
```

---

## ⚠️ Known Limitations

| Limitation | Cause | Workaround |
|-----------|-------|------------|
| PDFs lost on server restart | In-memory ChromaDB (no disk on free tier) | Re-upload; use UptimeRobot to prevent sleep |
| ~60s cold start delay | Render free tier sleeps after 15min inactivity | Ping with [UptimeRobot](https://uptimerobot.com) every 10min |
| No image/table extraction | PyMuPDF text-only mode | Use Camelot or AWS Textract for structured PDFs |
| English-optimized embeddings | BAAI/bge-small-en-v1.5 model | Swap to `multilingual-e5-small` for other languages |
| No user authentication | Single shared server instance | Add JWT-based auth for multi-user production |

---

## 💡 Design Decisions

**FastEmbed over sentence-transformers**  
FastEmbed runs on ONNX Runtime — no PyTorch dependency, saving ~1GB. Same embedding quality, faster on CPU, fits within Render's 512MB free tier.

**Sliding window over fixed chunking**  
Fixed chunking arbitrarily cuts sentences at boundaries. With 50% overlap (400w window, 200w step), every important sentence appears in at least two consecutive chunks — significantly improving retrieval recall.

**Groq over OpenAI**  
Groq's LPU delivers ~2000 tokens/sec vs OpenAI's ~100 tokens/sec. Free tier allows 14,400 requests/day. LLaMA 3.1 8B matches GPT-3.5 quality for document Q&A.

**ChromaDB in-memory**  
Free hosting tiers don't offer persistent disk. In-memory ChromaDB removes this dependency entirely. Tradeoff: data loss on restart — acceptable for a portfolio/demo project.

---

## 📄 License

MIT — free to use, modify, and deploy.

---

<div align="center">
Built with ✦ &nbsp;|&nbsp; FastAPI · React · Groq · FastEmbed · ChromaDB
</div># ✦ DocMind — RAG-Powered PDF Intelligence

> Chat with your PDFs using Retrieval-Augmented Generation. Upload any document, ask questions in natural language, and get precise answers grounded in your document's content.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React+Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/LLM-Groq_LLaMA_3.1-F55036?style=flat-square)
![Stack](https://img.shields.io/badge/VectorDB-ChromaDB-FF6B35?style=flat-square)
![Stack](https://img.shields.io/badge/Embeddings-FastEmbed-7B6EF6?style=flat-square)
![Cost](https://img.shields.io/badge/Hosting-100%25_Free-10B981?style=flat-square)

---

## 📌 Table of Contents

- [What is DocMind?](#-what-is-docmind)
- [How It Works (RAG Pipeline)](#-how-it-works-rag-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [API Reference](#-api-reference)
- [Deployment](#-deployment-100-free)
- [Known Limitations](#-known-limitations)

---

## 🧠 What is DocMind?

DocMind solves a fundamental problem with LLMs — **they don't know what's in your documents**.

If you ask GPT "what does my PDF say?", it will hallucinate. DocMind fixes this using **RAG (Retrieval-Augmented Generation)**:

1. Your PDF is chunked, embedded, and indexed into a vector database
2. When you ask a question, the most semantically relevant passages are retrieved
3. Those passages are sent to the LLM as context — grounding the answer in your document

**Result:** Precise, document-grounded answers with source transparency.

---

## ⚙️ How It Works (RAG Pipeline)

```
PDF Upload
    │
    ▼
┌─────────────────────────────────────────┐
│  1. Text Extraction  (PyMuPDF)          │
│     All pages → raw text string         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  2. Sliding Window Chunking             │
│     Window: 400 words                   │
│     Step:   200 words (50% overlap)     │
│     Ensures no context lost at          │
│     chunk boundaries                    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  3. Embedding Generation  (FastEmbed)   │
│     Model: BAAI/bge-small-en-v1.5       │
│     Output: 384-dimensional vectors     │
│     Runtime: ONNX (no PyTorch needed)   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  4. Vector Indexing  (ChromaDB)         │
│     Space: cosine similarity            │
│     Each PDF → isolated collection      │
│     Storage: in-memory (free tier)      │
└─────────────────────────────────────────┘

User Query
    │
    ▼
┌─────────────────────────────────────────┐
│  5. Query Embedding  (same model)       │
│     Query → 384-dim vector              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  6. Similarity Search  (ChromaDB)       │
│     Cosine distance ≤ 0.7              │
│     Top-5 relevant chunks retrieved     │
│     Fallback: top-3 if threshold fails  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  7. LLM Response  (Groq + LLaMA 3.1)   │
│     Context: retrieved chunks           │
│     Instruction: answer from context    │
│     Returns: answer + source chunks     │
└─────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | FastAPI + Python | Async support, auto Swagger docs, fast |
| **PDF Parsing** | PyMuPDF (fitz) | Fast, reliable text extraction |
| **Chunking** | Custom sliding window | 50% overlap prevents boundary info loss |
| **Embeddings** | FastEmbed — BAAI/bge-small-en-v1.5 | ONNX-based, no PyTorch, CPU-fast, free |
| **Vector DB** | ChromaDB (in-memory) | No disk needed, cosine similarity search |
| **LLM** | Groq — llama-3.1-8b-instant | 10x faster than OpenAI, free (14,400 req/day) |
| **Frontend** | React + Vite | Modern, fast HMR, component-based |
| **UI Design** | Glassmorphism dark theme | Animated mesh bg, micro-interactions |
| **Backend Host** | Render (free tier) | Auto-deploy from GitHub, 512MB RAM |
| **Frontend Host** | Vercel (free tier) | Global CDN, instant deploys |

---

## 📁 Project Structure

```
RAGPDF-Backend/
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── main.py           # FastAPI app — all routes & CORS config
│   │   └── core/
│   │       ├── document.py       # PDF text extraction (PyMuPDF)
│   │       ├── embeddings.py     # FastEmbed BAAI/bge-small-en-v1.5
│   │       ├── rag.py            # ChromaDB store / query / delete
│   │       └── llm.py            # Groq LLaMA integration
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # GROQ_API_KEY, ALLOWED_ORIGINS
│
└── frontend-vite/
    ├── src/
    │   ├── App.jsx               # Main UI — chat, upload, PDF management
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── .env                      # VITE_API_BASE=http://localhost:8000
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.11+ (conda recommended)
- Node.js 18+
- Groq API Key → [console.groq.com](https://console.groq.com) (free)

### Backend

```bash
# 1. Activate conda environment
conda activate rag_env

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Create .env file in backend/
GROQ_API_KEY=gsk_your_key_here
ALLOWED_ORIGINS=http://localhost:5173

# 4. Run backend
python -m uvicorn src.api.main:app --port 8000
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
# 1. Install dependencies
cd frontend-vite
npm install

# 2. Create .env file in frontend-vite/
VITE_API_BASE=http://localhost:8000

# 3. Run frontend
npm run dev
# → UI running at http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check ping |
| `POST` | `/upload-pdf` | Upload & index a PDF |
| `GET` | `/list-pdfs` | List all uploaded PDFs |
| `DELETE` | `/remove-pdf/{pdf_id}` | Delete PDF + its vector collection |
| `POST` | `/chat` | Chat in RAG or General mode |

### POST `/chat` — Request Body

```json
{
  "query": "What is the main topic of this document?",
  "pdf_id": "abc123",
  "chat_history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ]
}
```

> `pdf_id` → optional. Omit for general chat (no RAG).  
> `chat_history` → optional. Send last 6 messages for conversational context.

### POST `/chat` — Response

```json
{
  "answer": "The main topic is...",
  "mode": "rag",
  "sources": ["chunk 1 text...", "chunk 2 text..."]
}
```

---

## ☁️ Deployment (100% Free)

```
GitHub Repo
    │
    ├──▶ Render  (backend)   → https://your-app.onrender.com
    └──▶ Vercel  (frontend)  → https://your-app.vercel.app
```

### Backend — Render

1. [render.com](https://render.com) → New Web Service → Connect GitHub repo

2. Configure:

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

3. Add Environment Variables:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_your_actual_key` |
| `ALLOWED_ORIGINS` | `*` |
| `PYTHON_VERSION` | `3.11.9` |

4. Deploy → copy your URL: `https://ragpdf-xxxx.onrender.com`

### Frontend — Vercel

1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set Root Directory: `frontend-vite`
3. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://your-render-url.onrender.com` |

4. Deploy → done in ~2 minutes

### Final Step — Update CORS

Go back to Render → Environment → update:
```
ALLOWED_ORIGINS = https://your-app.vercel.app
```

---

## ⚠️ Known Limitations

| Limitation | Cause | Workaround |
|-----------|-------|------------|
| PDFs lost on server restart | In-memory ChromaDB (no disk on free tier) | Re-upload; use UptimeRobot to prevent sleep |
| ~60s cold start delay | Render free tier sleeps after 15min inactivity | Ping with [UptimeRobot](https://uptimerobot.com) every 10min |
| No image/table extraction | PyMuPDF text-only mode | Use Camelot or AWS Textract for structured PDFs |
| English-optimized embeddings | BAAI/bge-small-en-v1.5 model | Swap to `multilingual-e5-small` for other languages |
| No user authentication | Single shared server instance | Add JWT-based auth for multi-user production |

---

## 💡 Design Decisions

**FastEmbed over sentence-transformers**  
FastEmbed runs on ONNX Runtime — no PyTorch dependency, saving ~1GB. Same embedding quality, faster on CPU, fits within Render's 512MB free tier.

**Sliding window over fixed chunking**  
Fixed chunking arbitrarily cuts sentences at boundaries. With 50% overlap (400w window, 200w step), every important sentence appears in at least two consecutive chunks — significantly improving retrieval recall.

**Groq over OpenAI**  
Groq's LPU delivers ~2000 tokens/sec vs OpenAI's ~100 tokens/sec. Free tier allows 14,400 requests/day. LLaMA 3.1 8B matches GPT-3.5 quality for document Q&A.

**ChromaDB in-memory**  
Free hosting tiers don't offer persistent disk. In-memory ChromaDB removes this dependency entirely. Tradeoff: data loss on restart — acceptable for a portfolio/demo project.

---

## 📄 License

MIT — free to use, modify, and deploy.

---

<div align="center">
Built with Love; FastAPI · React · Groq · FastEmbed · ChromaDB
</div>
