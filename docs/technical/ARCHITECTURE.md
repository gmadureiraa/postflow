# Architecture — Sequência Viral

Documento técnico de referência. Para o guia do usuário, ver
[`docs/product/guia-carrossel-sequencia-viral.md`](../product/guia-carrossel-sequencia-viral.md).

---

## 1. Como rodar local

Pré-requisitos: **Bun ≥ 1.1**, Node 20+ (compat), e acesso ao Supabase
prod (anon key + service key) em `.env.local`.

```bash
# 1. Instalar deps
bun install

# 2. Configurar env vars (copiar do .env.example, preencher chaves)
cp .env.example .env.local
$EDITOR .env.local

# 3. (uma vez por ambiente novo) criar bucket Supabase de imagens
bun scripts/create-buckets.ts
#   → cria bucket público "carousel-images" usado pra cachear IG CDN

# 4. Subir dev server
bun run dev
#   → http://localhost:3000

# 5. Build de produção (validar antes de commit)
bun run build

# 6. Tests (Vitest)
bunx vitest run
#   ⚠️  NÃO use `bun test` — invoca o test runner built-in do Bun, que
#   não suporta `vi.stubGlobal` etc. Use sempre `bunx vitest run`.
```

### Variáveis críticas

Tier 1 (obrigatórias para subir o app):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Tier 2 (necessárias para fluxos específicos):
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — checkout
- `APIFY_API_KEY` — scraper IG primário no onboarding
- `SCRAPECREATORS_API_KEY` — fallback automático do scraper
- `SERPER_API_KEY` — busca de imagens stock
- `RESEND_API_KEY` — emails transacionais
- `ANTHROPIC_API_KEY` — Claude (rotas específicas, fallback)

Tier 3 (opcionais):
- `NEXT_PUBLIC_FACEBOOK_APP_ID` — habilita FB Login no onboarding
- `DISCORD_WEBHOOK_URL` — alertas de healthcheck
- `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` — sync de planos via Stripe Portal

---

## 2. Stack

| Camada | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, Tailwind 4 |
| UI | Radix + shadcn/ui, Framer Motion, Sonner (toasts) |
| State | Zustand-less — hooks customizados em `lib/create/use-*` |
| Backend | Next.js Route Handlers (`app/api/**`) — Fluid Compute |
| Auth | Supabase (Google OAuth + email/senha) |
| DB | Supabase Postgres + RLS owner-only |
| Storage | Supabase Storage (`carousel-images`, `carousel-exports`) |
| Pagamento | Stripe (checkout + portal + webhook) |
| LLM (texto) | Gemini 2.5 Pro/Flash (writer) + Anthropic Claude (fallback) |
| LLM (imagem) | Gemini Imagen 4.0 / Flash Image Nano |
| Scraping IG | Apify (primário) + ScrapeCreators (fallback) + FB Graph (opt-in) |
| Stock images | Serper (Google Images) + Unsplash |
| Observability | PostHog (events + exceptions) + Vercel Analytics |
| Email | Resend (`news.kaleidos.com.br`) |

---

## 3. Arquitetura da geração

Pipeline single-shot — usuário escreve briefing → carrossel completo
(8 slides com texto + imagem) renderizado em ~30-60s.

```
[user briefing] ──▶ /api/generate
                    ├─ auth (Bearer JWT do Supabase)
                    ├─ rate limit (lib/server/rate-limit.ts)
                    ├─ usage check (RPC atomic_usage_check)
                    │
                    ├─ source extraction
                    │   ├─ link → url-extractor (firecrawl + ssrf-guard)
                    │   ├─ youtube → youtube-transcript / supadata
                    │   └─ instagram → instagram-extractor (apify/scrapecreators)
                    │
                    ├─ NER preprocessing (source-ner.ts)
                    │   └─ extrai pessoas/empresas/datas como facts estruturados
                    │
                    ├─ Gemini call (lib/server/generate-carousel.ts)
                    │   ├─ writer mode: Gemini Flash (default)
                    │   ├─ layout-only mode: preserva wording exato
                    │   └─ retry strict: Gemini Flash em fallback
                    │
                    ├─ image pipeline (paralelo, por slide)
                    │   ├─ template "twitter": Serper image search
                    │   └─ outros templates: Imagen 4 generation
                    │       ├─ 2-pass para capa: Gemini planeja cena → Flash Image Nano
                    │       └─ retry com Imagen 4 se Flash Image falha
                    │
                    └─ persist em Supabase (carousels + slides[])
```

