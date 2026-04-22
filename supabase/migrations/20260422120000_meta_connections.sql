-- Tabela para armazenar conexões Meta/Instagram via Facebook Login.
-- Um user pode ter 1 conexão Meta ativa. access_token é de longa duração (60
-- dias) e precisa ser renovado antes de expirar. Apify continua sendo fallback
-- pra users que não conectam via FB.

CREATE TABLE IF NOT EXISTS public.meta_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_user_id        TEXT NOT NULL,
  ig_business_id      TEXT,
  ig_username         TEXT,
  ig_account_type     TEXT, -- BUSINESS | CREATOR | PERSONAL
  access_token        TEXT NOT NULL, -- long-lived (60d). Rotacionar antes de expirar.
  token_expires_at    TIMESTAMPTZ,
  granted_scopes      TEXT[],
  raw_profile         JSONB, -- snapshot inicial (nome, avatar, followers, etc.)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at          TIMESTAMPTZ, -- marcado quando user desconecta ou Meta chama deletion callback
  UNIQUE(user_id, meta_user_id)
);

CREATE INDEX IF NOT EXISTS meta_connections_user_id_idx ON public.meta_connections(user_id);
CREATE INDEX IF NOT EXISTS meta_connections_meta_user_id_idx ON public.meta_connections(meta_user_id);

-- RLS: user só lê/edita as próprias conexões. Service role ignora.
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meta_connections_self_select" ON public.meta_connections;
CREATE POLICY "meta_connections_self_select"
  ON public.meta_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meta_connections_self_delete" ON public.meta_connections;
CREATE POLICY "meta_connections_self_delete"
  ON public.meta_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Service role cria/atualiza via /api/auth/meta/exchange. User não insere/update direto.
-- (intencional: previne injection de tokens fakes do browser)

-- Log de deletion requests do Meta (eles batem no callback com user_id assinado).
CREATE TABLE IF NOT EXISTS public.meta_deletion_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_user_id    TEXT NOT NULL,
  confirmation_code TEXT NOT NULL,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meta_deletion_requests_code_idx ON public.meta_deletion_requests(confirmation_code);
CREATE INDEX IF NOT EXISTS meta_deletion_requests_meta_user_id_idx ON public.meta_deletion_requests(meta_user_id);

COMMENT ON TABLE public.meta_connections IS 'Conexões Facebook Login → Instagram Graph API por user SV. Apify continua fallback.';
COMMENT ON TABLE public.meta_deletion_requests IS 'Log GDPR: Meta chama callback quando user pede exclusão. Resposta: { url, confirmation_code }.';
