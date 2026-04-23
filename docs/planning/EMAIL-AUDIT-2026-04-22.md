# Email Audit — Sequência Viral

Data: 2026-04-22
Provider: Resend (`lib/email/send.ts`)
From default: `Sequência Viral <onboarding@resend.dev>` (override via `EMAIL_FROM`)
Tags globais: `project:sequencia-viral`, `env:prod|dev`, `lifecycle:<slug>`

Total mapeado: 10 emails transacionais + lifecycle. Todos idempotentes via
flag em `profiles.brand_analysis.__lifecycle.<slug>_sent_at`.

---

## Emails configurados

### 1. Welcome — Dia 0
- **Template:** `lib/email/templates/welcome.tsx`
- **Dispatcher:** `sendWelcome()` em `lib/email/dispatch.ts:37`
- **Trigger:** `POST /api/email/welcome` chamado do client em `lib/auth-context.tsx:177` logo após signup confirmado. Rate-limit 3/hora.
- **Público:** todos os novos users (qualquer plano).
- **Assunto:** "Bem-vindo ao Sequência Viral — estúdio pronto"
- **CTA:** "Criar meu primeiro carrossel" → `/app/create`
- **Idempotência:** flag `welcome_sent_at`.
- **Funcional:** ✓ — trigger real, env var Resend checado, caminho bem testado.

### 2. Activation Nudge — D+2 a D+3 (sem 1ª geração)
- **Template:** `lib/email/templates/activation-nudge.tsx`
- **Dispatcher:** `sendActivationNudge()` em `dispatch.ts:46`
- **Trigger:** cron diário `GET /api/cron/activation-nudge` (schedule `0 15 * * *` em `vercel.json`). Busca `profiles` criados entre 48h-72h atrás com `usage_count = 0`.
- **Público:** users novos que ainda não geraram nenhum carrossel.
- **Assunto:** "Cola um link e sai com carrossel em 15s"
- **CTA:** "Colar link e gerar" → `/app/create`
- **Idempotência:** flag `activation_nudge_sent_at`.
- **Funcional:** ✓ — cron ativo, lógica idempotente.

### 3. First Carousel — evento imediato após 1ª geração
- **Template:** `lib/email/templates/first-carousel.tsx`
- **Dispatcher:** `sendFirstCarousel()` em `dispatch.ts:55`
- **Trigger:** `app/api/generate/route.ts:1377` após sucesso de geração. Só dispara se `lifecycle.first_carousel_sent_at` ausente.
- **Público:** users na 1ª geração bem-sucedida.
- **Assunto:** "Primeiro carrossel salvo 👌"
- **CTA:** "Abrir minha biblioteca" → `/app/carousels`
- **Idempotência:** flag `first_carousel_sent_at`.
- **Funcional:** ✓ — non-blocking try/catch, dispatcher lazy-import pra não aumentar cold-start.

### 4. Onboarding How It Works — D+1
- **Template:** `lib/email/templates/onboarding-how-it-works.tsx`
- **Dispatcher:** `sendOnboardingHowItWorks()` em `dispatch.ts:125`
- **Trigger:** cron diário `GET /api/cron/onboarding-drip` (schedule `0 14 * * *`), step `days: 1`.
- **Público:** todos users D+1 após signup.
- **Assunto:** "3 formas de gerar carrossel (escolhe a sua)"
- **CTA:** "Testar os 3 modos agora" → `/app/create/new`
- **Idempotência:** flag `onboarding_how_it_works_sent_at`.
- **Funcional:** ✓.

### 5. Onboarding First Case — D+3
- **Template:** `lib/email/templates/onboarding-first-case.tsx`
- **Dispatcher:** `sendOnboardingFirstCase()` em `dispatch.ts:135`
- **Trigger:** mesmo cron `onboarding-drip`, step `days: 3`.
- **Público:** todos users D+3 após signup.
- **Assunto:** "47 carrosséis em 1 semana (case real)"
- **CTA:** "Treinar a minha voz agora" → `/app/settings` (aba Voz IA)
- **Idempotência:** flag `onboarding_first_case_sent_at`.
- **Funcional:** ⚠ — copy cita "47 carrosséis em 1 semana · beta de IA creator". Case real não é verificável; se não for o Gabriel, considerar reescrever com número/nome honestos antes de marketing em escala. Mecanicamente: OK.

