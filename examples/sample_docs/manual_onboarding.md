# Manual de Onboarding - AI Stack Local

## Stack
- Ollama (LLM local, modelos phi3/llama3)
- Qdrant (vector DB)
- API RAG (FastAPI + sentence-transformers/all-MiniLM-L6-v2)
- OpenWebUI (chat UI)

## Fluxo RAG
1. Documento -> chunk (500 chars, overlap 50) -> embedding 384d -> Qdrant
2. Pergunta -> embedding -> busca top_k=4 -> prompt com contexto -> Ollama generate -> resposta

## Como testar sem UI
```bash
curl -X POST http://localhost:8000/ingest/text -H "Content-Type: application/json" \
  -d '{"text":"A política de reembolso é de 30 dias...","source":"manual"}'

curl -X POST http://localhost:8000/query -H "Content-Type: application/json" \
  -d '{"question":"Qual o prazo de reembolso?"}'
```

Resposta esperada deve citar 30 dias / 7 dias conforme doc.
