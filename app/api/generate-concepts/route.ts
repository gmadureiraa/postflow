import { requireAuthenticatedUser } from "@/lib/server/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 10;

/**
 * STEP 1: Generate 5 carousel CONCEPTS (cheap, fast).
 * Returns just title + hook + style for the user to pick.
 * Then /api/generate expands the chosen concept into a full carousel.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const limiter = checkRateLimit({
      key: getRateLimitKey(request, "concepts", user.id),
      limit: 100,
      windowMs: 60 * 60 * 1000,
    });
    if (!limiter.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
      );
    }

    const { topic, niche, tone, language } = await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return Response.json({ error: "IA não configurada." }, { status: 503 });
    }

    const langNote = (language || "pt-br").startsWith("pt")
      ? "Responda em português brasileiro coloquial."
      : language === "en" ? "Respond in English." : `Respond in ${language}.`;

    const prompt = `Generate 5 carousel concepts. ${langNote} Niche: ${niche || "general"}. Tone: ${tone || "casual"}.

RULES: title max 40 chars. hook max 8 words. angle max 15 words. Keep it SHORT.

5 angles: data, story, contrarian, howto, mythbust.

Topic: ${topic}

JSON: {"concepts":[{"title":"...","hook":"...","style":"data|story|provocative|howto|mythbust","angle":"..."}]}`;

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = result.text || "";
    let parsed: { concepts: Array<{ title: string; hook: string; style: string; angle: string }> };
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return Response.json({ error: "Failed to parse concepts" }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (error) {
    console.error("Concepts error:", error);
    return Response.json(
      { error: "Erro ao gerar conceitos. Tente novamente." },
      { status: 500 }
    );
  }
}
