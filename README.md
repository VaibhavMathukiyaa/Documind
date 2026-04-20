# 🧠 DocuMind

> RAG-powered document chat — upload any PDF and ask questions about it using local LLMs with page-level citations.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![LangChain](https://img.shields.io/badge/LangChain-0.3-orange?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-local_LLM-black?style=flat-square)

---

## What It Does

DocuMind lets you upload a PDF document and chat with it using a Retrieval-Augmented Generation (RAG) pipeline. Instead of hallucinating answers, the system retrieves the most relevant chunks from your document and generates grounded responses with page citations.

**Example:**
- Upload a research paper → ask "What methodology was used?" → get a cited answer from page 4
- Upload a contract → ask "What are the payment terms?" → get the exact clause with source
- Upload your CV → ask "What are the main skills?" → get a structured summary

---

## Features

- 📄 **PDF Upload** — drag & drop interface with real-time processing feedback
- 🔍 **Semantic Search** — vector similarity search via ChromaDB finds the most relevant chunks
- 🤖 **Local LLM** — runs entirely on your machine using Ollama (no API costs)
- 📍 **Page Citations** — every answer includes the source page numbers
- 💬 **Conversational Memory** — follow-up questions maintain context from previous messages
- 🗂️ **Multi-document** — upload and manage multiple documents, switch between them
- 🔄 **Local → Cloud** — automatically switches from Ollama (dev) to Groq (production)
- 🗑️ **Document Management** — delete documents and their vector embeddings

---

## Architecture

┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│         React + TypeScript + Tailwind CSS                │
│   Upload Zone │ Sidebar │ Chat Window │ Citations        │
└──────────────────────┬──────────────────────────────────┘
│ REST API
┌──────────────────────▼──────────────────────────────────┐
│                    FASTAPI BACKEND                        │
│                                                          │
│  POST /api/documents/upload                              │
│    └─▶ PyMuPDF (parse PDF)                              │
│    └─▶ RecursiveCharacterTextSplitter (chunk text)       │
│    └─▶ nomic-embed-text via Ollama (generate embeddings) │
│    └─▶ ChromaDB (store vectors)                          │
│    └─▶ MongoDB (store metadata)                          │
│                                                          │
│  POST /api/chat/                                         │
│    └─▶ nomic-embed-text (embed query)                    │
│    └─▶ ChromaDB similarity_search (top-4 chunks)         │
│    └─▶ llama3.2 via Ollama / Groq (generate answer)      │
│    └─▶ Return answer + page citations                    │
└──────────────────────────────────────────────────────────┘
│                          │
┌────────▼──────────┐    ┌─────────▼──────────┐
│     ChromaDB      │    │      MongoDB        │
│  Vector Embeddings│    │  Document Metadata  │
│  Per-doc collections│  │  Chat History       │
└───────────────────┘    └────────────────────┘

Text

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | UI framework |
| Styling | Tailwind CSS v4 | Utility-first styling |
| Backend | FastAPI (Python 3.12) | REST API + async endpoints |
| PDF Parsing | PyMuPDF (fitz) | Text extraction |
| Text Splitting | LangChain RecursiveCharacterTextSplitter | Chunking strategy |
| Embeddings | nomic-embed-text via Ollama | Local vector embeddings |
| Vector Store | ChromaDB | Similarity search |
| LLM (local) | llama3.2 via Ollama | Local inference on Apple Silicon |
| LLM (production) | Groq API — llama-3.1-8b-instant | Fast free-tier inference |
| Database | MongoDB (Motor async driver) | Metadata + chat history |
| Orchestration | LangChain 0.3 | LLM + retrieval pipeline |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- [Ollama](https://ollama.com) installed
- MongoDB running locally (or MongoDB Atlas)

### 1 — Clone the repo

```bash
git clone https://github.com/VaibhavMathukiyaa/Documind.git
cd Documind
2 — Pull Ollama models
bash
ollama pull llama3.2          # ~2GB — main LLM
ollama pull nomic-embed-text  # ~274MB — embeddings
3 — Backend setup
bash
python3 -m venv venv
source venv/bin/activate

pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URL and (optionally) Groq API key
4 — Frontend setup
bash
cd frontend
npm install
5 — Run everything (3 terminals)
bash
# Terminal 1
ollama serve

# Terminal 2
source venv/bin/activate && cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 3
cd frontend && npm run dev
Open http://localhost:5173

Environment Variables
Copy backend/.env.example to backend/.env and fill in:

env
# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text

# Groq (production — free at console.groq.com)
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=documind

# App
ENV=development
CORS_ORIGINS=["http://localhost:5173"]
API Reference
Method	Endpoint	Description
POST	/api/documents/upload	Upload and process a PDF
GET	/api/documents/	List all uploaded documents
DELETE	/api/documents/{id}	Delete document + vectors
POST	/api/chat/	Send a message, get RAG answer
Full interactive docs available at http://localhost:8000/docs (Swagger UI).

Chat Request Example
json
POST /api/chat/
{
  "document_id": "abc-123",
  "message": "What are the main findings?",
  "history": [
    { "role": "user", "content": "Who wrote this?" },
    { "role": "assistant", "content": "According to page 1..." }
  ]
}
Chat Response Example
json
{
  "answer": "According to page 3, the main findings show that...",
  "sources": ["Page 3", "Page 5"],
  "document_id": "abc-123"
}
Project Structure
Text
Documind/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── documents.py   # Upload, list, delete endpoints
│   │   │   └── chat.py        # RAG chat endpoint
│   │   ├── core/
│   │   │   ├── config.py      # Pydantic settings
│   │   │   └── database.py    # MongoDB async connection
│   │   ├── services/
│   │   │   ├── pdf_parser.py  # PyMuPDF + text chunking
│   │   │   ├── embeddings.py  # Ollama nomic-embed-text
│   │   │   ├── vector_store.py # ChromaDB operations
│   │   │   └── llm.py         # Ollama/Groq LLM + RAG prompt
│   │   ├── models/
│   │   │   ├── document.py    # Pydantic request/response models
│   │   │   └── chat.py
│   │   └── main.py            # FastAPI app + CORS + lifespan
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx     # Document list + upload button
│   │   │   ├── ChatWindow.tsx  # Chat interface + input
│   │   │   ├── MessageBubble.tsx # Markdown messages + citations
│   │   │   └── UploadZone.tsx  # Drag & drop PDF upload
│   │   ├── hooks/
│   │   │   └── useChat.ts      # Chat state management
│   │   ├── services/
│   │   │   └── api.ts          # Axios API calls
│   │   └── types/
│   │       └── index.ts        # TypeScript interfaces
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
What This Project Demonstrates
This project was built to demonstrate end-to-end AI engineering skills:

Skill	Implementation

RAG Architecture	LangChain pipeline: parse → chunk → embed → retrieve → generate
Vector Databases	ChromaDB with per-document collections and cosine similarity search
Local LLM Deployment	Ollama running llama3.2 on Apple Silicon via Metal GPU
Async Python	FastAPI with asyncio.to_thread for non-blocking LLM calls
Full-Stack Development	Decoupled React frontend + FastAPI backend with REST API
Production Readiness	Environment-based LLM switching (Ollama dev → Groq production)
Clean Architecture	Services layer, Pydantic models, dependency injection

Roadmap

 Deploy to Render + Vercel
 Streaming responses (token-by-token output)
 Multi-document cross-search
 Document summarization on upload
 Authentication + user sessions


Author
Vaibhav Mathukiya — CS Graduate (MSc Data Science, 107/110)
