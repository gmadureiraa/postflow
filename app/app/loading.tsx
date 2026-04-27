/**
 * Loading skeleton padrão pra área logada (`/app/*`).
 *
 * Evita flash de layout vazio enquanto o RSC server resolve. Visual
 * alinha com card-soft / brutalist editorial — bordas pretas + shadow.
 */
export default function AppLoading() {
  return (
    <div
      className="px-6 py-10"
      style={{
        background: "var(--background, #FFFDF9)",
        minHeight: "70vh",
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 h-3 w-24 animate-pulse rounded bg-[#0A0A0A]/8" />
            <div className="h-9 w-72 animate-pulse rounded bg-[#0A0A0A]/12" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-[#0A0A0A]/5" />
        </div>

        {/* Stat tiles */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Section title */}
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-[#0A0A0A]/10" />

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        <span className="sr-only">Carregando…</span>
      </div>
    </div>
  );
}