Ver: [`lib/server/generate-carousel.ts`](../../lib/server/generate-carousel.ts) e
[`app/api/generate/route.ts`](../../app/api/generate/route.ts).

### Template lock (commit `d4831b0`, abr/2026)

A IA **não pode mudar** o template visual escolhido pelo usuário. O
`designTemplate` recebido é tratado como fonte da verdade — qualquer
template que o LLM mencione no JSON de saída é descartado e
substituído pelo escolhido. Variantes ainda são livres para a IA
escolher por slide.

### Cache e resiliência

- **IG CDN cache** — toda imagem do Instagram raspada vai pro bucket
  Supabase como `onboarding-scrape/{userId}/{sha1(url)}.{ext}`
  (idempotente). Sem cache, render do front recebe 403 do CDN do IG.
- **Gemini retry** — `lib/server/gemini-retry.ts` faz exponential
  backoff em 502/503/quota-exceeded. Se quota global do Gemini esgota,
  retorna 503 honesto e **rolla back** o `usage_count`.
- **Image theme cache** — ver migration
  `20260422150000_image_theme_cache.sql` (cache por hash do tema).

---

## 4. Adicionando um novo template visual

Templates ficam em `components/app/templates/`. Cada template é um
componente React que recebe `SlideProps` (definido em
[`components/app/templates/types.ts`](../../components/app/templates/types.ts))
e renderiza num canvas 1080×1350 (Instagram 4:5).

### Passo a passo

1. **Criar componente** `components/app/templates/template-novo.tsx`
   exportando default um `forwardRef<HTMLDivElement, SlideProps>` que
   honra:
   - `slideNumber` / `totalSlides` (footer)
   - `variant` (cover | headline | photo | quote | split | cta |
     solid-brand | text-only | full-photo-bottom)
   - `style` ("white" | "dark") + `bgColor` override
   - `accentOverride`, `displayFontOverride`, `textScale`
   - `layers` (toggles de title/body/bg)
   - `exportMode` — usa `resolveImgSrc(url, true)` em todas as imagens
     pra rotear pelo `/api/img-proxy` quando precisa (evita canvas
     tainted no PNG export).

2. **Registrar em** `components/app/templates/index.tsx`:
   - Adicionar import do componente
   - Adicionar case no switch do `TemplateRenderer`
   - Adicionar entrada em `TEMPLATES_META` com `id`, `name`, `kicker`,
     `palette` (3 cores hex pra preview)
   - Adicionar o `TemplateId` no union em `types.ts`

3. **Permitir no editor** — no array da página
   `app/app/create/[id]/templates/page.tsx`, adicionar o card. Idem
   `app/app/create/new/page.tsx` se quiser oferecer pre-pick.

4. **Default images** (opcional) — adicionar curadoria em
   `lib/create/default-images.ts` pra pré-popular `slide.imageUrl` ao
   trocar template.

5. **Geração** — o pipeline da geração propaga `designTemplate` direto
   pro prompt do Gemini, e o `image-decider` decide se busca/gera com
   base no template id (`twitter` busca stock, resto gera com Imagen).
   Se quiser comportamento diferente, ajustar
   `lib/server/image-decider.ts`.

6. **Smoke test** — rodar `/app/admin/batch-test` (admin only) com 5
   tópicos diferentes pra validar que o template renderiza ok em
   todas as 8 variantes.

---

## 5. Custo por carrossel

Estimativa por carrossel single-shot (8 slides, geração + imagens),
**em USD**, baseado nos preços públicos de abr/2026:

| Componente | Operação | Preço unitário | Custo/carrossel |
|---|---|---|---|
| Gemini 2.5 Flash | writer (~6k input + ~3k output) | $0.30/$2.50 por M tokens | ~$0.0094 |
| Gemini 2.5 Pro | writer fallback (raro) | $1.25/$10.00 por M tokens | ~$0.038 |
| Imagen 4 | gerar capa + 7 inner (templates não-twitter) | $0.04 / imagem | $0.32 |
| Flash Image Nano | gerar capa 2-pass primeiro | $0.039 / imagem | $0.039 |
| Serper Images | template twitter, 8 buscas | $0.001 / busca | $0.008 |
| Apify (onboarding once) | scrape de perfil | $0.003 / run | (não recorrente) |
| ScrapeCreators (fallback) | profile + posts | 2 credits ≈ $0.002 | (fallback) |
| Supabase Storage | bucket público + bandwidth | grátis até 1GB egress | ~$0 |

