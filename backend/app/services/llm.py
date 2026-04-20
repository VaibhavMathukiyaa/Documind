from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain.schema import BaseMessage, HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from typing import List

RAG_SYSTEM_PROMPT = """\
You are DocuMind, an intelligent document assistant.
You have been given chunks of text extracted from a document.

Your job:
- Answer the user's question using the provided context.
- For general questions like "What is this document about?" or "Summarize this", \
synthesize an answer from ALL the context chunks provided.
- Always cite the page number when possible (e.g. "According to page 2...").
- If the context genuinely does not contain the answer, say: \
"That specific information wasn't found in the document."
- Be concise, clear, and structured. Use bullet points where helpful.

Context from the document:
{context}
"""


def get_llm():
    if settings.ENV == "production" and settings.GROQ_API_KEY:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            temperature=0.1,
            max_tokens=1024,
        )
    return ChatOllama(
        model=settings.OLLAMA_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.1,
    )


def generate_rag_answer(
    query: str,
    context_chunks: List,
    chat_history: List[dict] = [],
) -> str:
    llm = get_llm()

    context = "\n\n---\n\n".join([
        f"[Page {chunk.metadata.get('page', '?')}]:\n{chunk.page_content}"
        for chunk in context_chunks
    ])

    messages: List[BaseMessage] = [
        SystemMessage(content=RAG_SYSTEM_PROMPT.format(context=context))
    ]

    for msg in chat_history[-6:]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=query))

    response = llm.invoke(messages)
    return response.content
