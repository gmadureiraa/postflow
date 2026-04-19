import { redirect } from "next/navigation";

/**
 * V1 legado — redireciona pra v2 (`/app/create/new`).
 * O fluxo unificado vive em `/app/create/new` → `/concepts` → `/templates`
 * → `/[id]/edit` → `/[id]/preview`. A UI antiga com "Nº de slides" e
 * "CTA final" foi aposentada.
 */
export default function CreateLegacyRedirect(): never {
  redirect("/app/create/new");
}
