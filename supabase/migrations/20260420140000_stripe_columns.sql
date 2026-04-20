-- ============================================================
-- PROFILES: garante colunas Stripe (stripe_customer_id, stripe_subscription_id)
-- ============================================================
-- Essas colunas estão em supabase/schema.sql (init) mas o DB em produção
-- foi criado via migrations incrementais e nunca ganhou essas colunas.
-- Resultado: /api/admin/stats falhava com
--   "column profiles.stripe_customer_id does not exist"
-- e o painel admin vinha com profiles=[] (nenhum user listado).
--
-- Idempotente — só adiciona se não existir.
-- ============================================================

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists stripe_subscription_id text;

-- Índice opcional pra lookup por customer_id (usado no webhook Stripe).
create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id)
  where stripe_customer_id is not null;
