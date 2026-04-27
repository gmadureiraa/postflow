/**
 * Loading skeleton da tela de preview/export — compõe a grade tipica
 * de cards de slide pra evitar layout shift quando o snapshot real
 * é renderizado.
 */
export default function PreviewLoading() {
  return (
    <div
      className="px-6 py-8"
      style={{ background: "var(--background, #FFFDF9)", minHeight: "80vh" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-56 animate-pulse rounded bg-[#0A0A0A]/10" />
          <div className="flex gap-2">
            <div className="h-10 w-32 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-[#0A0A0A]/5" />
            <div className="h-10 w-32 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-[#0A0A0A]/5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        <span className="sr-only">Renderizando preview…</span>
      </div>
    </div>
  );
}
