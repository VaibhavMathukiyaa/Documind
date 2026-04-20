import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.services.pdf_parser import parse_pdf_to_documents
from app.services.vector_store import ingest_documents, delete_document_vectors
from app.models.document import DocumentResponse

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF, parse it into chunks, embed them, and store in ChromaDB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    document_id = str(uuid.uuid4())

    try:
        # Run blocking operations in thread pool (keeps event loop free)
        chunks = await asyncio.to_thread(
            parse_pdf_to_documents, file_bytes, document_id, file.filename
        )
        chunk_count = await asyncio.to_thread(
            ingest_documents, document_id, chunks
        )

        # Save document metadata to MongoDB
        db = get_db()
        doc_data = {
            "_id": document_id,
            "filename": file.filename,
            "chunk_count": chunk_count,
            "file_size": len(file_bytes),
            "created_at": datetime.utcnow(),
        }
        await db.documents.insert_one(doc_data)

        return DocumentResponse(
            id=document_id,
            filename=file.filename,
            chunk_count=chunk_count,
            created_at=doc_data["created_at"],
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@router.get("/", response_model=List[DocumentResponse])
async def list_documents():
    """Return all uploaded documents sorted by most recent."""
    db = get_db()
    docs = await db.documents.find().sort("created_at", -1).to_list(100)
    return [
        DocumentResponse(
            id=str(doc["_id"]),
            filename=doc["filename"],
            chunk_count=doc["chunk_count"],
            created_at=doc["created_at"],
        )
        for doc in docs
    ]


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document, its vectors, and its chat history."""
    db = get_db()

    doc = await db.documents.find_one({"_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    await asyncio.to_thread(delete_document_vectors, document_id)
    await db.documents.delete_one({"_id": document_id})
    await db.chats.delete_many({"document_id": document_id})

    return {"message": "Document deleted successfully."}
