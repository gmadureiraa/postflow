/**
 * @deprecated — Este endpoint foi descontinuado em 2026-04-19.
 *
 * O fluxo multietapa (triagem → headlines → backbone → render) nunca foi
 * plugado na UI. O produto usa /api/generate direto (v1) com a melhoria de
 * feedback loop + 12 hook archetypes + escada narrativa.
 *
 * Mantido por retrocompat com clients antigos. Qualquer chamada retorna 410.
 */

export async function POST(): Promise<Response> {
  return Response.json(
    {
      error:
        "Endpoint deprecated. Use /api/generate (single-step) ou /api/generate-concepts + /api/generate.",
      deprecated_since: "2026-04-19",
    },
    { status: 410 }
  );
}
