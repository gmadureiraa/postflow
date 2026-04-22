import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exclusão de dados — Sequência Viral",
  description:
    "Status de exclusão dos dados da sua conexão Meta/Instagram no Sequência Viral.",
  alternates: {
    canonical: "https://viral.kaleidos.com.br/account/data-deletion",
  },
};

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function DataDeletionPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-5 py-16 text-[#0A0A0A]">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Privacidade
        </p>
        <h1 className="editorial-serif mt-2 text-4xl">
          Exclusão de dados — Meta
        </h1>

        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
          Recebemos sua solicitação do Facebook para remover os dados associados
          à sua conexão Meta/Instagram no Sequência Viral. Sua conexão foi{" "}
          <strong>revogada</strong> e o token de acesso invalidado imediatamente.
          Dados derivados (posts baixados, transcrições, análise de marca) são
          apagados em até 30 dias.
        </p>

        {code && (
          <div className="mt-8 border-2 border-[#0A0A0A] bg-white p-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Código de confirmação
            </p>
            <p className="mt-2 font-mono text-lg">{code}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Guarde este código caso precise comprovar a solicitação à Meta.
            </p>
          </div>
        )}

        <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
          Se quiser apagar <strong>toda</strong> a sua conta Sequência Viral (e
          não apenas a conexão Meta), envie um e-mail para{" "}
          <a
            href="mailto:gf.madureiraa@gmail.com"
            className="font-semibold text-[var(--accent)] underline"
          >
            gf.madureiraa@gmail.com
          </a>
          . Cumprimos em até 30 dias.
        </p>

        <Link
          href="/"
          className="mt-10 inline-block text-sm font-bold text-[var(--accent)] underline underline-offset-4"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
