"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import CarouselSlide from "@/components/app/carousel-slide";

/**
 * iPhone mockup realista (estilo iPhone 15/16) com Dynamic Island,
 * bordas metálicas e sombra premium. Renderiza um CarouselSlide
 * real dentro da tela com cross-fade entre slides (3s).
 *
 * Todas as dimensões internas se baseiam em `width` (largura do frame).
 * Proporção do frame ≈ 19.5/9 (iPhone 15+).
 */

const PROFILE = {
  name: "Gabriel Madureira",
  handle: "@madureira0x",
  photoUrl: "",
};

const SLIDES: {
  heading: string;
  body: string;
  style: "white" | "dark";
}[] = [
  {
    heading: "O algoritmo não é seu inimigo.",
    body: "Seu **hook** é.",
    style: "dark",
  },
  {
    heading:
      "78% dos carrosséis que viralizam têm 1 coisa em comum.",
    body: "O primeiro slide não explica, ele **interrompe**.",
    style: "white",
  },
  {
    heading: "3 gatilhos que funcionam sempre:",
    body: "**Curiosidade.** Contradição. Consequência.",
    style: "dark",
  },
  {
    heading: "Como o algoritmo do Instagram realmente funciona em 2026.",
    body: "Não é sobre **postar mais**. É sobre postar com propósito.",
    style: "white",
  },
];

export function IphoneMockup({ width = 340 }: { width?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setIdx((v) => (v + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // Proporção real do iPhone 15/16 ≈ 19.5:9
  const height = width * (19.5 / 9);

  // Escalas internas
  const frameRadius = width * 0.155; // ~52 em 340
  const screenRadius = width * 0.125; // ~42 em 340
  const framePadding = width * 0.035; // ~12 em 340
  const islandWidth = width * 0.3; // ~100 em 340
  const islandHeight = width * 0.08; // ~28 em 340
  const islandTop = width * 0.03; // ~10 em 340

  // Tamanho interno da tela
  const screenWidth = width - framePadding * 2;
  const screenHeight = height - framePadding * 2;

  // CarouselSlide canvas é 1080x1350 (4:5). Pra caber confortável na
  // largura da tela com margem, escala ≈ screenWidth * 0.88 / 1080.
  const slideTargetWidth = screenWidth * 0.88;
  const slideScale = slideTargetWidth / 1080;

  const current = SLIDES[idx];

  return (
    <div
      className="relative mx-auto"
      style={{ width, height }}
    >
      {/* Glow premium atrás do frame */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -24,
          borderRadius: frameRadius + 24,
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(236, 96, 0, 0.18), transparent 70%)",
          filter: "blur(12px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Frame metálico */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: frameRadius,
          background:
            "linear-gradient(135deg, #2a2a2c 0%, #1c1c1e 30%, #0a0a0a 70%, #1c1c1e 100%)",
          padding: framePadding,
          boxShadow: [
            "0 40px 80px rgba(0,0,0,0.35)",
            "0 10px 30px rgba(0,0,0,0.25)",
            "0 0 0 1px rgba(255,255,255,0.08) inset",
            "0 2px 0 rgba(255,255,255,0.14) inset",
            "0 -1px 0 rgba(0,0,0,0.4) inset",
          ].join(", "),
          zIndex: 1,
        }}
      >
        {/* Tela */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: screenRadius,
            overflow: "hidden",
            background: current.style === "dark" ? "#0A0A0A" : "#ffffff",
            position: "relative",
            boxShadow: "0 0 0 2px rgba(0,0,0,0.8) inset",
          }}
        >
          {/* Dynamic Island */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: islandTop,
              left: "50%",
              transform: "translateX(-50%)",
              width: islandWidth,
              height: islandHeight,
              borderRadius: islandHeight / 2,
              background: "#000",
              zIndex: 10,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
            }}
          />

          {/* Status bar time */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: islandTop + islandHeight / 2 - 8,
              left: width * 0.08,
              fontSize: width * 0.04,
              fontWeight: 600,
              color: current.style === "dark" ? "#fff" : "#0A0A0A",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              letterSpacing: "-0.02em",
              zIndex: 9,
            }}
          >
            9:41
          </div>
          {/* Status bar icons (signal + wifi + battery) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: islandTop + islandHeight / 2 - 7,
              right: width * 0.08,
              display: "flex",
              alignItems: "center",
              gap: width * 0.015,
              zIndex: 9,
              color: current.style === "dark" ? "#fff" : "#0A0A0A",
            }}
          >
            {/* signal */}
            <svg width={width * 0.05} height={width * 0.035} viewBox="0 0 18 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.5" />
              <rect x="5" y="5" width="3" height="7" rx="0.5" />
              <rect x="10" y="2" width="3" height="10" rx="0.5" />
              <rect x="15" y="0" width="3" height="12" rx="0.5" />
            </svg>
            {/* wifi */}
            <svg width={width * 0.05} height={width * 0.04} viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 11.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM3.3 6.6a6.7 6.7 0 019.4 0l1.4-1.4a8.7 8.7 0 00-12.2 0l1.4 1.4zM5.4 8.7a3.7 3.7 0 015.2 0l1.4-1.4a5.7 5.7 0 00-8 0l1.4 1.4z" />
            </svg>
            {/* battery */}
            <div
              style={{
                width: width * 0.075,
                height: width * 0.035,
                border: `1px solid currentColor`,
                borderRadius: 2,
                position: "relative",
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 1,
                  width: "78%",
                  background: "currentColor",
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -2.5,
                  top: "30%",
                  height: "40%",
                  width: 1.5,
                  background: "currentColor",
                  borderRadius: 1,
                }}
              />
            </div>
          </div>

          {/* Conteúdo do carrossel — cross-fade */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              paddingTop: islandTop + islandHeight + width * 0.04,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CarouselSlide
                  heading={current.heading}
                  body={current.body}
                  slideNumber={idx + 1}
                  totalSlides={SLIDES.length}
                  profile={PROFILE}
                  style={current.style}
                  scale={slideScale}
                  showFooter={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Home indicator */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: width * 0.025,
              left: "50%",
              transform: "translateX(-50%)",
              width: width * 0.38,
              height: width * 0.012,
              borderRadius: width * 0.006,
              background:
                current.style === "dark"
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(10,10,10,0.7)",
              zIndex: 10,
            }}
          />

          {/* Dots indicador de slide (pillzinha no topo, estilo Instagram) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: width * 0.12,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: width * 0.018,
              zIndex: 8,
            }}
          >
            {SLIDES.map((_, i) => (
              <span
                key={i}
                style={{
                  width: width * 0.016,
                  height: width * 0.016,
                  borderRadius: "50%",
                  background:
                    i === idx
                      ? current.style === "dark"
                        ? "#fff"
                        : "#0A0A0A"
                      : current.style === "dark"
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(10,10,10,0.25)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Highlight no topo do frame (reflexo metálico sutil) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 1,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            borderRadius: frameRadius,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export default IphoneMockup;
