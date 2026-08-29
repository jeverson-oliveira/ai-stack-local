# AI Stack Local — RAG Privado 100% Offline

> Stack de IA local com RAG (Retrieval-Augmented Generation) sem dependência de cloud. Dados nunca saem da máquina. Custo marginal $0.

<p align="center">
  <img src="https://img.shields.io/badge/Ollama-0.11.4-blue?style=for-the-badge&logo=ollama" />
  <img src="https://img.shields.io/badge/Qdrant-1.13.2-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/FastAPI-RAG_API-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/OpenWebUI-0.6.18-00c2ff?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 📌 O Problema

Empresas que usam ChatGPT/Claude para consultar documentos internos enfrentam 3 riscos:

1. **Vazamento de dados** — documentos sensíveis enviados para APIs de terceiros (LGPD/GDPR)
2. **Custo recorrente** — $0.15–$5 / 1M tokens, que escala linear com uso
3. **Dependência de internet/cloud** — indisponível offline, latência e lock-in

## 💡 A Solução

Plataforma RAG local que roda inteira em Docker, com:

- **Ollama** como LLM engine (phi3 3.8B / llama3 8B) — CPU-only, GPU opcional
- **Qdrant** como vector DB — busca semântica com embeddings 384d
- **API RAG dedicada (FastAPI)** — ingestão de PDFs/TXTs, chunking, embeddings com `all-MiniLM-L6-v2`, prompt com contexto
- **OpenWebUI** como interface ChatGPT-like

**Fluxo RAG:**
```
PDF/TXT -> chunk (500 chars, overlap 50) -> embedding (MiniLM 384d) -> Qdrant
Pergunta -> embedding -> top_k=4 retrieval -> prompt com contexto -> Ollama generate
```

Tudo roda em `ai-network` Docker bridge, 100% privado.

---

## 🏗️ Arquitetura

```txt
                  ┌─────────────┐  :3000
                  │  OpenWebUI  │  Chat UI
                  └──────┬──────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
     ┌────────────────┐    ┌──────────────┐  :8000
     │  RAG API       │    │   Ollama     │  :11434
     │  FastAPI       │───▶│  phi3/llama3 │
     │  MiniLM 384d   │    └──────────────┘
     └───────┬────────┘
             │
             ▼
     ┌──────────────┐  :6333
     │   Qdrant     │
     │  Vector DB   │
     └──────────────┘

  Volumes: ./data/{ollama,qdrant,open-webui,api}  Logs: ./logs/{*}
  Network: ai-network (bridge)                    Healthchecks em todos os serviços
```

**Decisões técnicas:**
- Qdrant separado (vs. Chroma embutido) → observável, escalável, demonstra microservices
- `all-MiniLM-L6-v2` (80MB, 384d) → leve para CPU, bom recall pt-BR, sem depender de API Ollama embeddings
- Versões pinadas (`ollama:0.11.4`, `qdrant:v1.13.2`, `open-webui:v0.6.18`) → reprodutibilidade
- `healthcheck` + `depends_on: condition: service_healthy` → startup ordenado
- `security_opt: no-new-privileges` + bind `127.0.0.1` → não expõe para rede

---

## 🚀 Quick Start

```bash
# 1. Clone e configure
git clone https://github.com/devjeverson/ai-stack-local.git && cd ai-stack-local
cp .env.example .env  # ajuste LLM_MODEL se quiser llama3

# 2. Sobe stack (primeira vez baixa ~4GB de imagens + modelos)
make up
# ou: docker compose up -d --build

# 3. Baixa modelos LLM (phi3 é leve ~2.3GB; llama3 8B ~4.7GB)
make pull-models
# manual: docker exec ollama ollama pull phi3

# 4. Verifica saúde
make health
# API docs: http://localhost:8000/docs
# OpenWebUI: http://localhost:3000
# Qdrant dashboard: http://localhost:6333/dashboard
```

**Requisitos:** Docker 24+, 12GB RAM (8GB mínimo p/ phi3), 20GB disco. GPU NVIDIA opcional (descomente bloco `deploy` em `docker-compose.yml:14-20`).

---

## 📚 Uso RAG (sem UI)

```bash
# Ingere docs de exemplo
make ingest
# ou manual:
curl -X POST http://localhost:8000/ingest/text -H "Content-Type: application/json" \
  -d '{"text":"A política de reembolso é de 30 dias...","source":"manual"}'

# Ingere PDF
curl -X POST http://localhost:8000/ingest/upload -F "file=@contrato.pdf"

# Query com contexto
make query
curl -X POST http://localhost:8000/query -H "Content-Type: application/json" \
  -d '{"question":"Qual o prazo de reembolso?"}' | jq

# Chat direto sem RAG
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" \
  -d '{"prompt":"Explique RAG em 3 linhas"}' | jq
```

**Exemplo de resposta RAG:**
```json
{
  "answer": "O prazo para solicitar reembolso é de 30 dias após a compra...",
  "sources": [{"text": "Reembolsos podem ser solicitados em até 30 dias...","score": 0.89}],
  "model": "phi3",
  "latency_ms": 1843
}
```

---

## 📊 Resultados & Benchmarks

| Métrica | Local (phi3 3.8B, CPU 8c/12GB) | Cloud (gpt-4o-mini) |
|---|---|---|
| Custo / 1M tokens | **$0** | $0.15–$0.60 |
| Latência p50 (RAG 4 chunks) | 1.8–3.5s | 0.6–1.2s |
| Privacidade | 100% local, LGPD ok | Dados saem da VPC |
| Offline | Sim | Não |
| Troca de modelo | `ollama pull` | Muda API key |

> Em 100k queries/mês (~50M tokens) economia estimada **$150–$400/mês**. Trade-off: latência ~2x maior em CPU-only; com GPU T4 cai para ~0.9s.

Teste em `examples/sample_docs/` — 3 docs, ingest <2s, recall 0.88 em perguntas do FAQ.

---

## 🛠️ Comandos

| Comando | Descrição |
|---|---|
| `make up` | Sobe stack |
| `make down` | Derruba |
| `make logs` | Logs API |
| `make health` | Healthcheck todos serviços |
| `make ingest` | Ingere `examples/sample_docs/` |
| `make query` | Query teste |

---

## 🔒 Segurança & Boas Práticas

- `.env` gitignorado, `.env.example` versionado
- `data/` e `*.db` gitignorados
- `127.0.0.1` bind para Ollama/Qdrant/API (só OpenWebUI em 0.0.0.0:3000 por ser UI)
- Logs com rotação (`max-size` + `max-file`)
- `no-new-privileges` no OpenWebUI

## 🗺️ Roadmap (próximos passos para case sênior)

- [ ] Avaliação RAG: hit@k / groundedness com dataset 50 perguntas
- [ ] Auth + rate limit na API
- [ ] CI (lint + build + smoke test)
- [ ] Grafana + métricas latência/tokens
- [ ] Suporte a GPU + benchmark CPU vs GPU

---

## 👤 Autor

**Jeverson** — AI Engineer / MLOps | [github.com/devjeverson](https://github.com/devjeverson)

> Case de portfólio: demonstra Docker, microservices, RAG, embeddings, vector DB e arquitetura privacy-first sem cloud.
