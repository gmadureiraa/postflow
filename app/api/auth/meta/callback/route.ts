/**
 * GET /api/auth/meta/callback
 *
 * Endpoint de callback do Facebook Login. No fluxo atual do SV usamos o JS
 * SDK (client-side), entao esse callback nao e hit no dia-a-dia. Mas o
 * Meta exige que a URL exista e retorne 200 quando cadastrada na config do
 * app ("Autorizar URL de retorno de chamada") — e serve de fallback pra
 * quem preferir OAuth server-side futuramente.
 *
 * Comportamento: loga o query params (code/error/state) e redireciona o
 * user de volta pro onboarding.
 */

export const runtime = "nodejs";
export const maxDuration = 5;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error_description");

  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://viral.kaleidos.com.br";
  const redirect = new URL("/app/onboarding", base);
  if (error) {
    redirect.searchParams.set("meta_error", error.slice(0, 120));
  }
  return Response.redirect(redirect.toString(), 302);
}