**Custo médio por carrossel novo:**
- Template `twitter` (stock images): **~$0.018**
- Template `manifesto`/`futurista`/`autoral`/`blank`/`ambitious`
  (Imagen): **~$0.32-0.36** (dominado pelo Imagen 4)

### Margens (preço atual em BRL → custo ~USD)

| Plano | Preço/mês | Carrosséis/mês | Custo máx (Imagen) | Margem |
|---|---|---|---|---|
| Free | R$ 0 | 5 | $1.80 | -$1.80 (CAC) |
| Pro | R$ 49 | 30 | $10.80 | ~$0 (margem zero a 5,4 BRL/USD) |
| Business | R$ 149 | ilimitado* | depende do uso | precisa monitorar |

\* `business` é teto soft. Se um user passar de 200 carrosséis/mês,
custo Imagen ultrapassa receita. Hoje não há cap automático — TODO.

### Tracking real

Cada chamada paga loga em `generations` com `tokens_in`, `tokens_out`,
`cost_usd`, `provider`. Admin → Overview mostra:
- Custo total dos últimos 30 dias
- Breakdown por provider (Gemini/Imagen/Serper/Apify/Anthropic)
- Top users por custo (P95 / P99)

Ver `/api/admin/cost-breakdown` e `app/app/admin/page.tsx`.

---

## 6. Rotas críticas (API)

| Rota | Método | Auth | Rate Limit | Descrição |
|---|---|---|---|---|
| `/api/generate` | POST | Bearer | 50/h/user | Gera carrossel single-shot |
| `/api/generate-concepts` | POST | Bearer | 30/h/user | Gera só conceitos (sem slides) |
| `/api/images` | POST | Bearer | 100/h/user | Search/gen image individual |
| `/api/upload` | POST | Bearer | 30/h/user | Upload pra Supabase Storage |
| `/api/profile-scraper` | POST | opcional | 10/h/IP ou 30/h/user | Onboarding scraper |
| `/api/stripe/checkout` | POST | Bearer | 10/h/user | Cria Checkout Session |
| `/api/stripe/webhook` | POST | signed | — | Stripe events (signature obrigatória em prod) |
| `/api/admin/*` | GET/POST | Bearer + admin email | — | Admin only |
| `/api/cron/*` | GET | `CRON_SECRET` header | — | Cron jobs (Vercel) |

Auth headers helper: [`lib/api-auth-headers.ts`](../../lib/api-auth-headers.ts).
Rate limit (in-memory por instância): [`lib/server/rate-limit.ts`](../../lib/server/rate-limit.ts).

---

## 7. Schema (Supabase)

Tabelas principais:

- `profiles` — perfil do usuário, plano, usage_count, brand_analysis (JSONB)
- `carousels` — carrossel completo (slides[] em JSONB), style/template
- `generations` — log de geração (tokens, custo, provider, prompt usado)
- `payments` — histórico Stripe
- `coupons` + `coupon_redemptions` — cupons internos
- `meta_connections` — Facebook Login opt-in tokens
- `carousel_feedback` — thumbs up/down + texto livre por carrossel
- `image_theme_cache` — cache de imagens por hash do tema
- `stripe_events_processed` — idempotência de webhooks
- `user_images` — galeria do user (uploads)

Migrations em [`supabase/migrations/`](../../supabase/migrations/), schema
canônico em [`supabase/schema.sql`](../../supabase/schema.sql).

RLS: owner-only via `auth.uid() = user_id` em todas as tabelas
sensíveis. Webhooks usam `service_role` (não passam por RLS).

---

## 8. Deploy

Produção: projeto Vercel `sequencia-viral`, alias
`viral.kaleidos.com.br`. Auto-deploy no push pra `main`.

Comando manual:
```bash
cd /Users/gabrielmadureira/GOS/code/sequencia-viral
vercel deploy --prod
```

⚠️ **NÃO** deployar no projeto Vercel `postflow` — é legado. Ver
`postflow_prod_domain.md` no GOS memory.

---

*Atualizado: 2026-04-25*
