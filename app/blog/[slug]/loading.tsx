/**
 * Loading do artigo de blog — placeholder de capa + parágrafos.
 */
export default function BlogPostLoading() {
  return (
    <main
      className="px-6 py-12"
      style={{
        background: "var(--sv-paper, #FFFDF9)",
        color: "var(--sv-ink, #0A0A0A)",
        minHeight: "70vh",
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <article className="mx-auto max-w-2xl">
        <div className="mb-3 h-3 w-32 animate-pulse rounded bg-[#0A0A0A]/8" />
        <div className="mb-6 h-12 w-full animate-pulse rounded bg-[#0A0A0A]/12" />
        <div className="mb-8 h-3 w-40 animate-pulse rounded bg-[#0A0A0A]/8" />
        <div className="mb-10 h-64 animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-[#0A0A0A]/8"
              style={{
                width: `${85 - (i % 4) * 8}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
        <span className="sr-only">Carregando artigo…</span>
      </article>
    </main>
  );
}
