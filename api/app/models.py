from pydantic import BaseModel, Field
from typing import List, Optional

class IngestResponse(BaseModel):
    chunks: int
    collection: str

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, examples=["Qual a política de reembolso?"])
    top_k: Optional[int] = None
    model: Optional[str] = None  # override llm_model

class QuerySource(BaseModel):
    text: str
    score: float
    metadata: dict

class QueryResponse(BaseModel):
    answer: str
    sources: List[QuerySource]
    model: str
    latency_ms: int

class ChatRequest(BaseModel):
    prompt: str
    model: Optional[str] = None
    stream: bool = False

class HealthResponse(BaseModel):
    status: str
    ollama: str
    qdrant: str
    embedding_model: str
