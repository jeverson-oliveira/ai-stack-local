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

  if (err) return <div className="text-xs bg-red-900/20 text-red-300 border border-red-800/50 rounded-lg p-2.5">API offline: {err}</div>;
  if (!data) return <div className="text-xs text-zinc-400">Conectando...</div>;

  const ok = data.status === "ok";
  return (
    <div className={`rounded-lg px-3 py-2.5 flex items-center gap-2 text-xs border ${ok ? "bg-emerald-500/10 border-emerald-800/50 text-emerald-400" : "bg-amber-500/10 border-amber-800/50 text-amber-400"}`}>
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
      <span><b>{ok ? "Online" : data.status}</b> • Ollama {data.ollama} • Qdrant {data.qdrant}</span>
    </div>
  );
}