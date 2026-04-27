/**
 * Loading skeleton do picker de template — 6 cards em grade.
 */
export default function TemplatesLoading() {
  return (
    <div
      className="px-6 py-10"
      style={{ background: "var(--background, #FFFDF9)", minHeight: "80vh" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-4 w-28 animate-pulse rounded bg-[#0A0A0A]/8" />
        <div className="mb-8 h-10 w-2/3 animate-pulse rounded bg-[#0A0A0A]/12" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
        <span className="sr-only">Carregando templates…</span>
      </div>
    </div>
  );
}
