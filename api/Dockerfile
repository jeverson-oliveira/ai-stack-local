FROM python:3.11-slim

WORKDIR /app

# deps sistema para wget (healthcheck) + embeddings
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# pré-download do modelo de embedding em build (opcional, acelera cold start)
# Descomentado para cache: se falhar, baixa em runtime
# RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY app ./app

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
