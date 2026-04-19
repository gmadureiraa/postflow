-- ──────────────────────────────────────────────────────────────────
-- Migration: imagens de referência visual da marca.
-- Até 3 URLs (Supabase Storage ou externas) que ditam a estética usada
-- pela geração Imagen 4 em /api/images. A descrição destilada dessas
-- imagens fica em profiles.brand_analysis.__image_aesthetic (sidecar),
-- pra não precisar de migration separada só pro texto.
-- ──────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists brand_image_refs jsonb default '[]'::jsonb;
