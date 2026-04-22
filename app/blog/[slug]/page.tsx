import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog/posts-content";
import {
  postBySlug,
  relatedPosts,
  formatDatePt,
} from "@/lib/blog-posts-meta";
import { Footer } from "@/components/landing/footer";

/* ─────────────────── STATIC PARAMS ─────────────────── */

export function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }));
}

export const revalidate = 300;

/* ─────────────────── METADATA ─────────────────── */

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = BLOG_POSTS[slug];

  if (!post) {
    return { title: "Post não encontrado | Sequência Viral Blog" };
  }

  return {
    title: `${post.title} | Sequência Viral Blog`,
    description: post.description,
    alternates: {
      canonical: `https://viral.kaleidos.com.br/blog/${post.slug}`,
      languages: {
        "pt-BR": `https://viral.kaleidos.com.br/blog/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://viral.kaleidos.com.br/blog/${post.slug}`,
      publishedTime: post.date,
      authors: ["Sequência Viral"],
      siteName: "Sequência Viral",
      locale: "pt_BR",
      images: [
        {
          url: "/brand/logo-sv-full.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/brand/logo-sv-full.png"],
    },
  };
}

/* ─────────────────── COVER BLOCK (placeholder visual) ─────────────────── */

function ArticleCover({
  title,
  number,
  tint,
  category,
}: {
  title: string;
  number?: number;
  tint: "green" | "pink" | "ink" | "paper";
  category: string;
}) {
  const palette = {
    green: { bg: "var(--sv-green)", fg: "var(--sv-ink)" },
    pink: { bg: "var(--sv-pink)", fg: "var(--sv-ink)" },
    ink: { bg: "var(--sv-ink)", fg: "var(--sv-paper)" },
    paper: { bg: "var(--sv-soft)", fg: "var(--sv-ink)" },
  } as const;
  const p = palette[tint];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: p.bg,
        color: p.fg,
        aspectRatio: "21 / 9",
        border: "1.5px solid var(--sv-ink)",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      {/* Número editorial gigante */}
      <span
        className="absolute"
        style={{
          top: "-10%",
          right: "-2%",
          fontFamily: "var(--sv-display)",
          fontSize: "clamp(180px, 38vw, 460px)",
          lineHeight: 0.8,
          fontStyle: "italic",
          opacity: 0.14,
          letterSpacing: "-0.04em",
          pointerEvents: "none",
        }}
      >
        {number ? `Nº${String(number).padStart(2, "0")}` : ""}
      </span>

      <div className="absolute inset-x-0 top-0 px-6 pt-5 md:px-10 md:pt-7">
        <div
          className="flex items-center gap-3"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          <span>Editorial</span>
          <span>·</span>
          <span>{category}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-10 md:pb-9">
        <div
          style={{
            fontFamily: "var(--sv-display)",
            fontStyle: "italic",
            fontSize: "clamp(28px, 4.5vw, 64px)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            maxWidth: "20ch",
          }}
        >
          {title.split(":")[0]}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = BLOG_POSTS[slug];
  const meta = postBySlug(slug);

  if (!post) {
    notFound();
  }

  const tint = meta?.tint ?? "paper";
  const number = meta?.number;
  const related = relatedPosts(slug, 3);

  // ── JSON-LD Article ──
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://viral.kaleidos.com.br/blog/${post.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "Sequência Viral",
      url: "https://viral.kaleidos.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "Sequência Viral",
      logo: {
        "@type": "ImageObject",
        url: "https://viral.kaleidos.com.br/brand/logo-sv-full.png",
      },
    },
    image: "https://viral.kaleidos.com.br/brand/logo-sv-full.png",
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Sequência Viral",
        item: "https://viral.kaleidos.com.br",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://viral.kaleidos.com.br/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://viral.kaleidos.com.br/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--sv-paper)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── NAV ─────────────────────────────────────────────────── */}
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
              href="/blog"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--sv-ink)",
              }}
              className="hidden px-3 py-[7px] transition-colors hover:bg-[var(--sv-green)] md:inline-block"
            >
              ← Todas as edições
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

      {/* ── BREADCRUMB ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1240px] px-6 pt-10">
        <div
          className="flex flex-wrap items-center gap-2"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          <Link
            href="/"
            className="transition-colors hover:text-[var(--sv-ink)]"
          >
            Sequência Viral
          </Link>
          <span>·</span>
          <Link
            href="/blog"
            className="transition-colors hover:text-[var(--sv-ink)]"
          >
            Blog
          </Link>
          <span>·</span>
          <span style={{ color: "var(--sv-ink)" }}>{post.category}</span>
          {number && (
            <>
              <span>·</span>
              <span style={{ color: "var(--sv-ink)" }}>
                Nº{String(number).padStart(2, "0")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── HERO EDITORIAL ──────────────────────────────────────── */}
      <header
        className="mx-auto max-w-[1240px] px-6 pt-10 pb-12 md:pt-14 md:pb-16"
      >
        <div
          className="mb-8 flex items-center gap-3"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          <span style={{ color: "var(--sv-ink)" }}>{post.category}</span>
          {number && (
            <>
              <span>·</span>
              <span style={{ color: "var(--sv-ink)" }}>
                Edição Nº{String(number).padStart(2, "0")}
              </span>
            </>
          )}
          <span>·</span>
          <span>{formatDatePt(post.date)}</span>
        </div>

        <h1
          className="sv-display max-w-[18ch]"
          style={{
            fontSize: "clamp(40px, 7vw, 92px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
          }}
        >
          {post.title}
        </h1>

        <p
          className="mt-8 max-w-[720px]"
          style={{
            fontFamily: "var(--sv-display-alt)",
            fontSize: 22,
            lineHeight: 1.45,
            color: "var(--sv-muted)",
            letterSpacing: "-0.005em",
          }}
        >
          {post.description}
        </p>

        {/* Meta row */}
        <div
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6"
          style={{
            borderColor: "color-mix(in srgb, var(--sv-ink) 18%, transparent)",
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          <span>
            <span style={{ color: "var(--sv-ink)" }}>Por</span> Sequência Viral
          </span>
          <span>·</span>
          <span>{post.readTime} de leitura</span>
          <span>·</span>
          <span>Publicado em {formatDatePt(post.date)}</span>
          <span className="ml-auto flex items-center gap-2">
            <ShareLink
              url={`https://viral.kaleidos.com.br/blog/${post.slug}`}
              title={post.title}
            />
          </span>
        </div>
      </header>

      {/* ── COVER ──────────────────────────────────────────────── */}
      <ArticleCover
        title={post.title}
        number={number}
        tint={tint}
        category={post.category}
      />

      {/* ── BODY ───────────────────────────────────────────────── */}
      <article className="mx-auto max-w-[720px] px-6 py-16 md:py-24">
        <div className="sv-article-body">{renderContent(post.content)}</div>

        {/* Mid-article CTA is injected automatically via renderContent at middle heading.
            Fallback: also put a final CTA. */}

        {/* ── FINAL CTA ──────────────────────────────────────── */}
        <div
          className="mt-14 p-8 md:p-10"
          style={{
            background: "var(--sv-ink)",
            color: "var(--sv-paper)",
            border: "1.5px solid var(--sv-ink)",
            boxShadow: "6px 6px 0 0 var(--sv-green)",
          }}
        >
          <div
            className="mb-4"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--sv-green)",
            }}
          >
            · Pra botar em prática
          </div>
          <h3
            className="sv-display"
            style={{
              fontSize: "clamp(26px, 3.5vw, 40px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "var(--sv-paper)",
            }}
          >
            Da leitura pro feed em 60 segundos.
          </h3>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--sv-display-alt)",
              fontSize: 17,
              lineHeight: 1.55,
              color: "color-mix(in srgb, var(--sv-paper) 75%, transparent)",
              maxWidth: "52ch",
            }}
          >
            Cola um link, a IA escreve no seu tom, monta os slides e entrega
            pronto pra postar. Grátis, sem cartão, sem enrolação.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
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
                boxShadow: "3px 3px 0 0 var(--sv-pink)",
              }}
            >
              Ver como funciona
            </Link>
          </div>
        </div>
      </article>

      {/* ── RELATED ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t"
          style={{ borderColor: "var(--sv-ink)" }}
        >
          <div className="mx-auto max-w-[1240px] px-6 py-16">
            <div className="mb-8 flex items-center gap-3">
              <span
                style={{ width: 34, height: 1.5, background: "var(--sv-ink)" }}
              />
              <span
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                Continue lendo
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                  <article
                    className="sv-card h-full"
                    style={{ padding: 20 }}
                  >
                    <div
                      className="mb-3 flex items-center gap-2"
                      style={{
                        fontFamily: "var(--sv-mono)",
                        fontSize: 9.5,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--sv-muted)",
                      }}
                    >
                      <span style={{ color: "var(--sv-ink)" }}>
                        Nº{String(r.number ?? 0).padStart(2, "0")}
                      </span>
                      <span>·</span>
                      <span>{r.category}</span>
                    </div>
                    <h4
                      className="sv-display transition-colors group-hover:text-[var(--sv-pink)]"
                      style={{
                        fontSize: 22,
                        lineHeight: 1.08,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {r.title}
                    </h4>
                    <p
                      className="mt-3"
                      style={{
                        fontFamily: "var(--sv-sans)",
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "var(--sv-muted)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {r.excerpt}
                    </p>
                    <div
                      className="mt-5 flex items-center justify-between pt-3"
                      style={{
                        borderTop:
                          "1px solid color-mix(in srgb, var(--sv-ink) 18%, transparent)",
                        fontFamily: "var(--sv-mono)",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--sv-muted)",
                      }}
                    >
                      <span>{formatDatePt(r.date)}</span>
                      <span>{r.readTime}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/blog" className="sv-btn sv-btn-outline">
                Ver todas as edições →
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* ── TYPOGRAPHY ───────────────────────────────────────────────
          Escopo local ao artigo. Prose editorial premium: serif p/ body,
          display p/ heads, mono p/ kickers. Largura ~720px, fz 19px,
          line-height 1.7, espaçamento generoso entre parágrafos.
      ──────────────────────────────────────────────────────────── */}
      <style>{`
        .sv-article-body {
          font-family: var(--sv-display-alt), Georgia, serif;
          color: var(--sv-ink);
          font-size: 19px;
          line-height: 1.7;
          letter-spacing: -0.003em;
        }
        .sv-article-body p {
          margin: 0 0 1.4em;
        }
        .sv-article-body > p:first-of-type {
          font-size: 22px;
          line-height: 1.55;
          color: var(--sv-ink);
          font-weight: 400;
        }
        .sv-article-body > p:first-of-type::first-letter {
          font-family: var(--sv-display), serif;
          font-size: 4.2em;
          float: left;
          line-height: 0.82;
          margin: 0.08em 0.12em 0 -0.05em;
          color: var(--sv-ink);
          font-style: italic;
          font-weight: 400;
        }
        .sv-article-body h2 {
          font-family: var(--sv-display), serif;
          font-size: clamp(28px, 3.6vw, 40px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin: 2.4em 0 0.7em;
          color: var(--sv-ink);
          font-weight: 400;
        }
        .sv-article-body h2::before {
          content: "——";
          display: block;
          font-family: var(--sv-mono);
          font-size: 14px;
          letter-spacing: 0.1em;
          color: var(--sv-pink);
          margin-bottom: 0.4em;
        }
        .sv-article-body h3 {
          font-family: var(--sv-display), serif;
          font-style: italic;
          font-size: clamp(22px, 2.6vw, 28px);
          line-height: 1.15;
          letter-spacing: -0.018em;
          margin: 1.9em 0 0.5em;
          color: var(--sv-ink);
          font-weight: 400;
        }
        .sv-article-body strong {
          color: var(--sv-ink);
          font-weight: 600;
          background: linear-gradient(
            180deg,
            transparent 0%,
            transparent 60%,
            var(--sv-green) 60%,
            var(--sv-green) 95%,
            transparent 95%
          );
          padding: 0 2px;
        }
        .sv-article-body ul {
          margin: 0.4em 0 1.6em;
          padding: 0;
          list-style: none;
        }
        .sv-article-body li {
          position: relative;
          padding-left: 26px;
          margin-bottom: 0.6em;
          font-size: 19px;
          line-height: 1.6;
        }
        .sv-article-body li::before {
          content: "→";
          position: absolute;
          left: 0;
          top: 0;
          color: var(--sv-pink);
          font-family: var(--sv-mono);
          font-weight: 700;
          font-size: 15px;
          line-height: 1.7;
        }
        .sv-article-body li strong {
          background: none;
          padding: 0;
          color: var(--sv-ink);
        }
        .sv-article-body blockquote {
          position: relative;
          margin: 2em 0;
          padding: 1.6em 0 1.6em 2em;
          border-left: 4px solid var(--sv-pink);
          font-family: var(--sv-display), serif;
          font-style: italic;
          font-size: clamp(22px, 2.4vw, 28px);
          line-height: 1.3;
          letter-spacing: -0.015em;
          color: var(--sv-ink);
        }
        .sv-article-body blockquote::before {
          content: "“";
          position: absolute;
          top: -0.25em;
          left: 0.2em;
          font-family: var(--sv-display), serif;
          font-size: 5em;
          color: var(--sv-pink);
          opacity: 0.3;
          line-height: 1;
        }
        .sv-article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
          font-family: var(--sv-sans);
          font-size: 15px;
          line-height: 1.5;
        }
        .sv-article-body thead tr {
          background: var(--sv-ink);
          color: var(--sv-paper);
        }
        .sv-article-body th {
          text-align: left;
          padding: 12px 14px;
          font-family: var(--sv-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .sv-article-body td {
          padding: 12px 14px;
          border-bottom: 1px solid
            color-mix(in srgb, var(--sv-ink) 14%, transparent);
          color: var(--sv-ink);
        }
        .sv-article-body tr:last-child td {
          border-bottom: none;
        }
        .sv-article-inline-cta {
          display: block;
          margin: 2.6em 0;
          padding: 28px;
          background: var(--sv-green);
          border: 1.5px solid var(--sv-ink);
          box-shadow: 4px 4px 0 0 var(--sv-ink);
          color: var(--sv-ink);
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sv-article-inline-cta:hover {
          transform: translate(-1px, -1px);
          box-shadow: 6px 6px 0 0 var(--sv-ink);
        }
        .sv-article-inline-cta .kicker {
          font-family: var(--sv-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .sv-article-inline-cta .t {
          font-family: var(--sv-display);
          font-size: 24px;
          font-style: italic;
          line-height: 1.15;
          letter-spacing: -0.015em;
          display: block;
        }
        .sv-article-inline-cta .a {
          margin-top: 10px;
          font-family: var(--sv-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          display: inline-block;
          border-bottom: 2px solid var(--sv-ink);
          padding-bottom: 2px;
        }
        @media (max-width: 640px) {
          .sv-article-body {
            font-size: 17.5px;
          }
          .sv-article-body > p:first-of-type {
            font-size: 19.5px;
          }
          .sv-article-body > p:first-of-type::first-letter {
            font-size: 3.4em;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────── SHARE LINK ─────────────────── */

function ShareLink({ url, title }: { url: string; title: string }) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`;
  return (
    <span className="flex items-center gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--sv-ink)",
          borderBottom: "1px solid var(--sv-ink)",
          paddingBottom: 1,
        }}
      >
        X
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--sv-ink)",
          borderBottom: "1px solid var(--sv-ink)",
          paddingBottom: 1,
        }}
      >
        LinkedIn
      </a>
    </span>
  );
}

