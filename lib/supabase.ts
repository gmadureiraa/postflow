import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !key) {
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] Client is null — missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "All Supabase operations will be skipped. Auth, saves, and profile updates will not work."
    );
  }
}

/**
 * Singleton do client do browser.
 *
 * Guardado em `globalThis` para sobreviver ao HMR do Next em dev e para não
 * criar mais de uma instância por página. Duas instâncias disputando o mesmo
 * localStorage causam logout aleatório.
 *
 * IMPORTANTE: não customizar `auth.storageKey` ou `flowType` aqui — sessões
 * antigas já estão no key padrão do Supabase, mudar isso invalida o login
 * de todos os usuários existentes.
 */
type GlobalWithSb = typeof globalThis & {
  __svSupabase?: SupabaseClient | null;
};
const g = globalThis as GlobalWithSb;

export const supabase: SupabaseClient | null =
  g.__svSupabase !== undefined
    ? g.__svSupabase
    : (g.__svSupabase = url && key ? createClient(url, key) : null);
