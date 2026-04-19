import type { Metadata } from "next";
import Link from "next/link";
import {
  RoadmapBoardBrutalist,
  RoadmapLegend,
} from "@/components/landing/roadmap-board-v2";

export const metadata: Metadata = {
  title: "Roadmap | Sequência Viral — O que vem por aí",
  description:
    "O caminho do Sequência Viral: do MVP de geração manual até automações com RSS, publicação multi-rede, brand kits e repurpose com IA.",
  alternates: { canonical: "https://viral.kaleidos.com.br/roadmap" },
  openGraph: {
    title: "Roadmap | Sequência Viral",
    description:
      "Do MVP ao motor de conteúdo autônomo — veja o que estamos construindo no Sequência Viral.",
    type: "website",
    url: "https://viral.kaleidos.com.br/roadmap",
  },
};

/**
 * Roadmap público da landing. Usa o mesmo componente brutalist do
 * /app/roadmap pra uniformidade visual. Dados em lib/roadmap-data.ts.
 */
export default function RoadmapPage() {
  return (
    <main
      style={{
        background: "var(--sv-paper)",
        color: "var(--sv-ink)",
        minHeight: "100vh",
        padding: "72px 0 120px",
      }}
    >
      {/* Nav back */}
      <div className="mx-auto max-w-[1240px] px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
            textDecoration: "none",
          }}
        >
          ← Voltar pra Sequência Viral
        </Link>
      </div>

      {/* Header */}
      <header className="mx-auto mt-10 max-w-[1240px] px-6">
        <span
          className="sv-eyebrow"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span className="sv-dot" /> Roadmap público
        </span>

        <h1
          className="sv-display mt-5"
          style={{
            fontSize: "clamp(44px, 8vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            maxWidth: 1100,
          }}
        >
          O <em>caminho</em> do Sequência Viral.
        </h1>

        <p
          className="mt-6"
          style={{
            fontFamily: "var(--sv-sans)",
            fontSize: 18,
            lineHeight: 1.5,
            color: "var(--sv-muted)",
            maxWidth: 720,
          }}
        >
          Hoje: gerador manual que já resolve o dia a dia. Em alguns meses, motor
          autônomo que lê o mundo, entende sua marca e publica por você.
        </p>

        <div className="mt-7">
          <RoadmapLegend />
        </div>
      </header>

      {/* Board */}
      <section className="mx-auto mt-16 max-w-[1240px] px-6">
        <RoadmapBoardBrutalist />
      </section>

      {/* CTA final — container dark com shadow verde */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6">
        <div
          style={{
            padding: "48px 32px",
            background: "var(--sv-ink)",
            color: "var(--sv-paper)",
            border: "1.5px solid var(--sv-ink)",
            boxShadow: "6px 6px 0 0 var(--sv-green)",
            textAlign: "center",
          }}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10.5,
              letterSpacing: "0.2em",
              color: "var(--sv-green)",
              fontWeight: 700,
            }}
          >
            ✦ Quer ajudar a decidir o próximo passo?
          </span>
          <h2
            className="sv-display mt-4"
            style={{
              fontSize: "clamp(30px, 4.5vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "var(--sv-paper)",
              fontWeight: 400,
            }}
          >
            O roadmap muda com <em>quem usa</em>.
          </h2>
          <p
            className="mt-4 mx-auto"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 16,
              lineHeight: 1.55,
              color: "rgba(247,245,239,0.72)",
              maxWidth: 540,
            }}
          >
            Entre no beta e vote no que vem primeiro. Ou manda direto um email
            com o que você precisaria — priorizo quem responde.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-[10px]">
            <Link
              href="/app/login"
              className="inline-flex items-center gap-2"
              style={{
                padding: "13px 22px",
                background: "var(--sv-green)",
                border: "1.5px solid var(--sv-paper)",
                boxShadow: "4px 4px 0 0 var(--sv-paper)",
                fontFamily: "var(--sv-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--sv-ink)",
                textDecoration: "none",
              }}
            >
              Começar agora →
            </Link>
            <a
              href="mailto:madureira@kaleidosdigital.com?subject=Roadmap%20feedback"
              className="inline-flex items-center gap-2"
              style={{
                padding: "13px 22px",
                background: "transparent",
                border: "1.5px solid var(--sv-paper)",
                fontFamily: "var(--sv-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--sv-paper)",
                textDecoration: "none",
              }}
            >
              Mandar sugestão
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
