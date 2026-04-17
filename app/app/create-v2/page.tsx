import { redirect } from "next/navigation";

/** Carrossel 2.0 / Content Machine foi unificado em `/app/create` (modo guiado + template visual). */
export default function CreateV2RedirectPage() {
  redirect("/app/create");
}