### 6. Onboarding Why Upgrade — D+7
- **Template:** `lib/email/templates/onboarding-why-upgrade.tsx`
- **Dispatcher:** `sendOnboardingWhyUpgrade()` em `dispatch.ts:145`
- **Trigger:** cron `onboarding-drip`, step `days: 7`.
- **Público:** todos users D+7 (não filtra plano — pagos também recebem).
- **Assunto:** "Vale upgrade pro Pro? Matemática honesta"
- **CTA:** "Ver planos e cupom de lançamento" → `/app/plans`
- **Idempotência:** flag `onboarding_why_upgrade_sent_at`.
- **Funcional:** ⚠ — NÃO filtra users que já assinaram antes do D+7. Pagos recebem pitch de upgrade. Bug pequeno. Ver "Issues".

### 7. Plan Limit Warning — ≥80% do ciclo
- **Template:** `lib/email/templates/plan-limit.tsx`
- **Dispatcher:** `sendPlanLimit()` em `dispatch.ts:88`
- **Trigger:** cron diário `GET /api/cron/plan-limit` (schedule `0 16 * * *`). Filtra `plan = free` e `usage_count / usage_limit >= 0.8`.
- **Público:** users free que atingiram ≥80% do limite mensal.
- **Assunto dinâmico:** "Você atingiu o limite do ciclo" (100%) ou "Faltam X carrosséis no seu plano" (80-99%).
- **CTA:** "Assinar Creator e continuar publicando" → `/app/checkout?plan=pro`
- **Idempotência:** flag `plan_limit_sent_at:YYYY-MM` (ressetada por ciclo mensal).
- **Funcional:** ✓ — cron idempotente por mês.

### 8. Re-Engagement — usuário ativo há 7+ dias sem gerar
- **Template:** `lib/email/templates/re-engagement.tsx`
- **Dispatcher:** `sendReEngagement()` em `dispatch.ts:108`
- **Trigger:** cron semanal (terça) `GET /api/cron/re-engagement` (schedule `0 17 * * 2`). Filtra users com `usage_count > 0` cuja última geração tem >7 dias e último re-engagement >45 dias (ou nunca).
- **Público:** ativados dormindo há 7+ dias.
- **Assunto:** "Cola 1 link, sai com 1 carrossel"
- **CTA:** "Gerar 1 carrossel agora" → `/app/create`
- **Idempotência:** flag `re_engagement_sent_at` (throttle de 45 dias).
- **Funcional:** ✓.

### 9. Payment Success — Stripe `checkout.session.completed`
- **Template:** `lib/email/templates/payment-success.tsx`
- **Dispatcher:** `sendPaymentSuccess()` em `dispatch.ts:71`
- **Trigger:** `app/api/stripe/webhook/route.ts:216` após upgrade bem-sucedido.
- **Público:** user que acabou de assinar Creator/Pro/Business.
- **Assunto:** `Plano {planName} ativo — bora criar`
- **CTA:** "Ir para o estúdio" → `/app/create`
- **Idempotência:** não há flag — depende do webhook Stripe disparar 1x (garantia Stripe).
- **Funcional:** ✓.

### 10. Payment Failed — Stripe `invoice.payment_failed`
- **Template:** `lib/email/templates/payment-failed.tsx`
- **Dispatcher:** `sendPaymentFailed()` em `dispatch.ts:155`
- **Trigger:** `app/api/stripe/webhook/route.ts:397` quando fatura renovação falha.
- **Público:** assinantes ativos com cartão recusado.
- **Assunto:** "Falha na cobrança — atualize seu cartão"
- **CTA:** "Atualizar forma de pagamento" → portal Stripe (fallback `/app/settings`)
- **Idempotência:** sem flag — cada `invoice.payment_failed` dispara 1 email (Stripe pode tentar 3-4x com retries Smart).
- **Funcional:** ✓.

