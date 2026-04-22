/**
 * Estrategia de imagens por slide — decide quem recebe imagem, com qual
 * tecnologia (Imagen vs Serper), e faz lookup de cache tematico.
 *
 * Regra (2026-04-22):
 *  - Slide 0 (CAPA): SEMPRE Imagen 4 (cover-scene 2-pass). Cover = cinema.
 *  - Slides internos (1..N-2): so METADE recebe imagem. Alternancia:
 *      - index impar → recebe imagem via Serper (busca stock, $0.008)
 *      - index par (exceto 0) → recebe imagem via Imagen (geracao, $0.04)
 *      - os restantes → sem imagem (layout text-only)
 *  - Slide final (CTA, index N-1): SEM imagem (layout CTA costuma ser
 *    texto + accent color pra destacar a chamada).
 *
 * Por que metade + mix:
 *  - 6 slides com Imagen em todos = $0.24 por carrossel.
 *  - 3 com Imagen + 2 Serper + 1 capa Imagen = $0.04×4 + $0.008×2 = $0.176
 *  - Metade com imagem (3 de 6): $0.04×2 (capa + 1 inner) + $0.008×1 (serper) = $0.096 → 60% de economia
 *
 * Cache tematico:
 *  - Hash da query/theme (sha256, 24 chars) indexa a tabela image_theme_cache
 *  - Antes de chamar Imagen/Serper, consulta cache. Se hit recente (<7d),
 *    retorna URL existente e nao gasta API call.
 *  - TTL 7d pra refrescar visual sem perder economia.
 */

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ImageAction = {
  slideIndex: number;
  /** "skip" = nao gera imagem, layout text-only. */
  mode: "generate" | "search" | "skip";
  /** Flag pro prompt Imagen ativar pipeline 2-pass cinematografico. */
  isCover: boolean;
  /** Razao da decisao — util pra log/debug. */
  reason: string;
};

export function planSlideImages(totalSlides: number): ImageAction[] {
  const actions: ImageAction[] = [];
  for (let i = 0; i < totalSlides; i++) {
    const isCover = i === 0;
    const isCta = i === totalSlides - 1 && totalSlides > 1;

    if (isCover) {
      actions.push({
        slideIndex: i,
        mode: "generate",
        isCover: true,
        reason: "cover-always-generated",
      });
      continue;
    }
    if (isCta) {
      actions.push({
        slideIndex: i,
        mode: "skip",
        isCover: false,
        reason: "cta-text-only",
      });
      continue;
    }

    // Internos: alternar entre skip / generate / search. Metade dos slides
    // internos recebem imagem, com mix 50/50 imagen/serper.
    const innerPos = i - 1; // 0-indexed entre os internos
    if (innerPos % 2 === 0) {
      // pares (pos 0, 2, 4) → sem imagem (skip)
      actions.push({
        slideIndex: i,
        mode: "skip",
        isCover: false,
        reason: "alt-half-skip",
      });
    } else {
      // impares (pos 1, 3, 5) → com imagem, alternando fonte
      const useImagen = Math.floor(innerPos / 2) % 2 === 0;
      actions.push({
        slideIndex: i,
        mode: useImagen ? "generate" : "search",
        isCover: false,
        reason: useImagen ? "alt-half-imagen" : "alt-half-serper",
      });
    }
  }
  return actions;
}

// ──────────────────────────────────────────────────────────────────────────
// Cache tematico
// ──────────────────────────────────────────────────────────────────────────

const CACHE_TABLE = "image_theme_cache";
const CACHE_TTL_DAYS = 7;

function themeHash(query: string, mode: "generate" | "search"): string {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 300);
  return createHash("sha256")
    .update(`${mode}::${normalized}`)
    .digest("hex")
    .slice(0, 32);
}

export async function getCachedThemeImage(
  supabase: SupabaseClient,
  query: string,
  mode: "generate" | "search"
): Promise<string | null> {
  if (!query.trim()) return null;
  const key = themeHash(query, mode);
  const cutoff = new Date(
    Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  try {
    const { data } = await supabase
      .from(CACHE_TABLE)
      .select("url, created_at")
      .eq("theme_key", key)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.url ?? null;
  } catch {
    return null;
  }
}

export async function recordThemeImage(
  supabase: SupabaseClient,
  query: string,
  mode: "generate" | "search",
  url: string
): Promise<void> {
  if (!query.trim() || !url) return;
  const key = themeHash(query, mode);
  try {
    await supabase.from(CACHE_TABLE).insert({
      theme_key: key,
      query_text: query.slice(0, 300),
      mode,
      url,
    });
  } catch {
    /* cache e best-effort — falha nao quebra fluxo */
  }
}
