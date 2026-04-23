import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Sequência Viral — carrosséis com IA em ~60 segundos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paleta alinhada com a identidade atual SV (verde Kaleidos + pink + paper).
// Versao anterior usava gradiente laranja brutalist antiga — desalinhado.
const INK = "#0A0A0A";
const PAPER = "#F7F5EF";
const GREEN = "#7CF067";
const PINK = "#D262B2";
const WHITE = "#FFFFFF";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          padding: 56,
          border: `12px solid ${INK}`,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Faixa verde diagonal decorativa atras */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 420,
            height: 420,
            background: GREEN,
            transform: "rotate(12deg) translate(140px, -140px)",
            borderLeft: `4px solid ${INK}`,
            borderBottom: `4px solid ${INK}`,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PAPER,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              border: `3px solid ${INK}`,
              boxShadow: `8px 8px 0 ${GREEN}`,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            SV
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: INK,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Sequência Viral
            </span>
            <span style={{ fontSize: 16, color: INK, opacity: 0.65, marginTop: 6 }}>
              Kaleidos Digital
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 18,
              fontFamily: "Georgia, serif",
            }}
          >
            <span
              style={{
                fontSize: 92,
                fontWeight: 400,
                color: INK,
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              Carrosséis em
            </span>
            <span
              style={{
                fontSize: 84,
                fontStyle: "italic",
                background: GREEN,
                padding: "2px 22px",
                border: `4px solid ${INK}`,
                boxShadow: `6px 6px 0 ${INK}`,
                display: "flex",
                color: INK,
              }}
            >
              ~60s
            </span>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: INK,
              opacity: 0.85,
              marginTop: 28,
              lineHeight: 1.3,
              maxWidth: 860,
              display: "flex",
            }}
          >
            Cola um link, a IA escreve no seu tom, monta os slides e entrega
            pra postar. Instagram, LinkedIn e X.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: INK,
              border: `3px solid ${INK}`,
              padding: "12px 20px",
              background: WHITE,
              boxShadow: `4px 4px 0 ${INK}`,
            }}
          >
            viral.kaleidos.com.br
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: INK,
              border: `3px solid ${INK}`,
              padding: "10px 18px",
              background: PINK,
              boxShadow: `4px 4px 0 ${INK}`,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            Cupom VIRAL50 · 50% off
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
