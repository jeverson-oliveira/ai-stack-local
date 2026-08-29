export type HealthResponse = {
  status: string;
  ollama: string;
  qdrant: string;
  embedding_model: string;
};

export type IngestResponse = { chunks: number; collection: string };
export type QueryRequest = { question: string; top_k?: number; model?: string };
export type QueryResponse = {
  answer: string;
  sources: { text: string; score: number; metadata: Record<string, unknown> }[];
  model: string;
  latency_ms: number;
};