---

## Triggers — timeline resumo

| Quando | Evento | Email | Cron / Endpoint |
|---|---|---|---|
| D+0 | Signup confirmado | Welcome | `/api/email/welcome` (client call) |
| D+1 (14h UTC) | Profile `created_at` = há 24-48h | Onboarding How It Works | `/api/cron/onboarding-drip` |
| D+2~D+3 (15h UTC) | `usage_count = 0` + `created_at` 48-72h | Activation Nudge | `/api/cron/activation-nudge` |
| D+3 | `created_at` = há 72-96h | Onboarding First Case | `/api/cron/onboarding-drip` |
| D+7 | `created_at` = há 7-8 dias | Onboarding Why Upgrade | `/api/cron/onboarding-drip` |
| Imediato | 1ª geração com sucesso | First Carousel | `/api/generate` (inline dispatch) |
| Imediato | `checkout.session.completed` | Payment Success | `/api/stripe/webhook` |
| Imediato | `invoice.payment_failed` | Payment Failed | `/api/stripe/webhook` |
| Diário (16h UTC) | `plan=free` + ≥80% limite + 1x/ciclo | Plan Limit | `/api/cron/plan-limit` |
| Semanal (ter 17h UTC) | Ativo há 7+ dias sem gerar | Re-Engagement | `/api/cron/re-engagement` |

---

## Issues encontrados

- **Onboarding Why Upgrade não filtra plano pago.** `/api/cron/onboarding-drip` seleciona todos os profiles D+7 sem checar `plan`. User que assinou no D+2 ainda recebe pitch de upgrade no D+7. Impacto baixo mas ruído. Fix: adicionar `.eq("plan", "free")` no select da step `onboarding-why-upgrade` (ou bloquear em todos os 3 se preferir drip só pra free).
- **First Case menciona "47 carrosséis em 1 semana" como case real.** Copy dá nome de um creator "beta" anônimo. Se não houver caso verificado, reescrever com número honesto próprio (ex: testes internos) pra não quebrar a regra de ground truth que a gente prega no Writer. Em escala, risco de parecer marketese vazio.
- **`EMAIL_FROM` default é `onboarding@resend.dev`.** Se var de ambiente não estiver setada em prod, emails sairão do domínio compartilhado Resend (dobra chance de spam). Checar Vercel prod env: `EMAIL_FROM=Sequência Viral <noreply@kaleidos.com.br>` (ou domínio verificado no Resend).
- **Welcome CTA vai pra `/app/create` mas rota oficial virou `/app/create/new`.** Redirect existe (`next.config.ts`), então funciona, mas link direto pra `/app/create/new` é mais limpo. Vale padronizar.
- **Sem unsubscribe link estruturado.** Re-Engagement pede pro user responder "cancelar" manualmente. Sem header `List-Unsubscribe`, risco de cair em spam em provedor rígido (Outlook/Gmail Promoções).
- **First Carousel dispatcher é lazy-import.** Ok pra cold-start, mas erro silencioso: se `dispatch.ts` tivesse import quebrado só quebraria em runtime da primeira geração. Smoke test (`scripts/test-email.ts`) pega isso só se rodado.

---

## Recomendações

1. **Adicionar filtro `plan = free`** no cron `onboarding-drip` step Why Upgrade (`app/api/cron/onboarding-drip/route.ts:47`) — 2 linhas, sem migration.
2. **Setar `EMAIL_FROM` em Vercel prod** com domínio verificado no Resend (`noreply@kaleidos.com.br` ou similar) + configurar `List-Unsubscribe` header no `send.ts` pra melhorar deliverability.
3. **Rever copy do First Case** pra usar dado verificável (teste interno, número real do Gabriel) — consistência com ground truth rule do produto.
