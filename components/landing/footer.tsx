"use client";

import Link from "next/link";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          marginBottom: 14,
        }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-1" style={{ listStyle: "none" }}>
        {links.map((l) => {
          const external = l.href.startsWith("http") || l.href.startsWith("mailto:");
          const Comp: React.ElementType = external ? "a" : Link;
          const extraProps = external
            ? {
                href: l.href,
                target: l.href.startsWith("http") ? "_blank" : undefined,
                rel: "noreferrer",
              }
            : { href: l.href };
          return (
            <li key={l.label}>
              <Comp
                {...extraProps}
                className="inline-flex min-h-[36px] items-center transition-colors hover:bg-[var(--sv-green)]"
              >
                {l.label}
              </Comp>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--sv-paper)",
        borderTop: "1.5px solid var(--sv-ink)",
        padding: "clamp(40px, 7vw, 56px) 0 24px",
        fontSize: 12.5,
      }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div
          className="grid gap-8 sv-footer-grid"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
        >
          <div>
            <div className="mb-[18px]">
              {/* Wordmark tipográfico grande — brand presence via tipografia
                  editorial (Instrument Serif italic) + dot pink. */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 10,
                  fontFamily: "var(--sv-display)",
                  fontSize: "clamp(28px, 6.4vw, 44px)",
                  fontStyle: "italic",
                  letterSpacing: "-0.02em",
                  color: "var(--sv-ink)",
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                Sequência Viral
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    background: "var(--sv-pink)",
                    border: "1.5px solid var(--sv-ink)",
                    transform: "translateY(-3px)",
                  }}
                />
              </div>
            </div>
            <p
              style={{
                maxWidth: 300,
                color: "var(--sv-muted)",
                fontSize: 12.5,
              }}
            >
              Cole um link. Publique um carrossel. Em minutos, não em horas. Um
              braço da Kaleidos Digital.
            </p>
          </div>
          <FooterCol
            title="Produto"
            links={[
              { label: "Criar carrossel", href: "/app/login" },
              { label: "Pricing", href: "#pricing" },
              { label: "Roadmap", href: "/roadmap" },
              { label: "Blog", href: "/blog" },
            ]}
          />
          <FooterCol
            title="Kaleidos"
            links={[
              { label: "kaleidos.com.br", href: "https://kaleidos.com.br" },
              {
                label: "WhatsApp suporte",
                href: "https://wa.me/5512936180547",
              },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacidade", href: "/privacy" },
              { label: "Termos", href: "/terms" },
              { label: "Excluir meus dados", href: "/account/data-deletion" },
            ]}
          />
        </div>

        <div
          className="mt-11 flex flex-wrap items-center justify-between gap-3 pt-5"
          style={{
            borderTop: "1px solid var(--sv-ink)",
            color: "var(--sv-muted)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Sequência Viral — Todos os direitos reservados
          </span>
          <span className="flex items-center gap-[12px]">
            <span
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
              }}
            >
              By
            </span>
            <a
              href="https://kaleidos.com.br"
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "var(--sv-display)",
                textTransform: "none",
                letterSpacing: "-0.01em",
                fontSize: 18,
                fontStyle: "italic",
                color: "var(--sv-ink)",
              }}
            >
              Kaleidos Digital
            </a>
          </span>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .sv-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          .sv-footer-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .sv-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .sv-footer-grid > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  );
}
