-- ──────────────────────────────────────────────────────────────────
-- SEED: cupom BEMVINDO30 (30% off primeiro pagamento)
-- Associado ao popup de boas-vindas na landing. Max 10.000 usos pra
-- não virar cupom eterno. Expira em 90 dias da criação (ajuste manual
-- depois se precisar estender).
-- ──────────────────────────────────────────────────────────────────

insert into public.coupons (code, discount_pct, max_uses, expires_at, notes)
values (
  'BEMVINDO30',
  30,
  10000,
  '2026-07-31 23:59:59+00',
  '30% off primeiro pagamento — popup welcome na landing'
)
on conflict (code) do nothing;
