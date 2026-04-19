"use client";

import { forwardRef } from "react";
import type { SlideProps } from "./types";
import {
  resolveImgSrc,
  renderRichText,
  CANVAS_W,
  CANVAS_H,
  MONO_STACK,
} from "./utils";

/**
 * Template 01 — Manifesto Editorial
 *
 * Paleta: preto + creme + verde lime / pink alternando por slide. Display
 * em Atelier com italic estrutural. Borda 3px preta, kicker mono topo,
 * wordmark de rodapé. Se `imageUrl` estiver presente, trata como "cover"
 * ocupando todo o canvas com overlay escuro (gradiente).
 */

const TemplateManifesto = forwardRef<HTMLDivElement, SlideProps>(
  function TemplateManifesto(
    {
      heading,
      body,
      imageUrl,
      slideNumber,
      totalSlides,
      profile,
      style,
      isLastSlide,
      scale = 0.38,
      exportMode = false,
    },
    ref
  ) {
    const bodyImgSrc = resolveImgSrc(imageUrl, exportMode);
    const hasImage = Boolean(bodyImgSrc);
    // Alterna accent por slide: slides ímpares em verde lime, pares em pink.
    const accent = slideNumber % 2 === 1 ? "#7CF067" : "#D262B2";
    const paper = "#F7F5EF";
    const ink = "#0A0A0A";

    // Modo "cover" com imagem: fundo preto + imagem cover + overlay + texto branco.
    // Modo "editorial" sem imagem: fundo creme + texto preto + acento.
    const isCover = hasImage || isLastSlide === false && slideNumber === 1;

    const bg = isCover ? ink : paper;
    const fg = isCover ? paper : ink;

    const displayStack =
      '"Atelier", "Instrument Serif", "Times New Roman", Georgia, serif';
    const serifStack =
      '"Instrument Serif", Georgia, "Times New Roman", serif';

    const kickerText = `● BRANDSDECODED · Nº ${String(slideNumber).padStart(
      2,
      "0"
    )}/${String(totalSlides).padStart(2, "0")} · MMXXVI`;

    return (
      <div
        className="flex-shrink-0"
        style={{
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          ref={ref}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: bg,
            color: fg,
            border: `3px solid ${ink}`,
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: serifStack,
          }}
        >
          {/* Cover image + dark gradient overlay (se tiver imagem) */}
          {hasImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bodyImgSrc}
                crossOrigin="anonymous"
                alt={heading}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.4) 55%, rgba(10,10,10,0.94) 100%)",
                  zIndex: 1,
                }}
              />
            </>
          )}

          {/* Kicker topo */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "78px 90px 0",
              fontFamily: MONO_STACK,
              fontSize: 22,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: isCover ? accent : ink,
              fontWeight: 700,
            }}
          >
            {kickerText}
          </div>

          {/* Counter chip */}
          <div
            style={{
              position: "absolute",
              top: 70,
              right: 90,
              zIndex: 3,
              fontFamily: MONO_STACK,
              fontSize: 20,
              letterSpacing: "0.18em",
              color: isCover ? "rgba(247,245,239,0.7)" : "rgba(10,10,10,0.5)",
            }}
          >
            {String(slideNumber).padStart(2, "0")} /{" "}
            {String(totalSlides).padStart(2, "0")}
          </div>

          {/* Conteúdo central */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              flex: "1 1 0",
              display: "flex",
              flexDirection: "column",
              justifyContent: isCover ? "flex-end" : "center",
              padding: isCover ? "0 90px 180px" : "40px 90px 40px",
              gap: 36,
              minHeight: 0,
            }}
          >
            {/* Tick accent bar para slides editoriais (sem imagem) */}
            {!isCover && !isLastSlide && (
              <div
                style={{
                  width: 96,
                  height: 8,
                  background: accent,
                }}
              />
            )}

            <h1
              style={{
                fontFamily: displayStack,
                fontSize: isCover ? 130 : 118,
                fontWeight: 400,
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                margin: 0,
                color: fg,
                fontStyle: slideNumber % 2 === 0 ? "italic" : "normal",
              }}
            >
              {renderRichText(heading, accent)}
            </h1>

            <p
              style={{
                fontFamily: serifStack,
                fontSize: 36,
                lineHeight: 1.42,
                margin: 0,
                color: isCover ? "rgba(247,245,239,0.88)" : ink,
                maxWidth: 860,
                whiteSpace: "pre-line",
              }}
            >
              {renderRichText(body, accent)}
            </p>

            {isLastSlide && (
              <div
                style={{
                  marginTop: 24,
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  gap: 18,
                  padding: "26px 46px",
                  background: accent,
                  color: ink,
                  fontFamily: MONO_STACK,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: `3px solid ${ink}`,
                }}
              >
                Seguir {profile.handle}
                <span style={{ fontSize: 30 }}>→</span>
              </div>
            )}
          </div>

          {/* Footer: wordmark + handle */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "0 90px 70px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              color: isCover ? paper : ink,
            }}
          >
            <div
              style={{
                fontFamily: displayStack,
                fontSize: 46,
                fontStyle: "italic",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              Sequência Viral
            </div>
            <div
              style={{
                fontFamily: MONO_STACK,
                fontSize: 22,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isCover ? "rgba(247,245,239,0.75)" : "rgba(10,10,10,0.6)",
              }}
            >
              {profile.handle}
            </div>
          </div>

          {/* Seta no primeiro slide */}
          {slideNumber === 1 && !isLastSlide && (
            <div
              style={{
                position: "absolute",
                right: 90,
                bottom: 160,
                zIndex: 3,
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: accent,
                border: `3px solid ${ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: ink,
                fontSize: 48,
                fontWeight: 900,
              }}
            >
              →
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default TemplateManifesto;
