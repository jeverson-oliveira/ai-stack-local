const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getHealth(): Promise<import("@/types/api").HealthResponse> {
  const r = await fetch(`${BASE}/health`, { cache: "no-store" });
  if (!r.ok) throw new Error(`health ${r.status}`);
  return r.json();
}
export async function ingestText(text: string, source = "web") {
  const r = await fetch(`${BASE}/ingest/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
export async function queryRag(question: string, top_k = 4) {
  const r = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, top_k }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<import("@/types/api").QueryResponse>;
}