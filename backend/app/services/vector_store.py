import chromadb
from langchain_chroma import Chroma
from langchain.schema import Document
from app.services.embeddings import get_embeddings
from typing import List

CHROMA_PATH = "./chroma_db"


def get_vector_store(document_id: str) -> Chroma:
    return Chroma(
        collection_name=f"doc_{document_id}",
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_PATH,
    )


def ingest_documents(document_id: str, chunks: List[Document]) -> int:
    vector_store = get_vector_store(document_id)
    vector_store.add_documents(chunks)
    return len(chunks)


def similarity_search(document_id: str, query: str, k: int = 4) -> List[Document]:
    """
    Always returns top-k most relevant chunks.
    No score threshold — let the LLM decide relevance.
    """
    vector_store = get_vector_store(document_id)
    return vector_store.similarity_search(query, k=k)


def delete_document_vectors(document_id: str) -> None:
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        client.delete_collection(f"doc_{document_id}")
    except Exception:
        pass
