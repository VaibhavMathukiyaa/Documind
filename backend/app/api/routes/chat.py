import asyncio
from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.core.database import get_db
from app.services.vector_store import similarity_search
from app.services.llm import generate_rag_answer
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    db = get_db()

    doc = await db.documents.find_one({"_id": request.document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        # Returns List[Document] — no score filtering
        context_chunks = await asyncio.to_thread(
            similarity_search, request.document_id, request.message, 4
        )

        if not context_chunks:
            raise HTTPException(
                status_code=422, detail="No content found for this document."
            )

        sources = sorted(set([
            f"Page {chunk.metadata.get('page', '?')}"
            for chunk in context_chunks
        ]))

        answer = await asyncio.to_thread(
            generate_rag_answer,
            request.message,
            context_chunks,
            [msg.dict() for msg in request.history],
        )

        await db.chats.insert_one({
            "document_id": request.document_id,
            "user_message": request.message,
            "assistant_message": answer,
            "sources": sources,
            "created_at": datetime.utcnow(),
        })

        return ChatResponse(
            answer=answer,
            sources=sources,
            document_id=request.document_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
