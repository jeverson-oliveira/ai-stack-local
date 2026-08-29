#!/bin/bash
set -e
API=${1:-http://localhost:8000}
DIR=${2:-./examples/sample_docs}

echo "Ingestão RAG -> $API (dir: $DIR)"
for f in "$DIR"/*; do
  [ -f "$f" ] || continue
  echo " - $f"
  if [[ "$f" == *.pdf ]]; then
    curl -s -X POST "$API/ingest/upload" -F "file=@$f" | cat
  else
    # txt/md
    TEXT=$(jq -Rs . < "$f")
    curl -s -X POST "$API/ingest/text" -H "Content-Type: application/json" \
      -d "{\"text\":$TEXT,\"source\":\"$(basename $f)\"}" | cat
  fi
  echo ""
done
echo "Done. Teste: curl -X POST $API/query -H 'Content-Type: application/json' -d '{\"question\":\"Qual prazo de reembolso?\"}'"
