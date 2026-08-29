import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Stack Local — RAG Privado",
  description: "RAG 100% offline: Qdrant + Ollama phi3 + Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}