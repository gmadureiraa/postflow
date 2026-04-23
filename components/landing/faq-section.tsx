"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SectionHead } from "./shared";
import { LANDING_FAQ } from "@/lib/landing-faq";

export interface FAQItem {
  q: React.ReactNode;
  a: React.ReactNode;
}

// Fonte unica: `lib/landing-faq.ts`. UI e JSON-LD consomem os mesmos itens
// pra evitar divergencia entre o que Google indexa e o que o user ve.
// Aqui `em` so embeleza a primeira palavra/verbo, sem mudar o conteudo.
const DEFAULT_FAQ_ITEMS: FAQItem[] = LANDING_FAQ.map((it) => ({
  q: it.q,
  a: it.a,
}));

export interface FAQSectionProps {
  sub?: string;
  tag?: string;
  heading?: React.ReactNode;
  items?: FAQItem[];
}

export function FAQSection(props: FAQSectionProps = {}) {
  const {
    sub = "FAQ",
    tag = "Respostas rápidas",
    heading,
    items = DEFAULT_FAQ_ITEMS,
  } = props;
  const FAQ_ITEMS = items;
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" style={{ padding: "0 0 96px" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <SectionHead num="07" sub={sub} tag={tag}>
          {heading ?? (
            <>
              Perguntas <em>antes</em> de pagar.
            </>
          )}
        </SectionHead>

        <div
          className="flex flex-col"
          style={{
            maxWidth: 880,
            borderTop: "1.5px solid var(--sv-ink)",
            borderBottom: "1.5px solid var(--sv-ink)",
          }}
        >
          {FAQ_ITEMS.map((item, i) => {
            const open = openIdx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpenIdx(open ? -1 : i)}
                className="w-full cursor-pointer text-left"
                aria-expanded={open}
                style={{
                  padding: "22px 0",
                  borderBottom:
                    i < FAQ_ITEMS.length - 1 ? "1px solid var(--sv-ink)" : "none",
                  background: "transparent",
                }}
              >
                <div
                  className="flex items-center justify-between gap-5"
                  style={{
                    fontFamily: "var(--sv-display)",
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: "-0.012em",
                    lineHeight: 1.25,
                  }}
                >
                  <span className="flex-1">{item.q}</span>
                  <span
                    className="inline-flex flex-shrink-0 items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      border: "1px solid var(--sv-ink)",
                      fontFamily: "var(--sv-mono)",
                      fontSize: 16,
                      lineHeight: 1,
                      background: open ? "var(--sv-green)" : "transparent",
                      transform: open ? "rotate(45deg)" : undefined,
                      transition: "background .2s, transform .3s",
                    }}
                  >
                    +
                  </span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ maxHeight: open ? 800 : 0, marginTop: open ? 12 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    overflow: "hidden",
                    color: "var(--sv-muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    paddingRight: 48,
                  }}
                >
                  <div>{item.a}</div>
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
