"use client";

import { useState, useCallback } from "react";
import HealthStatus from "@/components/HealthStatus";
import IngestForm from "@/components/IngestForm";
import { queryRag } from "@/lib/api";
import type { QueryResponse } from "@/types/api";

type Msg = { role: "user" | "assistant"; text: string; data?: QueryResponse };

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm
          ${isUser ? "bg-zinc-900 text-white rounded-br-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"}`}
      >
        {msg.text}
        {msg.data && (
          <div className="mt-3 pt-3 border-t border-zinc-100 text-xs space-y-2">
            <div className="text-zinc-500">
              Latência {msg.data.latency_ms}ms • {msg.data.model} • {msg.data.sources.length} fontes
            </div>
            {msg.data.sources.map((s, j) => (
              <details key={j} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 open:bg-white">
                <summary className="cursor-pointer font-medium flex justify-between list-none">
                  <span>Fonte {j + 1}</span>
                  <span className="text-zinc-500">score {s.score.toFixed(3)}</span>
                </summary>
                <div className="mt-2 text-zinc-700 leading-relaxed">{s.text.slice(0, 500)}</div>
                <div className="mt-1 text-[11px] text-zinc-400">{JSON.stringify(s.metadata)}</div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Olá! Adicione um documento na barra lateral e pergunte aqui. Ex: Qual o prazo de reembolso?" },
  ]);
  const [input, setInput] = useState("Qual o prazo de reembolso?");
  const [loading, setLoading] = useState(false);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const data = await queryRag(q, 4);
      setMsgs((m) => [...m, { role: "assistant", text: data.answer, data }]);
    } catch (e: unknown) {
      setMsgs((m) => [...m, { role: "assistant", text: `Erro: ${getErrorMessage(e)}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <div className="h-screen flex bg-[#f4f4f5]">
      <aside className="w-[340px] bg-zinc-900 text-zinc-100 flex flex-col border-r border-zinc-800 hidden md:flex">
        <div className="p-5 border-b border-zinc-800">
          <h1 className="font-bold tracking-tight text-white">AI Stack Local</h1>
          <p className="text-xs text-zinc-400 mt-1">RAG privado • Qdrant + Ollama phi3</p>
          <p className="text-[11px] text-zinc-500 mt-1">web:3001 • open-webui:3000 • api:8000</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <HealthStatus />
          <IngestForm />
          <p className="text-[11px] text-zinc-500 leading-relaxed">Fluxo: doc → chunk 500/50 → MiniLM 384d → Qdrant top_k=4 → phi3</p>
        </div>
        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">100% offline • custo $0 • LGPD</div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f4f5]">
        <div className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800">Chat RAG — com citações</h2>
          <span className="text-xs text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-full px-2.5 py-1">phi3 3.8B • top_k=4</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {msgs.length === 1 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto">
              <div className="w-12 h-12 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-lg">💬</div>
              <p className="text-sm font-medium text-zinc-700">Comece adicionando documentos</p>
              <p className="text-xs text-zinc-500 mt-1">Seus arquivos aparecem como fontes com score. A resposta vem ancorada nos docs — sem alucinação.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {msgs.map((m, i) => (
                <MessageBubble key={i} msg={m} />
              ))}
              {loading && <div className="text-sm text-zinc-500 animate-pulse">Gerando resposta com phi3 (CPU ~60s)...</div>}
            </div>
          )}
          {msgs.length > 1 && loading && <div className="max-w-3xl mx-auto mt-4 text-sm text-zinc-500 animate-pulse">Gerando resposta...</div>}
        </div>

        <div className="border-t border-zinc-200 bg-white p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Pergunte aos seus docs..."
              className="flex-1 border border-zinc-200 rounded-full px-4 py-2.5 text-sm bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
            />
            <button
              onClick={send}
              disabled={loading || input.trim().length < 3}
              className="bg-zinc-900 text-white px-6 rounded-full text-sm font-medium hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 text-center mt-2">Respostas ancoradas nos docs — sem alucinação</p>
        </div>
      </main>
    </div>
  );
}