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
    setLoading(true); setMsg(null);
    try { const r = await ingestText(text, "web:text"); setMsg(`OK: ${r.chunks} chunks em ${r.collection}`); setText(""); }
    catch (e: unknown) { setMsg(`Erro: ${getErrorMessage(e)}`); } finally { setLoading(false); }
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setLoading(true); setMsg(null);
    try { const r = await ingestUpload(f); setMsg(`OK: ${f.name} → ${r.chunks} chunks`); }
    catch (err: unknown) { setMsg(`Erro: ${getErrorMessage(err)}`); } finally { setLoading(false); e.target.value = ""; }
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold">1. Ingest — alimente o RAG</h2>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Cole texto (ex: Política de reembolso 30 dias...)" className="w-full border rounded p-2 text-sm h-24" />
      <button onClick={onText} disabled={loading || text.length<10} className="bg-black text-white px-3 py-1.5 rounded text-sm disabled:opacity-40">Ingerir texto</button>
      <div className="text-sm">ou PDF/TXT: <input type="file" accept=".pdf,.txt,.md" onChange={onFile} disabled={loading} className="text-sm" /></div>
      {msg && <div className="text-sm bg-zinc-50 p-2 rounded">{msg}</div>}
      <p className="text-xs text-zinc-400">Teste: cole conteúdo de examples/sample_docs/política_reembolso.md</p>
    </div>
  );
}