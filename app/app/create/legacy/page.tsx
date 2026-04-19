import { redirect } from "next/navigation";

/**
 * LEGADO v1 — removido do bundle. Esse redirect mantém o path `/legacy`
 * acessível (pra não quebrar eventuais links antigos), mas qualquer acesso
 * vai direto pro fluxo ativo `/app/create/new`. A estrutura original ficou
 * preservada no histórico git (commit 19d2e9f e anteriores) pra referência.
 */
export default function CreateLegacyRedirect(): never {
  redirect("/app/create/new");
}
