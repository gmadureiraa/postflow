import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada · Sequência Viral",
  description:
    "A página que você procura não existe. Volte pra home ou explore o app.",
  robots: { index: false, follow: false },
};

/**
 * 404 customizado — Next.js renderiza isso automaticamente quando
 * `notFound()` é chamado ou quando uma rota não casa.
 *
 * Visualmente alinhado com o brutalist editorial Kaleidos da landing
 * (paper + ink + accent laranja, shadow 4px 4px 0 0 ink).
 */
export default function NotFound() {
  return (
    <main
      style={{
        background: "var(--sv-paper, #FFFDF9)",
        color: "var(--sv-ink, #0A0A0A)",
        fontFamily: "var(--sv-sans, system-ui, sans-serif)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 12px",
            border: "1.5px solid var(--sv-ink, #0A0A0A)",
            background: "var(--sv-white, #fff)",
            fontFamily: "var(--sv-mono, ui-monospace, monospace)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          ERR · 404 · NÃO ENCONTRADO
        </div>

        <h1
          style={{
            fontFamily:
              "var(--sv-serif, 'Instrument Serif', Georgia, serif)",
            fontSize: "clamp(48px, 9vw, 96px)",
            lineHeight: 0.95,
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          Caminho perdido.
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "#525252",
            margin: "0 0 30px",
            maxWidth: 460,
            marginInline: "auto",
          }}
        >
          A URL pode ter mudado, o conteúdo pode ter saído do ar, ou
          alguém digitou errado. Acontece. Aqui vão atalhos pra te
          colocar de volta no fluxo.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              border: "2px solid #0A0A0A",
              background: "#FF5842",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              boxShadow: "4px 4px 0 0 #0A0A0A",
              textDecoration: "none",
            }}
          >
            Voltar pra home
          </Link>
          <Link
            href="/app"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              border: "2px solid #0A0A0A",
              background: "var(--sv-white, #fff)",
              color: "#0A0A0A",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              boxShadow: "4px 4px 0 0 #0A0A0A",
              textDecoration: "none",
            }}
          >
            Abrir o app
          </Link>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              border: "2px solid #0A0A0A",
              background: "transparent",
              color: "#0A0A0A",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Ver blog
          </Link>
        </div>
      </div>
    </main>
  );
}
