"use client";
import { useState } from "react";
import { ingestText, ingestUpload } from "@/lib/api";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function IngestForm() {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onText() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await ingestText(text, "web:texto");
      setMsg(`Adicionado: ${r.chunks} trechos salvos`);
      setText("");
    } catch (e: unknown) {
      setMsg(`Erro: ${getErrorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await ingestUpload(f);
      setMsg(`Arquivo "${f.name}" adicionado: ${r.chunks} trechos`);
    } catch (err: unknown) {
      setMsg(`Erro: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  const disabledText = loading || text.length < 10;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
      <h2 className="font-semibold text-sm text-white">Adicionar documentos à base</h2>
      <p className="text-xs text-zinc-400">Cole um texto ou envie PDF/TXT para o RAG consultar depois</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cole aqui o conteúdo (ex: Política de reembolso de 30 dias...)"
        className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-lg p-2.5 text-sm h-24 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
      />
      <button
        onClick={onText}
        disabled={disabledText}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${disabledText ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-white text-zinc-900 hover:bg-zinc-100"}`}
      >
        Adicionar texto
      </button>
      <div className="text-xs text-zinc-500 text-center">ou</div>
      <label className="block w-full bg-zinc-900 border border-zinc-700 border-dashed rounded-lg p-3 text-center text-sm cursor-pointer hover:bg-zinc-800 text-zinc-300 transition-colors">
        <span className="font-medium text-white">Carregar arquivo</span>
        <span className="text-zinc-400"> — PDF, TXT ou MD</span>
        <input type="file" accept=".pdf,.txt,.md" onChange={onFile} disabled={loading} className="hidden" />
      </label>
      {msg && <div className="text-sm bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-zinc-200">{msg}</div>}
    </div>
  );
}