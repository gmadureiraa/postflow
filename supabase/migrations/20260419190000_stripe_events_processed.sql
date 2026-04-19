-- ──────────────────────────────────────────────────────────────────
-- Tabela de dedup do Stripe webhook.
-- Stripe faz retry agressivo de webhooks falhados. Sem dedup, o mesmo
-- event.id roda N vezes e gera N emails/N payments INSERT. Audit de
-- emails pegou isso: spammava payment-failed a cada retry.
--
-- Uso: no handler, tenta INSERT do event.id. Se der conflito (ON CONFLICT
-- DO NOTHING retornar 0 rows afetados), já foi processado — skip.
-- ──────────────────────────────────────────────────────────────────

create table if not exists public.stripe_events_processed (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz default now()
);

create index if not exists idx_stripe_events_received
  on public.stripe_events_processed(received_at desc);

-- RLS não importa — só service role escreve/lê. Habilitar mesmo assim
-- pra seguir o padrão de security hardening.
alter table public.stripe_events_processed enable row level security;
