import uuid
import time
import httpx
import logging
from typing import List, Tuple

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from sentence_transformers import SentenceTransformer

from .config import settings

logger = logging.getLogger(__name__)

# lazy singletons
_embedding_model: SentenceTransformer | None = None
_qdrant: QdrantClient | None = None

def get_embedder() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        _embedding_model = SentenceTransformer(settings.embedding_model)
    return _embedding_model

def get_qdrant() -> QdrantClient:
    global _qdrant
    if _qdrant is None:
        _qdrant = QdrantClient(url=settings.qdrant_url, timeout=10)
    return _qdrant

def ensure_collection(dim: int = 384):
    client = get_qdrant()
    try:
        client.get_collection(settings.qdrant_collection)
    except Exception:
        logger.info(f"Creating collection {settings.qdrant_collection} dim={dim}")
        client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )

def chunk_text(text: str, size: int = None, overlap: int = None) -> List[str]:
    size = size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += size - overlap
    return chunks

def embed(texts: List[str]) -> List[List[float]]:
    model = get_embedder()
    vectors = model.encode(texts, normalize_embeddings=True).tolist()
    return vectors

def ingest_texts(texts: List[str], metadatas: List[dict] | None = None) -> int:
    if not texts:
        return 0
    all_chunks: List[str] = []
    all_metas: List[dict] = []
    for i, t in enumerate(texts):
        chunks = chunk_text(t)
        for j, c in enumerate(chunks):
            all_chunks.append(c)
            meta = (metadatas[i] if metadatas and i < len(metadatas) else {}).copy()
            meta.update({"chunk_id": j, "source_id": i})
            all_metas.append(meta)

    vectors = embed(all_chunks)
    ensure_collection(dim=len(vectors[0]))

    client = get_qdrant()
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={"text": txt, **meta},
        )
        for txt, vec, meta in zip(all_chunks, vectors, all_metas)
    ]
    client.upsert(collection_name=settings.qdrant_collection, points=points)
    return len(points)

def search(query: str, top_k: int = None) -> List[Tuple[str, float, dict]]:
    top_k = top_k or settings.top_k
    qvec = embed([query])[0]
    client = get_qdrant()
    ensure_collection(dim=len(qvec))
    hits = client.search(
        collection_name=settings.qdrant_collection,
        query_vector=qvec,
        limit=top_k,
        with_payload=True,
    )
    return [(h.payload.get("text", ""), float(h.score), h.payload) for h in hits]

async def ollama_generate(prompt: str, model: str = None) -> str:
    model = model or settings.llm_model
    url = f"{settings.ollama_base_url}/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": False}
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        return data.get("response", "")

def build_rag_prompt(question: str, contexts: List[str]) -> str:
    ctx = "\n---\n".join(contexts) if contexts else "Nenhum contexto encontrado."
    return (
        "Você é um assistente útil. Responda APENAS com base no contexto abaixo.\n"
        "Se a resposta não estiver no contexto, diga que não encontrou informação.\n"
        f"Contexto:\n{ctx}\n\n"
        f"Pergunta: {question}\n"
        "Resposta objetiva em português:"
    )

async def rag_query(question: str, top_k: int = None, model: str = None):
    t0 = time.time()
    hits = search(question, top_k=top_k)
    contexts = [h[0] for h in hits]
    prompt = build_rag_prompt(question, contexts)
    answer = await ollama_generate(prompt, model=model)
    latency_ms = int((time.time() - t0) * 1000)
    sources = [{"text": t, "score": s, "metadata": m} for t, s, m in hits]
    return answer, sources, latency_ms
