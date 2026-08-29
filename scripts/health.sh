#!/bin/bash
set -e
echo "=== docker ps ==="
docker compose ps
echo ""
echo "=== API /health ==="
curl -s http://localhost:8000/health | python3 -m json.tool || curl -s http://localhost:8000/health
echo ""
echo "=== Qdrant /health ==="
curl -s http://localhost:6333/health | python3 -m json.tool || true
echo ""
echo "=== Ollama tags ==="
curl -s http://localhost:11434/api/tags | python3 -m json.tool | head -n 40 || true
