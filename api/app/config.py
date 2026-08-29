from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ollama_base_url: str = "http://ollama:11434"
    qdrant_url: str = "http://qdrant:6333"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    llm_model: str = "phi3"
    log_level: str = "INFO"
    qdrant_collection: str = "rag_docs"
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 4

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
