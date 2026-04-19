-- ──────────────────────────────────────────────────────────────────
-- Migration: adicionar coluna brand_analysis na tabela profiles.
-- O schema.sql já declara a coluna, mas bancos em produção que foram
-- criados antes dessa adição não têm a coluna. Aplica idempotente.
-- ──────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists brand_analysis jsonb default null;
