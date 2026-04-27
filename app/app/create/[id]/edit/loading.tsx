/**
 * Loading skeleton do editor de carrossel — mostra dois painéis
 * (lista de slides + preview central) pra alinhar com o layout final
 * e evitar shift visual quando os slides chegam.
 */
export default function EditLoading() {
  return (
    <div
      className="px-6 py-8"
      style={{ background: "var(--background, #FFFDF9)", minHeight: "85vh" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-[#0A0A0A]/10" />
          <div className="h-10 w-32 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-[#0A0A0A]/5" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_320px]">
          {/* Slides list */}
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
          {/* Preview central */}
          <div className="aspect-[4/5] w-full max-w-[480px] mx-auto animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-white" />
          {/* Inspector */}
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        </div>
        <span className="sr-only">Carregando editor de slides…</span>
      </div>
    </div>
  );
}
