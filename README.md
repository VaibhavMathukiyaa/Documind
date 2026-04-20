# DocuMind 🧠
> RAG-powered document chat. Upload PDFs, ask questions, get cited answers.

## Stack
| Layer | Tool |
|---|---|
| Frontend | React + TypeScript + Tailwind |
| Backend | FastAPI (Python) |
| LLM local | Ollama + llama3.2 |
| LLM prod | Groq API (free) |
| Embeddings | nomic-embed-text (Ollama) |
| Vector DB | ChromaDB |
| Database | MongoDB |

## Run Locally
```bash
# Terminal 1
ollama serve

# Terminal 2
source venv/bin/activate && cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 3
cd frontend && npm run dev
