-- 20260418120000_coupons_and_indexes.sql
-- Adiciona tabela `coupons`, índices de performance e integra com checkout.
-- Seguro para rodar várias vezes (IF NOT EXISTS em tudo).

-- ============================================================
-- COUPONS
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_pct int check (discount_pct is null or (discount_pct between 1 and 100)),
  discount_amount_cents int check (discount_amount_cents is null or discount_amount_cents > 0),
  currency text default 'USD',
  max_uses int,                 -- null = ilimitado
  used_count int default 0,
  expires_at timestamptz,       -- null = não expira
  active boolean default true,
  plan_scope text[] default '{}', -- vazio = válido para qualquer plano; senão restringe (ex: '{pro}')
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint coupons_discount_xor
    check (
      (discount_pct is not null and discount_amount_cents is null) or
      (discount_pct is null and discount_amount_cents is not null)
    )
);

create index if not exists idx_coupons_code_lower on public.coupons ((lower(code)));
create index if not exists idx_coupons_active on public.coupons(active);
create index if not exists idx_coupons_expires_at on public.coupons(expires_at);

-- RLS: somente service role escreve; usuários autenticados podem ler via SELECT
-- (API valida server-side antes de aplicar — policy aqui é só fail-safe).
alter table public.coupons enable row level security;

drop policy if exists "Anyone can read active coupons" on public.coupons;
create policy "Anyone can read active coupons"
  on public.coupons for select
  using (active = true);

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at
  before update on public.coupons
  for each row execute function public.update_updated_at();

-- ============================================================
-- COUPON REDEMPTIONS (auditoria de uso)
-- ============================================================
create table if not exists public.coupon_redemptions (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid references public.coupons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  code text not null,
  discount_pct int,
  discount_amount_cents int,
  stripe_session_id text,
  created_at timestamptz default now()
);

create index if not exists idx_coupon_redemptions_coupon on public.coupon_redemptions(coupon_id);
create index if not exists idx_coupon_redemptions_user on public.coupon_redemptions(user_id);

alter table public.coupon_redemptions enable row level security;

drop policy if exists "Users can view own redemptions" on public.coupon_redemptions;
create policy "Users can view own redemptions"
  on public.coupon_redemptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- RPC: increment_coupon_use — atomic para evitar double-use.
-- Retorna true se incrementou (uso válido), false se esgotou.
-- ============================================================
create or replace function public.increment_coupon_use(coupon_id uuid)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  _row public.coupons%rowtype;
begin
  update public.coupons
    set used_count = used_count + 1,
        updated_at = now()
    where id = coupon_id
      and active = true
      and (expires_at is null or expires_at > now())
      and (max_uses is null or used_count < max_uses)
    returning * into _row;
  if not found then
    return false;
  end if;
  return true;
end;
$$;

-- ============================================================
-- ÍNDICES ADICIONAIS (PLAN 4.2)
-- ============================================================
-- carousels(user_id, status) já existe no schema base; reforça idempotência.
create index if not exists idx_carousels_user_status on public.carousels(user_id, status);
create index if not exists idx_carousels_updated_at on public.carousels(updated_at desc);
create index if not exists idx_generations_user_created on public.generations(user_id, created_at desc);
create index if not exists idx_payments_user_status on public.payments(user_id, status);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

-- ============================================================
-- SEED: cupom BETA50 (50% off primeiro mês)
-- Idempotente — só insere se ainda não existe.
-- ============================================================
insert into public.coupons (code, discount_pct, max_uses, expires_at, notes)
values ('BETA50', 50, 100, '2026-06-30 23:59:59+00', 'Cupom beta de lançamento — 50% off primeiro mês')
on conflict (code) do nothing;
