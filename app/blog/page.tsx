import type { Metadata } from "next";
import Link from "next/link";
import {
  POSTS_META,
  CATEGORIES,
  formatDatePt,
  type PostMeta,
} from "@/lib/blog-posts-meta";
import { Footer } from "@/components/landing/footer";

/* ─────────────────── METADATA ─────────────────── */

export const metadata: Metadata = {
  title:
    "Blog Sequência Viral — Decodificando conteúdo, algoritmos e viralização",
  description:
    "Leitura editorial pra quem leva criação de conteúdo a sério. Carrosséis, algoritmo do Instagram, copywriting, IA e os bastidores de quem publica em volume. Por trás do Sequência Viral.",
  alternates: {
    canonical: "https://viral.kaleidos.com.br/blog",
    languages: {
      "pt-BR": "https://viral.kaleidos.com.br/blog",
    },
  },
  openGraph: {
    title: "Blog Sequência Viral — Decodificando conteúdo e algoritmos",
    description:
      "Leitura editorial pra creators sérios. Carrosséis, copywriting, IA, algoritmo do Instagram. Sem papo furado.",
    type: "website",
    url: "https://viral.kaleidos.com.br/blog",
    siteName: "Sequência Viral",
    locale: "pt_BR",
    images: [
      {
        url: "/brand/logo-sv-full.png",
        width: 1200,
        height: 630,
        alt: "Sequência Viral — Blog editorial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Sequência Viral — Conteúdo, marcas e algoritmos",
    description:
      "Leitura editorial pra creators sérios. Carrosséis, IA, algoritmo e copywriting.",
    images: ["/brand/logo-sv-full.png"],
  },
};

/* ─────────────────── JSON-LD ─────────────────── */

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog Sequência Viral",
  description:
    "Guias editoriais sobre carrosséis, IA, algoritmo do Instagram, copywriting e produção de conteúdo em volume.",
  url: "https://viral.kaleidos.com.br/blog",
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: "Sequência Viral",
    url: "https://viral.kaleidos.com.br",
    logo: {
      "@type": "ImageObject",
      url: "https://viral.kaleidos.com.br/brand/logo-sv-full.png",
    },
  },
  blogPost: POSTS_META.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    url: `https://viral.kaleidos.com.br/blog/${p.slug}`,
    author: { "@type": "Organization", name: "Sequência Viral" },
  })),
};

/* ─────────────────── VISUAL BLOCKS (placeholder covers) ─────────────────── */

