import {
  requireAuthenticatedUser,
  createServiceRoleSupabaseClient,
} from "@/lib/server/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";
import { geminiWithRetry } from "@/lib/server/gemini-retry";
import { GoogleGenAI } from "@google/genai";

/**
 * Constrói o bloco "USER BRAND CONTEXT" a partir de profiles.brand_analysis.
 * Pattern copiado de /api/generate/route.ts:87-104 + novos campos do onboarding
 * (voice_samples / tabus / content_rules).
 */
function buildBrandContext(ba: Record<string, unknown> | null): string {
  if (!ba || typeof ba !== "object") return "";
  const pillars = Array.isArray(ba.content_pillars)
    ? (ba.content_pillars as string[]).join(", ")
    : "";
  const topics = Array.isArray(ba.top_topics)
    ? (ba.top_topics as string[]).join(", ")
    : "";
  const tone_detected = (ba.tone_detected as string) || "";
  const audience = (ba.audience_description as string) || "";
  const voice = (ba.voice_preference as string) || "";
  const samples = Array.isArray(ba.voice_samples)
    ? (ba.voice_samples as string[])
        .map((s) => (typeof s === "string" ? s.slice(0, 240) : ""))
        .filter(Boolean)
        .join("\n---\n")
    : "";
  const tabus = Array.isArray(ba.tabus)
    ? (ba.tabus as string[]).filter(Boolean).join(", ")
    : "";
  const rules = Array.isArray(ba.content_rules)
    ? (ba.content_rules as string[]).filter(Boolean).join("; ")
    : "";
  if (
    !pillars &&
    !topics &&
    !tone_detected &&
    !audience &&
    !voice &&
    !samples &&
    !tabus &&
    !rules
  ) {
    return "";
  }
  return `
USER BRAND CONTEXT (use this to make content sound authentically like this creator, not generic AI):
- Content pillars: ${pillars || "not specified"}
- Typical topics: ${topics || "not specified"}
- Detected writing tone: ${tone_detected || "not specified"}
- Target audience: ${audience || "not specified"}
- Voice preference: ${voice || "not specified"}
${samples ? `- Voice samples (imite ritmo e estrutura, não copie literalmente):\n${samples}\n` : ""}${tabus ? `- NEVER use these words or phrases: ${tabus}\n` : ""}${rules ? `- Rules to follow strictly: ${rules}\n` : ""}`;
}

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

    // Brand context do profile (opcional — se usuário não completou onboarding,
    // brandContext fica vazio e o prompt funciona normalmente).
    let brandContext = "";
    const sb = createServiceRoleSupabaseClient();
    if (sb) {
      const { data: prof } = await sb
        .from("profiles")
        .select("brand_analysis")
        .eq("id", user.id)
        .single();
      brandContext = buildBrandContext(
        (prof?.brand_analysis as Record<string, unknown> | null) ?? null
      );
    }

    const langNote = (language || "pt-br").startsWith("pt")
      ? "Responda em português brasileiro coloquial."
      : language === "en" ? "Respond in English." : `Respond in ${language}.`;

    const prompt = `You are a senior content strategist pitching 5 radically different carousel stories to an editorial board. ${langNote}

NICHE: ${niche || "general"}
TONE: ${tone || "casual"}
${brandContext}
TOPIC/INPUT: ${topic}

# YOUR JOB
Generate 5 carousel concepts. Each must feel like a COMPLETELY DIFFERENT STORY — different tension, different audience emotion, different narrative structure. A reader should want to read ALL 5, not feel like they're the same idea reworded.

# INPUT TYPE ADAPTATION
Analyze the input and adapt your approach:
- If it contains a YouTube URL or video transcript → reference specific moments, quotes, or claims from the video. Build concepts that EXTEND what was said, not just summarize it.
- If it contains a link or article text → build on the article's central thesis. Challenge it, extend it, or flip it. Never just repackage.
- If it describes an Instagram post → extend the conversation. What's the natural NEXT debate this post opens?
- If it's a raw idea or topic → surprise with unexpected angles. Find the tension that isn't obvious.
- If it feels like an AI suggestion or trending topic → make it timely. Tie to a specific recent shift, not a generic take.

# HOOK RULES
Each hook has 2 parts separated by "|":
- Part 1 (INTERRUPTION): Max 8 words. This stops the scroll. It must create a gap — something unexpected, counterintuitive, or emotionally charged. Use a question mark, colon, or period.
- Part 2 (ANCHOR): Max 12 words. This gives context and stakes. It tells the reader WHY they should care. Ends with "." or "!"

The hook must work in 0.7 seconds. No filler words. No generic openings like "Descubra como" or "O guia definitivo".

# 5 MANDATORY HEADLINE NATURES (one per concept, in order):
1. REENQUADRAMENTO — Take what everyone thinks they know and show them a completely different frame. The reader should think "I never saw it that way."
2. CONFLITO OCULTO — Reveal a hidden tension or war beneath the surface. Who's losing? What's really at stake?
3. CONTRADIÇÃO — Find where the conventional wisdom is provably wrong. Use a specific number or example to break the assumption.
4. MECANISMO — Expose the hidden system, loop, or engine that actually drives the phenomenon. Not "what" but "how it really works."
5. INVERSÃO — Flip the expected conclusion. What if the opposite of the common advice is actually true?

# QUALITY GATES (each concept MUST pass ALL):
- Would a content creator stop scrolling to read this? If not, kill it.
- Is this hook SPECIFIC to this exact topic? If you could swap in another topic and it still works, it's too generic. Kill it.
- Does the angle reveal a TENSION (not just information)? No tension = no swipe.
- BANNED phrases: "muitas pessoas", "resultados incríveis", "game-changer", "descubra como", "o segredo de", "o guia definitivo", "você precisa saber"
- Every number must be specific: "78%", "3 em cada 10", never "a maioria" or "muitos"

# OUTPUT FORMAT
Return ONLY valid JSON:
{"concepts":[{"title":"max 45 chars — the carousel title","hook":"interruption line | anchor line","style":"data|story|provocative|howto|mythbust","angle":"1 sentence: the narrative TENSION and WHY this matters (max 25 words)"}]}

Generate exactly 5 concepts. Make each one so compelling that the reader can't pick just one.`;

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const result = await geminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.9,
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      })
    );

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
