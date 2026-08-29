.PHONY: help up down logs health ingest query pull-models clean test

help: ## Lista comandos
	@grep -E '^[a-zA-Z_-]+:.*?## ' Makefile | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Sobe stack completa
	docker compose up -d --build
	@echo "Aguarde ~40s para healthchecks... depois: make health"

down: ## Derruba stack
	docker compose down

logs: ## Logs API
	docker compose logs -f api

logs-all: ## Logs todos
	docker compose logs -f

health: ## Checa saúde dos serviços
	bash scripts/health.sh

pull-models: ## Baixa modelos Ollama (phi3 leve, llama3 pesado)
	docker exec ollama ollama pull phi3
	docker exec ollama ollama pull nomic-embed-text  # opcional para embeddings via Ollama
	# docker exec ollama ollama pull llama3

ingest: ## Ingere docs de exemplo no RAG
	bash scripts/ingest.sh http://localhost:8000 ./examples/sample_docs

query: ## Query teste RAG
	curl -s -X POST http://localhost:8000/query -H "Content-Type: application/json" \
	  -d '{"question":"Qual o prazo de reembolso?"}' | python3 -m json.tool

clean: ## Limpa volumes órfãos (cuidado: apaga dados)
	docker compose down -v
	rm -rf data/qdrant/* data/api/*

test: ## Smoke test API
	curl -s http://localhost:8000/health | python3 -m json.tool
	curl -s http://localhost:8000/ | python3 -m json.tool
