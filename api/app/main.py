import logging
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io

from .config import settings
from .models import IngestResponse, QueryRequest, QueryResponse, QuerySource, ChatRequest, HealthResponse
from .rag import ingest_texts, rag_query, ollama_generate, get_qdrant, get_embedder

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Stack Local - RAG API",
    version="0.2.0",
    description="API RAG local: Qdrant + SentenceTransformers + Ollama. 100% offline, sem cloud.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health():
    ollama_status = "unknown"
    qdrant_status = "unknown"
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            r = await c.get(f"{settings.ollama_base_url}/api/tags")
            ollama_status = "up" if r.status_code == 200 else f"down:{r.status_code}"
    except Exception as e:
        ollama_status = f"down:{e}"

    try:
        client = get_qdrant()
        client.get_collections()
        qdrant_status = "up"
    except Exception as e:
        qdrant_status = f"down:{e}"

    # lazy load embedder just to report name, not loading if not needed
    return HealthResponse(
        status="ok" if ollama_status == "up" and qdrant_status == "up" else "degraded",
        ollama=ollama_status,
        qdrant=qdrant_status,
        embedding_model=settings.embedding_model,
    )

@app.post("/ingest/text", response_model=IngestResponse, tags=["rag"])
async def ingest_text(payload: dict):
    text = payload.get("text", "")
    source = payload.get("source", "api")
    if not text or len(text.strip()) < 10:
        raise HTTPException(400, "text muito curto (min 10 chars)")
    n = ingest_texts([text], [{"source": source}])
    return IngestResponse(chunks=n, collection=settings.qdrant_collection)

@app.post("/ingest/upload", response_model=IngestResponse, tags=["rag"])
async def ingest_upload(file: UploadFile = File(...)):
    raw = await file.read()
    if file.filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(raw))
        text = "\n".join([(p.extract_text() or "") for p in reader.pages])
    else:
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(400, "Arquivo deve ser .txt/.md ou .pdf com texto extraível")

    if not text.strip():
        raise HTTPException(400, "Nenhum texto extraído do arquivo")
    n = ingest_texts([text], [{"source": file.filename}])
    return IngestResponse(chunks=n, collection=settings.qdrant_collection)

@app.post("/query", response_model=QueryResponse, tags=["rag"])
async def query(req: QueryRequest):
    answer, sources, latency = await rag_query(req.question, top_k=req.top_k, model=req.model)
    return QueryResponse(
        answer=answer,
        sources=[QuerySource(text=s["text"], score=s["score"], metadata=s["metadata"]) for s in sources],
        model=req.model or settings.llm_model,
        latency_ms=latency,
    )

@app.post("/chat", tags=["llm"])
async def chat(req: ChatRequest):
    try:
        text = await ollama_generate(req.prompt, model=req.model)
    except Exception as e:
        raise HTTPException(502, f"Ollama error: {e}")
    return {"response": text, "model": req.model or settings.llm_model}

@app.get("/", tags=["ops"])
async def root():
    return {
        "name": "ai-stack-local RAG API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": ["/ingest/text", "/ingest/upload", "/query", "/chat"],
    }
