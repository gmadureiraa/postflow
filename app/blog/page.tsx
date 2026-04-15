import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | PostFlow — Dicas de Carrossel, IA e Redes Sociais",
  description:
    "Aprenda a criar carrosseis virais, usar IA para conteudo e dominar Instagram, Twitter e LinkedIn. Dicas praticas do blog PostFlow.",
  alternates: {
    canonical: "https://postflow.app/blog",
  },
  openGraph: {
    title: "Blog | PostFlow — Dicas de Carrossel, IA e Redes Sociais",
    description:
      "Aprenda a criar carrosseis virais, usar IA para conteudo e dominar Instagram, Twitter e LinkedIn.",
    type: "website",
    url: "https://postflow.app/blog",
  },
};

const posts = [
  {
    slug: "como-criar-carrosseis-virais-instagram-2026",
    title: "Como Criar Carrosseis Virais no Instagram em 2026",
    excerpt:
      "Descubra as estrategias que os maiores criadores de conteudo usam para criar carrosseis que viralizam no Instagram.",
    date: "2026-04-10",
    readTime: "7 min",
    category: "Instagram",
  },
  {
    slug: "5-formatos-carrossel-mais-engajamento",
    title: "5 Formatos de Carrossel que Geram Mais Engajamento",
    excerpt:
      "Nem todo carrossel e igual. Conhea os 5 formatos que consistentemente geram mais curtidas, comentarios e compartilhamentos.",
    date: "2026-04-08",
    readTime: "6 min",
    category: "Estrategia",
  },
  {
    slug: "thread-vs-carrossel-qual-funciona-melhor",
    title: "Thread vs Carrossel: Qual Funciona Melhor?",
    excerpt:
      "Threads no Twitter/X ou carrosseis no Instagram? Analisamos dados reais para responder essa pergunta de uma vez.",
    date: "2026-04-05",
    readTime: "8 min",
    category: "Analise",
  },
  {
    slug: "como-usar-ia-criar-conteudo-redes-sociais",
    title: "Como Usar IA para Criar Conteudo de Redes Sociais",
    excerpt:
      "Um guia pratico de como integrar inteligencia artificial no seu fluxo de producao de conteudo sem perder autenticidade.",
    date: "2026-04-02",
    readTime: "9 min",
    category: "IA",
  },
  {
    slug: "guia-completo-tamanhos-instagram-twitter-linkedin",
    title:
      "O Guia Completo de Tamanhos para Instagram, Twitter e LinkedIn",
    excerpt:
      "Todos os tamanhos de imagem e video atualizados para 2026. Salve este guia e nunca mais erre uma dimensao.",
    date: "2026-03-28",
    readTime: "5 min",
    category: "Referencia",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-[family-name:var(--font-serif)] text-xl tracking-tight"
          >
            PostFlow
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Voltar ao site
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl">
          Dicas praticas sobre carrosseis, IA e criacao de conteudo para redes
          sociais.
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-[var(--border)] pb-8"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-[var(--accent)] bg-purple-50 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {post.date}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {post.readTime} de leitura
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-serif)] text-2xl tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h2>
                <p className="text-[var(--muted)] leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} PostFlow. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
