from langchain_ollama import OllamaEmbeddings
from app.core.config import settings


def get_embeddings() -> OllamaEmbeddings:
    """
    Returns Ollama nomic-embed-text embeddings model.
    Runs locally on Apple Silicon via Metal GPU.
    """
    return OllamaEmbeddings(
        model=settings.OLLAMA_EMBED_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
    )