/* ─────────────────── MARKDOWN-LITE RENDERER ─────────────────── */
/*
 * Renderiza um subset de markdown:
 *   - # H1 / ## H2 / ### H3
 *   - **bold**
 *   - - item de lista / - **negrito** resto
 *   - | col | col | tabelas com separador
 *   - parágrafos
 *   - "> quote" para blockquote
 *   - linha vazia quebra parágrafo
 * Injeta um CTA inline depois do 4º heading H2 (meio do artigo).
 */

function inlineFmt(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: "0.9em",
            background: "var(--sv-soft)",
            padding: "2px 6px",
            border: "1px solid color-mix(in srgb, var(--sv-ink) 15%, transparent)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let h2Count = 0;
  let ctaInjected = false;

  // List buffering
  let listBuf: React.ReactNode[] = [];
  const flushList = () => {
    if (listBuf.length > 0) {
      elements.push(<ul key={`list-${elements.length}`}>{listBuf}</ul>);
      listBuf = [];
    }
  };

  // Table buffering
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  const flushTable = () => {
    if (tableHeader.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                {tableHeader.map((cell, i) => (
                  <th key={i}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{inlineFmt(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }
    inTable = false;
    tableHeader = [];
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Table
    if (line.startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => c.trim());
      if (!inTable) {
        flushList();
        inTable = true;
        tableHeader = cells;
        continue;
      }
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`}>{inlineFmt(line.replace("### ", ""))}</h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      h2Count++;
      elements.push(
        <h2 key={`h2-${i}`}>{inlineFmt(line.replace("## ", ""))}</h2>,
      );
      // Injetar CTA inline na metade do artigo (após 3º H2)
      if (h2Count === 3 && !ctaInjected) {
        ctaInjected = true;
        elements.push(
          <Link
            key={`cta-mid-${i}`}
            href="/app/signup"
            className="sv-article-inline-cta"
          >
            <span className="kicker">· Sequência Viral</span>
            <span className="t">
              Cola um link. Publica um carrossel. Em minutos, não em horas.
            </span>
            <span className="a">Criar grátis →</span>
          </Link>,
        );
      }
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={`h1-${i}`}>{inlineFmt(line.replace("# ", ""))}</h2>,
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`}>
          {inlineFmt(line.replace("> ", ""))}
        </blockquote>,
      );
      continue;
    }

    // List
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const item = line.replace(/^[-*]\s+/, "");
      listBuf.push(<li key={`li-${i}`}>{inlineFmt(item)}</li>);
      continue;
    }

    // Numbered list — render as regular li
    const numMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      listBuf.push(<li key={`li-${i}`}>{inlineFmt(numMatch[1])}</li>);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    elements.push(<p key={`p-${i}`}>{inlineFmt(line)}</p>);
  }

  flushList();
  if (inTable) flushTable();

  return elements;
}

