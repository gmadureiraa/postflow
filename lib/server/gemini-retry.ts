/**
 * Retry com backoff exponencial para chamadas à API do Gemini.
 * Foca em erros transientes (502, 503, 504, "overloaded", rate-limit transitório).
 *
 * Uso:
 *   const result = await geminiWithRetry(() => ai.models.generateContent(...));
 */

const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * 429 vem de 2 coisas muito diferentes:
 *  - rate-limit curto (requests/segundo ou requests/minuto) → retry com backoff
 *    de ~1s resolve
 *  - quota exhausted (free tier esgotou, billing desativado) → retry diário,
 *    não vai resolver em segundos. Retry é DESTRUTIVO: queima chamadas inúteis
 *    e ainda aumenta latência antes de mostrar erro pro usuário.
 *
 * Detecta pela msg da Google API — quando 429 traz "RESOURCE_EXHAUSTED" ou
 * "free_tier" ou "quota exceeded", NÃO retentar. Deixa o chamador receber
 * o erro e decidir (normalmente responder 503 com mensagem pro usuário).
 */
function isQuotaExhausted(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("resource_exhausted") ||
    m.includes("free_tier") ||
    m.includes("quota exceeded") ||
    m.includes("exceeded your current quota") ||
    m.includes("generaterequestsperdayperproject")
  );
}

function shouldRetry(err: unknown): boolean {
  if (!err) return false;
  // Tenta extrair status/message de forma defensiva
  const e = err as {
    status?: number;
    statusCode?: number;
    code?: number | string;
    message?: string;
    response?: { status?: number };
  };
  const status = e.status ?? e.statusCode ?? e.response?.status;
  const msg = e.message || "";

  // Quota exhausted: nunca retentar, mesmo em 429.
  if (isQuotaExhausted(msg)) return false;

  if (typeof status === "number" && TRANSIENT_STATUS_CODES.has(status)) return true;

  const code = e.code;
  if (typeof code === "number" && TRANSIENT_STATUS_CODES.has(code)) return true;

  const lower = msg.toLowerCase();
  if (!lower) return false;
  return (
    lower.includes("overloaded") ||
    lower.includes("unavailable") ||
    lower.includes("deadline") ||
    lower.includes("service_unavailable") ||
    lower.includes("internal") ||
    lower.includes("ecconnreset") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("fetch failed")
  );
}

/** Expõe o detector pra chamadores que precisam reagir diferente (ex: 503). */
export function isGeminiQuotaExhausted(err: unknown): boolean {
  if (!err) return false;
  const e = err as { message?: string };
  return isQuotaExhausted(e.message || "");
}

export type GeminiRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, err: unknown) => void;
};

export async function geminiWithRetry<T>(
  fn: () => Promise<T>,
  opts: GeminiRetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 600,
    maxDelayMs = 4000,
    onRetry,
  } = opts;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts || !shouldRetry(err)) {
        throw err;
      }
      const expo = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jitter = Math.random() * 0.4 * expo;
      const delay = Math.round(expo + jitter);
      onRetry?.(attempt, err);
      console.warn(
        `[gemini-retry] tentativa ${attempt} falhou; esperando ${delay}ms antes do retry`,
        err instanceof Error ? err.message : err
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
