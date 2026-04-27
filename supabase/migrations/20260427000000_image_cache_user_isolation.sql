-- Isolamento de cache de imagens por usuario.
--
-- Contexto: a tabela image_theme_cache usava theme_key = sha256(mode::query),
-- sem user_id na chave. Isso permitia que User A gerasse "bitcoin chart" e
-- User B com a mesma query recebesse a imagem cacheada do A (30 dias).
--
-- Fix: adicionar coluna user_id. A logica de cache em lib/server/image-strategy.ts
-- agora usa sha256(userId::mode::query) como chave, garantindo isolamento.
--
-- Registros antigos (sem user_id): ficam como orphans com user_id = NULL.
-- Nao precisam ser deletados — expiram naturalmente via TTL 30d (created_at).
-- A nova logica nunca retorna esses registros pois a theme_key nao vai bater.

alter table public.image_theme_cache
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Indice para consultas filtradas por user — performance nas buscas de cache.
create index if not exists image_theme_cache_user_key_idx
  on public.image_theme_cache (user_id, theme_key, created_at desc);

comment on column public.image_theme_cache.user_id is
  'ID do usuario dono do cache. NULL = registros antigos (pre-isolamento). Novos registros sempre tem user_id preenchido.';
