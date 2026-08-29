"use client";
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/types/api";

export default function HealthStatus() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getHealth().then(setData).catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div className="text-red-500 text-sm">API offline: {err}</div>;
  if (!data) return <div className="text-zinc-500 text-sm">Checando api:8000...</div>;

  const ok = data.status === "ok";
  return (
    <div className={`p-3 rounded text-sm ${ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
      <b>Stack:</b> {data.status} — Ollama: {data.ollama} | Qdrant: {data.qdrant} | {data.embedding_model}
    </div>
  );
}