"use client";

import { motion } from "framer-motion";

export const BASE_ASSET = "/brand/landing";

export const REVEAL = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const },
};

export function SectionHead({
  num,
  sub,
  children,
  tag,
}: {
  num: string;
  sub: string;
  children: React.ReactNode;
  tag?: string;
}) {
  return (
    <div className="sv-section-head mb-8 md:mb-12">
      <style>{`
        .sv-section-head {
          display: grid;
          align-items: end;
          row-gap: 14px;
          column-gap: 22px;
          grid-template-columns: auto 1fr;
          grid-template-areas: "num tag" "title title";
        }
        @media (min-width: 768px) {
          .sv-section-head {
            row-gap: 24px;
            column-gap: 36px;
            grid-template-columns: auto 1fr auto;
            grid-template-areas: "num title tag";
          }
        }
      `}</style>
      <div
        style={{
          gridArea: "num",
          fontFamily: "var(--sv-display)",
          fontSize: "clamp(40px, 9vw, 64px)",
          lineHeight: 0.85,
          color: "var(--sv-pink)",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        {num}
        <span
          style={{
            display: "block",
            fontFamily: "var(--sv-mono)",
            fontSize: 9.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
            fontStyle: "normal",
            marginTop: 6,
            lineHeight: 1,
          }}
        >
          {sub}
        </span>
      </div>
      <motion.h2
        {...REVEAL}
        className="sv-display"
        style={{
          gridArea: "title",
          fontSize: "clamp(24px, 5.4vw, 48px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          fontWeight: 400,
          maxWidth: 820,
        }}
      >
        {children}
      </motion.h2>
      {tag && (
        <span
          className="self-start whitespace-nowrap md:justify-self-end"
          style={{
            gridArea: "tag",
            justifySelf: "end",
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "4px 10px",
            border: "1px solid var(--sv-ink)",
            background: "var(--sv-white)",
            boxShadow: "2px 2px 0 0 var(--sv-ink)",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

export function Ticker() {
  // Claims verificaveis — sem numeros hardcoded que envelhecem mal. Cada item
  // fala de um fato do produto: cobertura de plataformas, ritmo, origens de
  // conteudo e capacidade do plano Pro. Se um dia tiver metrica real (live
  // count de carrosseis), trocar por essa fonte.
  const items = [
    { k: "YouTube · Blog · IG · X", v: "· 1 link, 1 carrossel" },
    { k: "~60s", v: "por carrossel" },
    { k: "4 origens", v: "· YouTube · Blog · Reel · Ideia" },
    { k: "30 posts", v: "/mês no Pro" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="sv-ticker">
      <div className="sv-ticker-track">
        {doubled.map((it, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>
              <span className="sv-hl">{it.k}</span> {it.v}
            </span>
            <span className="sv-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
