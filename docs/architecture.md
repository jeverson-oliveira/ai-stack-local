# Arquitetura — AI Stack Local

## Visão Geral
Stack RAG 100% local, 4 containers em bridge `ai-network`.

## Componentes

### 1. Ollama `ollama:0.11.4`
- LLM inference (phi3 default, llama3 opcional)
- `OLLAMA_NUM_PARALLEL=2`, `KEEP_ALIVE=5m`, `MAX_LOADED_MODELS=1` para economia RAM
- Healthcheck `ollama list`, dependência para API e OpenWebUI
- Volume `data/ollama` persiste blobs/manifests

### 2. Qdrant `v1.13.2`
- Vector DB, COSINE distance, 384d (MiniLM)
- Coleção `rag_docs`, upsert com payload `{text, source, chunk_id}`
- Dashboard `:6333/dashboard` restrito a 127.0.0.1

### 3. API RAG `api/` (FastAPI 0.115)
- Endpoints: `/health`, `/ingest/text`, `/ingest/upload`, `/query`, `/chat`
- Chunk 500/50, embed `sentence-transformers/all-MiniLM-L6-v2`, normalize
- Retrieval top_k=4 -> prompt com contexto -> `POST /api/generate` Ollama stream=false
- Volume `data/api` futuro cache embeddings

### 4. OpenWebUI `v0.6.18`
- UI ChatGPT-like, consome Ollama direto (RAG híbrido desabilitado — RAG feito pela API)

## Fluxo de Dados
```
doc.txt --chunk--> [chunk1, chunk2] --embed--> vectors --upsert--> Qdrant
query --embed--> qvec --search--> top4 --prompt+context--> Ollama --> resposta
```

## Trade-offs
- CPU-only: latência 2-3s vs GPU 0.8s, mas sem custo GPU e roda em notebook 16GB
- MiniLM 384d vs Ollama embeddings 768d: menor dimensão = 2x menos RAM Qdrant, recall suficiente pt-BR
- Qdrant vs Chroma: Qdrant mais leve em Docker, API REST bem documentada para portfólio

## Escalabilidade
- Horizontal: replicas API + LB, Qdrant cluster
- Vertical: aumentar `cpus/mem_limit`, habilitar GPU
