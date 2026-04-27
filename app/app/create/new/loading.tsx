/**
 * Loading skeleton da tela "Criar novo carrossel".
 *
 * Mostrado enquanto o Next compila a rota dinâmica. A geração em si
 * (que demora 30-60s no Anthropic/Gemini) tem seu próprio overlay
 * dentro do componente cliente.
 */
export default function NewCarouselLoading() {
  return (
    <div
      className="px-6 py-10"
      style={{ background: "var(--background, #FFFDF9)", minHeight: "80vh" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 h-3 w-32 animate-pulse rounded bg-[#0A0A0A]/8" />
        <div className="mb-8 h-10 w-2/3 animate-pulse rounded bg-[#0A0A0A]/12" />

        <div className="mb-8 h-44 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-white" />

        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border-2 border-[#0A0A0A]/10 bg-white"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <div className="h-12 w-44 animate-pulse rounded-xl border-2 border-[#0A0A0A]/15 bg-[#0A0A0A]/5" />
        </div>

        <span className="sr-only">Carregando editor…</span>
      </div>
    </div>
  );
}
