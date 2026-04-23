"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { REVEAL, SectionHead } from "./shared";

/**
 * FeaturesSection — enxuta pra 2 cards reais (Brief Engine + Voz da IA).
 * Historico: antes vivia com props/helpers pra 5 cards que nunca foram
 * renderizados. Limpeza em 2026-04-22 pra ficar coerente com o que a
 * landing realmente entrega.
 */

const TYPE_BRIEFS = [
  "faz um post sobre o novo algoritmo do Instagram...",
  "Crie o carrossel perfeito para ajudar a minha loja a vender mais...",
  "Preciso de um carrossel sobre produtividade real...",
  "quebra esse artigo do Bloomberg em 8 slides...",
  "Crie um carrossel com base nesse vídeo no YouTube...",
];

function BriefEngineCard() {
  const [briefIdx, setBriefIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<
    "typing" | "hold" | "thinking" | "ready" | "clearing"
  >("typing");

  useEffect(() => {
    const current = TYPE_BRIEFS[briefIdx];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (typed.length < current.length) {
        t = setTimeout(() => setTyped(current.slice(0, typed.length + 1)), 40);
      } else {
        t = setTimeout(() => setPhase("hold"), 600);
      }
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("thinking"), 700);
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("ready"), 1600);
    } else if (phase === "ready") {
      t = setTimeout(() => setPhase("clearing"), 1400);
    } else {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(current.slice(0, typed.length - 1)), 14);
      } else {
        setBriefIdx((v) => (v + 1) % TYPE_BRIEFS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [typed, phase, briefIdx]);

  const statusLabel =
    phase === "typing"
      ? "Digitando"
      : phase === "hold"
        ? "Lendo briefing"
        : phase === "thinking"
          ? "Processando voz + estética"
          : phase === "ready"
            ? "Carrossel pronto"
            : "Limpando";

  return (
    <motion.div
      {...REVEAL}
      className="sv-card sv-feat"
      style={{ gridColumn: "span 6" }}
    >
      <FeatKicker>Brief engine</FeatKicker>
      <FeatTitle>
        Um <em>editor</em> que pensa,
        <br />
        não só um gerador.
      </FeatTitle>
      <FeatBody>
        Escreve o briefing e a IA processa contexto, voz e referências, antes
        de virar slide.
      </FeatBody>

      <div
        className="mt-4"
        style={{
          border: "1.5px solid var(--sv-ink)",
          background: "var(--sv-white)",
          boxShadow: "3px 3px 0 0 var(--sv-ink)",
          padding: "10px 12px",
          minHeight: 100,
          fontFamily: "var(--sv-sans)",
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--sv-ink)",
        }}
      >
        <div
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 8,
            letterSpacing: "0.22em",
            color: "var(--sv-muted)",
            marginBottom: 6,
          }}
        >
          Seu brief
        </div>
        <span>{typed}</span>
        <span className="sv-cursor" style={{ marginLeft: 1, verticalAlign: "-1px" }} />
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-2"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 8.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            padding: "4px 8px",
            border: "1px solid var(--sv-ink)",
            background:
              phase === "thinking"
                ? "var(--sv-pink)"
                : phase === "ready"
                  ? "var(--sv-green)"
                  : "var(--sv-paper)",
            boxShadow: "1.5px 1.5px 0 0 var(--sv-ink)",
            transition: "background .3s",
          }}
        >
          {phase === "ready" ? "✓ Pronto" : phase === "thinking" ? "Pensando…" : "Instagram"}
        </span>
        <span
          style={{
            padding: "4px 8px",
            border: "1px solid var(--sv-ink)",
            background: phase === "thinking" ? "var(--sv-ink)" : "var(--sv-white)",
            color: phase === "thinking" ? "var(--sv-paper)" : "var(--sv-ink)",
            boxShadow: "1.5px 1.5px 0 0 var(--sv-ink)",
            transition: "background .3s, color .3s",
          }}
        >
          {phase === "thinking" ? "Processando →" : "Gerar →"}
        </span>
      </div>

      <div
        className="mt-3 text-center uppercase"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 8.5,
          letterSpacing: "0.2em",
          color: phase === "ready" ? "var(--sv-ink)" : "var(--sv-muted)",
          fontWeight: 700,
        }}
      >
        {statusLabel}
      </div>
    </motion.div>
  );
}

function FeatKicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-[6px]"
      style={{
        fontFamily: "var(--sv-mono)",
        fontSize: 9.5,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--sv-muted)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          background: "var(--sv-green)",
          border: "1px solid var(--sv-ink)",
          borderRadius: "50%",
          display: "inline-block",
        }}
      />
      {children}
    </span>
  );
}

function FeatTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="sv-display"
      style={{
        fontSize: 22,
        fontWeight: 400,
        letterSpacing: "-0.015em",
        lineHeight: 1.05,
        margin: "14px 0 8px",
      }}
    >
      {children}
    </h3>
  );
}

function FeatBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: "var(--sv-muted)",
        fontSize: 13.5,
        lineHeight: 1.55,
      }}
    >
      {children}
    </p>
  );
}

function VoiceBox({
  title,
  body,
  highlight = false,
}: {
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        border: "1px solid var(--sv-ink)",
        background: highlight ? "var(--sv-green)" : "var(--sv-white)",
        boxShadow: "2px 2px 0 0 var(--sv-ink)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 8.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: highlight ? "var(--sv-ink)" : "var(--sv-muted)",
        }}
      >
        {title}
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, marginTop: 2, color: "var(--sv-ink)" }}>
        {body}
      </p>
    </div>
  );
}

export interface FeaturesSectionProps {
  sub?: string;
  tag?: string;
  heading?: React.ReactNode;
}

export function FeaturesSection(props: FeaturesSectionProps = {}) {
  const { sub = "Features", tag = "Produto", heading } = props;

  return (
    <section id="features" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <SectionHead num="03" sub={sub} tag={tag}>
          {heading ?? (
            <>
              Um editor que <em>pensa</em>,{" "}
              <span style={{ color: "var(--sv-muted)" }}>
                não só um gerador que preenche.
              </span>
            </>
          )}
        </SectionHead>

        <div
          className="sv-bento grid gap-4"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "minmax(140px, auto)",
          }}
        >
          <BriefEngineCard />

          <motion.div
            {...REVEAL}
            className="sv-card sv-feat"
            style={{ gridColumn: "span 6" }}
          >
            <FeatKicker>Voz da IA</FeatKicker>
            <FeatTitle>
              O tom é <em>seu</em>,<br />
              não do ChatGPT.
            </FeatTitle>
            <FeatBody>
              Configure pilares, audiência, tabus e exemplos de posts. A IA
              escreve dentro dessas regras, sem devolver copy genérica.
            </FeatBody>
            <div className="mt-4 flex flex-col gap-2">
              <VoiceBox title="Entrada" body="@meuperfil · 30 posts + regras" />
              <div
                style={{
                  textAlign: "center",
                  fontFamily: "var(--sv-mono)",
                  color: "var(--sv-pink)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                ↓
              </div>
              <VoiceBox title="Saída" body="Carrossel com o seu tom" highlight />
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          #features .sv-bento { grid-template-columns: 1fr !important; }
          #features .sv-feat { grid-column: auto !important; }
        }
      `}</style>
    </section>
  );
}
