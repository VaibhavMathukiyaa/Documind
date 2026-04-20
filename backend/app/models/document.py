from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentCreate(BaseModel):
    filename: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    chunk_count: int
    created_at: datetime
