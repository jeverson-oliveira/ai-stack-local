import HealthStatus from "@/components/HealthStatus";
import IngestForm from "@/components/IngestForm";


export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Stack Local — RAG Web</h1>
      <p className="text-zinc-600 text-sm">Front React para API FastAPI em :8000 (Qdrant + Ollama phi3)</p>
      <HealthStatus />
      <IngestForm />

      <div className="text-xs text-zinc-400">Próximo sprint: Ingest + Chat</div>
    </main>
  );
}