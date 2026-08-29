"use client";
import { useState } from "react";
import { queryRag } from "@/lib/api";
import type { QueryResponse } from "@/types/api";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function ChatRag() {
  const [q, setQ] = useState("Qual o prazo de reembolso?");
  const [res, setRes] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onAsk() {
    if (q.trim().length < 3) return;
    setLoading(true); setErr(null); setRes(null);
    try {
      const data = await queryRag(q, 4);
      setRes(data);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold">2. Chat RAG — pergunte aos docs</h2>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: Como solicito reembolso?" className="flex-1 border rounded p-2 text-sm" />
        <button onClick={onAsk} disabled={loading} className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-40">
          {loading ? "..." : "Perguntar"}
        </button>
      </div>
      {err && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</div>}
      {res && (
        <div className="space-y-3">
          <div className="bg-zinc-50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap">{res.answer}</div>
          <div className="text-xs text-zinc-500">Modelo: {res.model} | Latência: {res.latency_ms}ms | Fontes: {res.sources.length}</div>
          <div className="space-y-2">
            {res.sources.map((s, i) => (
              <div key={i} className="border rounded p-2 text-xs">
                <div className="flex justify-between font-medium"><span>Fonte {i+1}</span><span className="text-zinc-500">score {s.score.toFixed(3)}</span></div>
                <div className="mt-1 text-zinc-700">{s.text.slice(0, 400)}</div>
                <div className="mt-1 text-zinc-400">{JSON.stringify(s.metadata)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!res && !err && <p className="text-xs text-zinc-400">Dica: primeiro ingira docs no bloco acima, depois pergunte.</p>}
    </div>
  );
}