function CoverBlock({ post }: { post: PostMeta }) {
  // Bloco visual tipográfico — substitui capa quando não há imagem real.
  // Usa as cores da paleta SV. Cada "tint" pinta o bloco diferente.
  const palette = {
    green: { bg: "var(--sv-green)", fg: "var(--sv-ink)" },
    pink: { bg: "var(--sv-pink)", fg: "var(--sv-ink)" },
    ink: { bg: "var(--sv-ink)", fg: "var(--sv-paper)" },
    paper: { bg: "var(--sv-soft)", fg: "var(--sv-ink)" },
  } as const;
  const p = palette[post.tint ?? "paper"];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: p.bg,
        color: p.fg,
        aspectRatio: "16 / 10",
        borderBottom: "1.5px solid var(--sv-ink)",
      }}
    >
      {/* Número editorial em marca d'água */}
      <span
        className="absolute"
        style={{
          top: -14,
          right: -10,
          fontFamily: "var(--sv-display)",
          fontSize: "clamp(110px, 22vw, 220px)",
          lineHeight: 0.8,
          fontStyle: "italic",
          opacity: 0.14,
          letterSpacing: "-0.04em",
          pointerEvents: "none",
        }}
      >
        {post.number ? `Nº${String(post.number).padStart(2, "0")}` : ""}
      </span>

      {/* Kicker + categoria */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4">
        <span
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Editorial
        </span>
        <span
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {post.category}
        </span>
      </div>

      {/* Título curto + ornamentos */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
        <div
          style={{
            fontFamily: "var(--sv-display)",
            fontStyle: "italic",
            fontSize: "clamp(24px, 3.2vw, 40px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            // limita a 2 linhas no bloco
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title.split(":")[0]}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default function BlogIndex() {
  const [featured, ...rest] = POSTS_META;
  // Primeira linha: 2 cards destaque (após o hero); resto: grid 3 colunas
  const secondary = rest.slice(0, 2);
  const regular = rest.slice(2);

  return (
    <div className="min-h-screen" style={{ background: "var(--sv-paper)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "color-mix(in srgb, var(--sv-paper) 90%, transparent)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--sv-ink)",
        }}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-[10px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-sv-mark.png"
              alt="Sequência Viral"
              style={{ width: 38, height: 38, objectFit: "contain" }}
            />
            <span className="flex flex-col leading-none">
              <span
                className="sv-display"
                style={{ fontSize: 16, letterSpacing: "-0.01em" }}
              >
                Sequência <em>Viral</em>
              </span>
              <span
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 8.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--sv-muted)",
                  marginTop: 2,
                }}
              >
                Editorial · Blog
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--sv-ink)",
              }}
              className="hidden px-3 py-[7px] transition-colors hover:bg-[var(--sv-green)] md:inline-block"
            >
              Home
            </Link>
            <Link
              href="/app/signup"
              className="sv-btn sv-btn-primary"
              style={{ padding: "8px 14px", fontSize: 9.5 }}
            >
              Criar grátis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO EDITORIAL ──────────────────────────────────────────── */}
      <header
        className="relative border-b"
        style={{ borderColor: "var(--sv-ink)" }}
      >
        <div className="mx-auto max-w-[1240px] px-6 py-14 md:py-24">
          {/* breadcrumb */}
          <div
            className="mb-7 flex flex-wrap items-center gap-2"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
            }}
          >
            <span>Sequência Viral</span>
            <span style={{ color: "var(--sv-ink)" }}>·</span>
            <span style={{ color: "var(--sv-ink)" }}>Blog</span>
            <span className="mx-2" style={{ color: "var(--sv-ink)" }}>
              ——
            </span>
            <span>Ed. Nº {POSTS_META[0]?.number ?? 11}</span>
          </div>

          <h1
            className="sv-display"
            style={{
              fontSize: "clamp(44px, 8vw, 108px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
              maxWidth: "14ch",
            }}
          >
            Decodificando{" "}
            <span className="sv-splash">conteúdo</span>,<br />
            marcas e{" "}
            <em
              style={{ color: "var(--sv-ink)" }}
              className="sv-under"
            >
              algoritmos
            </em>
            .
          </h1>

          <p
            className="mt-8 max-w-[640px]"
            style={{
              fontFamily: "var(--sv-display-alt)",
              fontSize: 21,
              lineHeight: 1.45,
              color: "var(--sv-ink)",
              letterSpacing: "-0.005em",
            }}
          >
            Leitura editorial pra quem leva criação de conteúdo a sério.
            Bastidores, frameworks e análises de quem publica em volume e
            não romantiza o processo.
          </p>

          {/* Meta do número / ticker */}
          <div
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
            }}
          >
            <span>{POSTS_META.length} edições</span>
            <span>·</span>
            <span>Atualizado {formatDatePt(POSTS_META[0]?.date ?? "2026-04-15")}</span>
            <span>·</span>
            <span>Português brasileiro</span>
          </div>
        </div>

        {/* Linha de categorias — chips */}
        <div
          className="border-t"
          style={{
            borderColor: "var(--sv-ink)",
            background: "var(--sv-soft)",
          }}
        >
          <div className="mx-auto flex max-w-[1240px] flex-wrap gap-2 px-6 py-4">
            {CATEGORIES.map((cat) => (
              <span key={cat} className="sv-chip">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── FEATURED ─────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ borderColor: "var(--sv-ink)" }}
      >
        <div className="mx-auto max-w-[1240px] px-6 py-14">
          {/* kicker */}
          <div className="mb-6 flex items-center gap-3">
            <span
              style={{
                width: 34,
                height: 1.5,
                background: "var(--sv-ink)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Edição em destaque
            </span>
          </div>

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid gap-8 md:grid-cols-[1.1fr_1fr]"
            >
              {/* Capa */}
              <div
                className="sv-card p-0"
                style={{ overflow: "hidden" }}
              >
                <CoverBlock post={featured} />
              </div>

              {/* Texto */}
              <div className="flex flex-col justify-center">
                <div
                  className="mb-4 flex items-center gap-3"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--sv-muted)",
                  }}
                >
                  <span style={{ color: "var(--sv-ink)" }}>
                    Nº{String(featured.number ?? 0).padStart(2, "0")}
                  </span>
                  <span>·</span>
                  <span>{featured.category}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2
                  className="sv-display transition-colors group-hover:text-[var(--sv-pink)]"
                  style={{
                    fontSize: "clamp(32px, 4.5vw, 56px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {featured.title}
                </h2>
                <p
                  className="mt-5"
                  style={{
                    fontFamily: "var(--sv-display-alt)",
                    fontSize: 19,
                    lineHeight: 1.5,
                    color: "var(--sv-muted)",
                    maxWidth: "56ch",
                  }}
                >
                  {featured.excerpt}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <span className="sv-btn sv-btn-primary">
                    Ler edição completa →
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--sv-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--sv-muted)",
                    }}
                  >
                    {formatDatePt(featured.date)}
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── SECONDARY 2-UP ────────────────────────────────────────── */}
      {secondary.length > 0 && (
        <section
          className="border-b"
          style={{ borderColor: "var(--sv-ink)" }}
        >
          <div className="mx-auto max-w-[1240px] px-6 py-14">
            <div className="mb-6 flex items-center gap-3">
              <span
                style={{
                  width: 34,
                  height: 1.5,
                  background: "var(--sv-ink)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                Mais recentes
              </span>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {secondary.map((post) => (
                <PostCard key={post.slug} post={post} size="large" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ARCHIVE GRID 3-UP ─────────────────────────────────────── */}
      {regular.length > 0 && (
        <section
          className="border-b"
          style={{ borderColor: "var(--sv-ink)" }}
        >
          <div className="mx-auto max-w-[1240px] px-6 py-14">
            <div className="mb-6 flex items-center gap-3">
              <span
                style={{
                  width: 34,
                  height: 1.5,
                  background: "var(--sv-ink)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                Arquivo editorial
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regular.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{
          borderColor: "var(--sv-ink)",
          background: "var(--sv-ink)",
          color: "var(--sv-paper)",
        }}
      >
        <div className="mx-auto max-w-[1240px] px-6 py-20 text-center">
          <div
            className="mx-auto mb-5 inline-flex items-center gap-2 px-3 py-1"
            style={{
              border: "1.5px solid var(--sv-paper)",
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: "var(--sv-green)",
                display: "inline-block",
              }}
            />
            Sequência Viral
          </div>

          <h2
            className="sv-display mx-auto"
            style={{
              fontSize: "clamp(36px, 6vw, 76px)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              color: "var(--sv-paper)",
              maxWidth: "18ch",
            }}
          >
            Da leitura pro <em className="sv-text-green">feed</em> em 60 segundos.
          </h2>

          <p
            className="mx-auto mt-6 max-w-[560px]"
            style={{
              fontFamily: "var(--sv-display-alt)",
              fontSize: 19,
              lineHeight: 1.5,
              color: "color-mix(in srgb, var(--sv-paper) 70%, transparent)",
            }}
          >
            Cola um link, a IA escreve no seu tom, monta os slides e entrega
            pronto pra postar. Grátis, sem cartão, sem enrolação.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/signup" className="sv-btn sv-btn-primary">
              Criar carrossel grátis →
            </Link>
            <Link
              href="/"
              className="sv-btn"
              style={{
                background: "transparent",
                color: "var(--sv-paper)",
                borderColor: "var(--sv-paper)",
                boxShadow: "3px 3px 0 0 var(--sv-green)",
              }}
            >
              Ver como funciona
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─────────────────── CARD COMPONENT ─────────────────── */

function PostCard({
  post,
  size = "default",
}: {
  post: PostMeta;
  size?: "default" | "large";
}) {
  const titleSize = size === "large" ? "clamp(26px, 2.5vw, 36px)" : "22px";
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="sv-card" style={{ padding: 0 }}>
        <CoverBlock post={post} />

        <div className="p-6">
          <div
            className="mb-4 flex items-center gap-3"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
            }}
          >
            <span style={{ color: "var(--sv-ink)" }}>
              Nº{String(post.number ?? 0).padStart(2, "0")}
            </span>
            <span>·</span>
            <span>{post.category}</span>
          </div>

          <h3
            className="sv-display transition-colors group-hover:text-[var(--sv-pink)]"
            style={{
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            {post.title}
          </h3>

          <p
            className="mt-3"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 14.5,
              lineHeight: 1.55,
              color: "var(--sv-muted)",
              display: "-webkit-box",
              WebkitLineClamp: size === "large" ? 4 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>

          <div
            className="mt-5 flex items-center justify-between pt-4"
            style={{
              borderTop: "1px solid color-mix(in srgb, var(--sv-ink) 18%, transparent)",
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
            }}
          >
            <span>{formatDatePt(post.date)}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
