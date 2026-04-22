-- Cache tematico de imagens geradas/pesquisadas.
-- Chave sha256(mode::normalized_query). Reusa imagens geradas recentemente
-- quando outro slide/carrossel pede o mesmo tema, evitando gasto duplicado
-- de Imagen/Serper. TTL 7d (lido em lib/server/image-strategy.ts).

create table if not exists public.image_theme_cache (
  id          uuid primary key default gen_random_uuid(),
  theme_key   text not null,
  query_text  text not null,
  mode        text not null check (mode in ('generate', 'search')),
  url         text not null,
  created_at  timestamptz not null default now()
);

create index if not exists image_theme_cache_key_idx
  on public.image_theme_cache (theme_key, created_at desc);

-- RLS: service role bypassa. Users normais nao leem/escrevem direto
-- (so via /api/images backend).
alter table public.image_theme_cache enable row level security;

-- Sem policies = bloqueia anon/auth direto. Service role (usado em
-- /api/images) passa pelo RLS bypass via service-role key.

comment on table public.image_theme_cache is
  'Cache global de imagens por tema (hash sha256 da query). TTL 7d. Economiza custo de Imagen/Serper ao reusar entre slides e carrosseis.';
