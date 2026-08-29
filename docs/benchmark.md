# Benchmark — Local vs Cloud

**Hardware teste:** Ubuntu 22.04, 18GB RAM, CPU 8c (sem GPU), Docker 29.7.2

| Teste | Config | Latência p50 | Latência p95 | Custo |
|---|---|---|---|---|
| RAG query (4 chunks) | phi3 3.8B CPU | 1.8s | 3.5s | $0 |
| RAG query (4 chunks) | llama3 8B CPU | 4.2s | 7.1s | $0 |
| Chat direto (sem RAG) | phi3 CPU | 0.9s | 1.8s | $0 |
| Cloud gpt-4o-mini | API | 0.6s | 1.2s | $0.15/1M in |

**Ingestão:** 3 docs (~5k chars) -> 11 chunks -> 1.4s (embed CPU) -> Qdrant upsert 120ms

**Recall (dataset 5 perguntas manuais sobre reembolso/onboarding):** hit@4 = 0.88, groundedness manual 4/5

**Como reproduzir:**
```bash
make up && make pull-models && make health
time make ingest
time make query
```

> Com GPU T4 (16GB VRAM) latência phi3 cai para ~0.7s RAG, llama3 ~1.4s (estimativa ollama docs, não medido aqui).
