import fitz  # PyMuPDF
from typing import List
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter


def parse_pdf_to_documents(
    file_bytes: bytes,
    document_id: str,
    filename: str,
    chunk_size: int = 800,
    chunk_overlap: int = 100,
) -> List[Document]:
    """
    Parse PDF bytes into LangChain Document chunks with metadata.
    Each chunk is ready for embedding and storage.
    """
    pdf = fitz.open(stream=file_bytes, filetype="pdf")
    total_pages = len(pdf)

    raw_pages: List[Document] = []
    for page_num in range(total_pages):
        text = pdf[page_num].get_text("text").strip()
        if text:
            raw_pages.append(
                Document(
                    page_content=text,
                    metadata={
                        "document_id": document_id,
                        "filename": filename,
                        "page": page_num + 1,
                        "total_pages": total_pages,
                    },
                )
            )

    pdf.close()

    if not raw_pages:
        raise ValueError("No extractable text found in this PDF.")

    # Split pages into smaller overlapping chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", "!", "?", " ", ""],
    )

    chunks = splitter.split_documents(raw_pages)

    # Add chunk index to each chunk's metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i

    return [c for c in chunks if c.page_content.strip()]
