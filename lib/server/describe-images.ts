/**
 * describe-images.ts
 *
 * Roda Gemini 2.5 Flash multimodal em paralelo pra cada imagem enviada pelo user.
 * Devolve descrições curtas (≤80 chars) com tipo, conteúdo principal e mood.
 * Best-effort: se uma falhar, retorna stub vazio e não quebra o batch.
 *
 * Limite: máximo 8 imagens por batch (imagens extras são ignoradas).
 */

import { GoogleGenAI } from "@google/genai";

export interface ImageDescription {
  url: string;
  /** ≤80 chars, em pt-BR. Descreve o conteúdo principal da imagem. */
  description: string;
  /** Tipo visual: foto/screenshot/ilustração/produto/diagrama/outro. */
  kind: string;
  /** Mood/tom: sério/divertido/clean/dramático/energético/outro. */
  mood: string;
}

const MAX_IMAGES = 8;

/**
 * Baixa bytes da URL e devolve { base64, mimeType }.
 * Tenta inferir mimeType pela extensão; cai em image/jpeg se não reconhecer.
 */
async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url, {
    // Sem Referer e sem User-Agent exótico — CDNs de storage retornam 403 com Referer
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SequenciaViral/1.0)" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao baixar imagem ${url}: HTTP ${res.status}`
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const mimeType = contentType.startsWith("image/")
    ? contentType.split(";")[0].trim()
    : inferMimeFromUrl(url);

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mimeType };
}

function inferMimeFromUrl(url: string): string {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

const DESCRIBE_PROMPT = `Analise esta imagem e responda em JSON válido com exatamente estas chaves:
- "description": string ≤80 chars em pt-BR descrevendo o conteúdo principal (o que está na imagem, pessoas/objetos/cena)
- "kind": uma dessas opções exatas: foto | screenshot | ilustração | produto | diagrama | outro
- "mood": uma palavra em pt-BR que capture o tom visual (ex: sério, divertido, clean, dramático, energético, profissional, casual)

Responda APENAS o JSON, sem markdown, sem explicações. Exemplo: {"description":"Pessoa sorrindo em frente a computador","kind":"foto","mood":"profissional"}`;

/**
 * Descreve uma única imagem via Gemini Flash multimodal.
 * Lança erro se falhar — o chamador é responsável por capturar.
 */
async function describeSingleImage(
  ai: GoogleGenAI,
  url: string
): Promise<ImageDescription> {
  const { base64, mimeType } = await fetchImageAsBase64(url);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      temperature: 0,
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          { text: DESCRIBE_PROMPT },
        ],
      },
    ],
  });

  const raw = response.text ?? "";

  let parsed: { description?: string; kind?: string; mood?: string };
  try {
    // Remove possíveis fences de markdown caso o modelo não respeite responseMimeType
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    // Parse falhou — extrai o que der com regex
    const descMatch = raw.match(/"description"\s*:\s*"([^"]+)"/);
    const kindMatch = raw.match(/"kind"\s*:\s*"([^"]+)"/);
    const moodMatch = raw.match(/"mood"\s*:\s*"([^"]+)"/);
    parsed = {
      description: descMatch?.[1] ?? "",
      kind: kindMatch?.[1] ?? "outro",
      mood: moodMatch?.[1] ?? "",
    };
  }

  return {
    url,
    description: (parsed.description ?? "").slice(0, 80),
    kind: parsed.kind ?? "outro",
    mood: parsed.mood ?? "",
  };
}

/**
 * Roda Gemini Flash em paralelo pra cada URL. Best-effort: se uma falhar,
 * retorna descrição vazia mas não quebra o batch.
 *
 * @param urls Array de URLs públicas (máx 8 — excedentes são ignorados)
 * @returns Array de ImageDescription, mesma ordem das URLs de entrada
 */
export async function describeImages(
  urls: string[]
): Promise<ImageDescription[]> {
  if (!urls.length) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[describe-images] GEMINI_API_KEY ausente — retornando stubs");
    return urls.map((url) => ({ url, description: "", kind: "outro", mood: "" }));
  }

  const limited = urls.slice(0, MAX_IMAGES);
  const ai = new GoogleGenAI({ apiKey });

  const results = await Promise.all(
    limited.map(async (url): Promise<ImageDescription> => {
      try {
        return await describeSingleImage(ai, url);
      } catch (err) {
        console.warn(`[describe-images] falhou pra ${url}:`, err);
        return { url, description: "", kind: "outro", mood: "" };
      }
    })
  );

  return results;
}
