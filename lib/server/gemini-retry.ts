/**
 * Retry com backoff exponencial para chamadas à API do Gemini.
 * Foca em erros transientes (502, 503, 504, "overloaded", rate-limit transitório).
 *
 * Uso:
 *   const result = await geminiWithRetry(() => ai.models.generateContent(...));
 */

const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

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
  if (typeof status === "number" && TRANSIENT_STATUS_CODES.has(status)) return true;

  const code = e.code;
  if (typeof code === "number" && TRANSIENT_STATUS_CODES.has(code)) return true;

  const msg = (e.message || "").toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("deadline") ||
    msg.includes("service_unavailable") ||
    msg.includes("internal") ||
    msg.includes("ecconnreset") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("fetch failed")
  );
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
