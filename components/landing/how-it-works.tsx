"use client";

import { motion } from "framer-motion";
import { BASE_ASSET, REVEAL, SectionHead } from "./shared";

export interface HowItWorksStep {
  n: string;
  img: string;
  alt: string;
  title: React.ReactNode;
  body: React.ReactNode;
}

export interface HowItWorksProps {
  sub?: string;
  tag?: string;
  heading?: React.ReactNode;
  steps?: HowItWorksStep[];
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    n: "01",
    img: "hero-mandala.webp",
    alt: "Ícone de escuta — a IA recebe o seu input",
    title: (
      <>
        <em>Cole</em> a fonte.
      </>
    ),
    body: "Link de YouTube, artigo de blog, post do Instagram ou só uma ideia em uma frase. A IA escuta e entende.",
  },
  {
    n: "02",
    img: "step-typewriter.webp",
    alt: "Ícone de máquina de escrever — a IA processa e escreve",
    title: (
      <>
        A IA <em>pensa</em>.
      </>
    ),
    body: "A IA lê sua fonte, aprende seu tom pelo DNA das suas redes e monta um carrossel completo com imagens próprias em ~60 segundos.",
  },
  {
    n: "03",
    img: "hero-megaphone.webp",
    alt: "Ícone de megafone — o carrossel pronto pra postar",
    title: (
      <>
        Edite. Exporte. <em>Poste</em>.
      </>
    ),
    body: "Ajuste texto e imagem inline. Exporta PNG 1080×1350 pixel-perfect. Abre no celular, posta. Acabou.",
  },
];

export function HowItWorks(props: HowItWorksProps = {}) {
  const {
    sub = "Como funciona",
    tag = "Manual",
    heading,
    steps = DEFAULT_STEPS,
  } = props;

  return (
    <section id="como" style={{ padding: "clamp(56px, 9vw, 96px) 0" }}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <SectionHead num="02" sub={sub} tag={tag}>
          {heading ?? (
            <>
              Três passos.{" "}
              <span style={{ color: "var(--sv-muted)" }}>Nenhum deles envolve</span>{" "}
              <em>editar no Canva</em>.
            </>
          )}
        </SectionHead>

        <style>{`
          @media (max-width: 768px) {
            #como .sv-how-grid { grid-template-columns: 1fr !important; }
            #como .sv-how-grid > article { border-right: none !important; border-bottom: 1px solid var(--sv-ink) !important; padding: 24px 20px !important; }
            #como .sv-how-grid > article:last-child { border-bottom: none !important; }
          }
        `}</style>
        <div
          className="sv-how-grid grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1.5px solid var(--sv-ink)",
            borderBottom: "1.5px solid var(--sv-ink)",
          }}
        >
          {steps.map((s, i) => (
            <motion.article
              key={s.n}
              {...REVEAL}
              className="group relative overflow-hidden transition-colors hover:bg-[var(--sv-green)]"
              style={{
                padding: "32px 28px 28px",
                borderRight:
                  i < steps.length - 1 ? "1px solid var(--sv-ink)" : "none",
              }}
            >
              <div className="mb-10 flex items-start justify-between gap-4 md:mb-14">
                <div
                  style={{
                    fontFamily: "var(--sv-display)",
                    fontSize: "clamp(48px, 9vw, 64px)",
                    lineHeight: 0.82,
                    fontStyle: "italic",
                    color: "var(--sv-ink)",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="relative flex-shrink-0 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105"
                  style={{
                    width: 64,
                    height: 64,
                    transform: "rotate(-6deg)",
                  }}
                >
                  <img
                    src={`${BASE_ASSET}/${s.img}`}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                    style={{
                      filter: "drop-shadow(3px 3px 0 rgba(0,0,0,.15))",
                    }}
                  />
                </div>
              </div>
              <h3
                className="sv-display"
                style={{
                  fontSize: "clamp(20px, 4.4vw, 22px)",
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: "var(--sv-muted)",
                  fontSize: "clamp(13px, 3.4vw, 13.5px)",
                  lineHeight: 1.55,
                  maxWidth: 320,
                }}
              >
                {s.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
