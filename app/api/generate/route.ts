import type { DesignTemplateId } from "@/lib/carousel-templates";
import { extractContentFromUrl } from "@/lib/url-extractor";
import { getYouTubeTranscript } from "@/lib/youtube-transcript";
import { requireAuthenticatedUser, createServiceRoleSupabaseClient } from "@/lib/server/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";
import { geminiWithRetry } from "@/lib/server/gemini-retry";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

interface GenerateRequest {
  topic: string;
  sourceType: "idea" | "link" | "video" | "instagram" | "ai";
  sourceUrl?: string;
  niche: string;
  tone: string;
  language: string;
  /** Aceito por compatibilidade; a redação não depende do template (só preview/imagens no app). */
  designTemplate?: DesignTemplateId;
}

type SlideVariant = "cover" | "headline" | "photo" | "quote" | "split" | "cta";

interface Slide {
  heading: string;
  body: string;
  imageQuery: string;
  variant: SlideVariant;
}

const VALID_VARIANTS: readonly SlideVariant[] = [
  "cover",
  "headline",
  "photo",
  "quote",
  "split",
  "cta",
] as const;

/**
 * Distribuição narrativa default quando o modelo esquece de preencher variant
 * ou devolve um valor inválido. A lógica é: primeiro slide sempre cover,
 * último sempre cta, e no meio alterna entre formatos pra evitar monotonia
 * visual (headline domina, com photo/split/quote como quebras de ritmo).
 */
function fallbackVariant(index: number, total: number): SlideVariant {
  // Edge: 1 slide → só cover; 2 slides → cover + cta.
  if (total <= 1) return "cover";
  if (index === 0) return "cover";
  if (index === total - 1) return "cta";
  const middle = index - 1;
  const rotation: SlideVariant[] = [
    "headline",
    "split",
    "headline",
    "photo",
    "headline",
    "quote",
    "headline",
    "photo",
  ];
  return rotation[middle % rotation.length];
}

function normalizeVariant(raw: unknown, index: number, total: number): SlideVariant {
  if (typeof raw === "string") {
    const v = raw.toLowerCase().trim() as SlideVariant;
    if (VALID_VARIANTS.includes(v)) return v;
  }
  return fallbackVariant(index, total);
}

interface Variation {
  title: string;
  style: "data" | "story" | "provocative";
  ctaType?: "save" | "comment" | "share";
  slides: Slide[];
}

interface GenerateResponse {
  variations: Variation[];
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return auth.response;
    }
    const { user } = auth;

    const limiter = checkRateLimit({
      key: getRateLimitKey(request, "generate", user.id),
      limit: 50,
      windowMs: 60 * 60 * 1000,
    });
    if (!limiter.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSec),
          },
        }
      );
    }

    // Single query: plan check + brand context
    const sb = createServiceRoleSupabaseClient();
    let brandContext = "";
    if (sb) {
      const { data: prof } = await sb
        .from("profiles")
        .select("usage_count, usage_limit, plan, brand_analysis")
        .eq("id", user.id)
        .single();
      if (prof) {
        const limit = prof.usage_limit ?? 5;
        const count = prof.usage_count ?? 0;
        if (count >= limit) {
          return Response.json(
            {
              error: `Você atingiu o limite de ${limit} carrosséis do plano ${prof.plan || "free"}. Faça upgrade para continuar gerando.`,
              code: "PLAN_LIMIT_REACHED",
            },
            { status: 403 }
          );
        }
        // Extract brand context from same query
        const ba = prof.brand_analysis as Record<string, unknown> | null;
        if (ba && typeof ba === "object") {
          const pillars = Array.isArray(ba.content_pillars) ? (ba.content_pillars as string[]).join(", ") : "";
          const topics = Array.isArray(ba.top_topics) ? (ba.top_topics as string[]).join(", ") : "";
          const tone_detected = (ba.tone_detected as string) || "";
          const audience = (ba.audience_description as string) || "";
          const voice = (ba.voice_preference as string) || "";
          const voiceSamples = Array.isArray(ba.voice_samples)
            ? (ba.voice_samples as string[])
                .map((s) => (typeof s === "string" ? s.slice(0, 240) : ""))
                .filter(Boolean)
                .join("\n---\n")
            : "";
          const tabus = Array.isArray(ba.tabus)
            ? (ba.tabus as string[]).filter(Boolean).join(", ")
            : "";
          const contentRules = Array.isArray(ba.content_rules)
            ? (ba.content_rules as string[]).filter(Boolean).join("; ")
            : "";
          if (pillars || topics || tone_detected || audience || voice || voiceSamples || tabus || contentRules) {
            brandContext = `
USER BRAND CONTEXT (use this to make content sound authentically like this creator, not generic AI):
- Content pillars: ${pillars || "not specified"}
- Typical topics: ${topics || "not specified"}
- Detected writing tone: ${tone_detected || "not specified"}
- Target audience: ${audience || "not specified"}
- Voice preference: ${voice || "not specified"}
${voiceSamples ? `- Voice samples (imite ritmo e estrutura, NÃO copie literalmente):\n${voiceSamples}\n` : ""}${tabus ? `- NEVER use these words or phrases: ${tabus}\n` : ""}${contentRules ? `- Rules to follow strictly: ${contentRules}\n` : ""}`;
          }
        }
      }
    }

    const body: GenerateRequest = await request.json();
    const { topic, sourceType, sourceUrl, niche, tone, language } = body;
    // designTemplate no body é ignorado: mesmo prompt v1 para qualquer visual escolhido no cliente.

    if (sourceType === "idea" && !topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    if (topic && topic.length > 5000) {
      return Response.json({ error: "Topic is too long (max 5000 chars)" }, { status: 400 });
    }
    if (sourceUrl && sourceUrl.length > 2000) {
      return Response.json({ error: "URL is too long (max 2000 chars)" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.error("[generate] GEMINI_API_KEY missing");
      return Response.json(
        { error: "Geração com IA não está configurada no servidor." },
        { status: 503 }
      );
    }

    // 1. Gather source content
    let sourceContent = "";

    if (sourceType === "link" && sourceUrl) {
      try {
        sourceContent = await extractContentFromUrl(sourceUrl);
      } catch (err) {
        console.error("[generate] URL extraction failed:", err);
        return Response.json(
          {
            error: `Não foi possível extrair conteúdo da URL: ${err instanceof Error ? err.message : "erro desconhecido"}. Dica: cole o texto manualmente no campo "Minha ideia".`,
          },
          { status: 400 }
        );
      }
    } else if (sourceType === "video" && sourceUrl) {
      try {
        sourceContent = await getYouTubeTranscript(sourceUrl);
      } catch (err) {
        console.error("[generate] YouTube transcript failed:", err);
        return Response.json(
          {
            error: `Não foi possível extrair a transcrição do YouTube: ${err instanceof Error ? err.message : "erro desconhecido"}. O vídeo pode não ter legendas disponíveis.`,
          },
          { status: 400 }
        );
      }
    } else if (sourceType === "instagram" && sourceUrl) {
      try {
        const { extractInstagramContent } = await import(
          "@/lib/instagram-extractor"
        );
        sourceContent = await extractInstagramContent(sourceUrl);
      } catch (err) {
        console.error("[generate] Instagram extraction failed:", err);
        return Response.json(
          {
            error: `Falha ao extrair o post do Instagram: ${
              err instanceof Error ? err.message : "erro desconhecido"
            }. Dica: cole a legenda como texto no modo "Minha ideia".`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Build the prompt
    const langCode = (language || "pt-br").toLowerCase();
    const isPtBr = langCode === "pt-br" || langCode === "pt";
    const languageInstruction = isPtBr
      ? `LANGUAGE: PORTUGUÊS BRASILEIRO (pt-BR). Escreva TODO o conteúdo — headings, body, CTA, image queries — em português brasileiro coloquial. NUNCA use inglês no heading ou body. Use "você", não "tu". Imagem queries devem ser em inglês (são usadas em busca de imagens stock).`
      : langCode === "en"
        ? "LANGUAGE: ENGLISH. Write all heading, body, and CTA in English."
        : langCode === "es"
          ? "LANGUAGE: ESPAÑOL. Escribe todo el heading, body y CTA en español."
          : `LANGUAGE: ${language}`;

    const systemPrompt = `You are a narrative architect for Instagram carousels and LinkedIn document posts. You think like a screenwriter — every slide is a scene that earns the next swipe.

${languageInstruction}
TONE: ${tone || "professional"}
NICHE: ${niche || "general"}
${brandContext ? `
# BRAND VOICE INTEGRATION
${brandContext}
IMPORTANT: Don't just acknowledge these brand signals — WEAVE them into the content. If the creator talks about marketing, use marketing examples. If their audience is founders, write FOR founders. If their tone is irreverent, match that energy. The carousel must sound like THIS creator wrote it, not a generic AI.
` : ""}

# YOUR MISSION
Create 1 carousel (6-10 slides) built on NARRATIVE TENSION — a conflict between what people assume and what's actually true.

Formula: surface reading → friction → reframe → mechanism → proof → implication → expanded closing

# SLIDE 1 — THE HOOK (0.7 seconds to stop the scroll)
Max 8 words in the heading. Every word must earn its place.

Hook patterns (pick the STRONGEST for this topic):
- **Specific number + consequence**: "78% dos criadores cometem esse erro no slide 1"
- **Contrarian rupture**: "Pare de fazer conteudo educativo." (challenges a belief)
- **Vulnerable story**: "Perdi R$47k em 23 dias." (specificity + curiosity gap)
- **Named tension**: "O algoritmo nao odeia voce. Seu hook sim."

Rules:
- Heading = INTERRUPTION. Body = OPEN LOOP that only swiping resolves.
- Never reveal the answer in slide 1. Create a gap the reader NEEDS to close.
- Body's last line must tease slide 2. Example: "E o motivo nao e o que parece."

# SLIDES 2 to N-1 — THE BUILD (narrative engine)

MICRO-CLIFFHANGER RULE: Every slide's body MUST end with a line that pulls the reader to the next slide. This is non-negotiable. Examples:
- "Mas tem um detalhe que muda tudo."
- "Esse nao e nem o maior problema."
- "O terceiro e o mais perigoso."
- "E aqui que a maioria para. Erro."

PATTERN INTERRUPT RULE: Every 3rd slide must break the rhythm.
- If slides 1-3 are statements → slide 4 is a question or surprising statistic
- If slides 2-4 are analytical → slide 5 is a short personal story or metaphor
- Never let 4 slides in a row follow the same structure

EMOTIONAL TRIGGER per slide (pick one):
- CURIOSITY: "O que realmente acontece quando..."
- FOMO: "Enquanto 92% ignora isso..."
- AHA-MOMENT: "Aqui esta o mecanismo que ninguem explica."

Each slide:
- ONE clear idea. One. Not two crammed together.
- First 3 words = mini-hook that earns the swipe
- Concrete specifics: names, percentages, timeframes. Never "muitas empresas" — always "3 em cada 10 startups Series A"
- Body: max 3 short lines with line breaks for scan-reading

# LAST SLIDE — THE CTA (callback loop)
The CTA MUST reference slide 1's hook — close the loop the reader opened.

Structure:
1. Line 1: Callback to slide 1. If slide 1 said "78% dos criadores cometem esse erro" → CTA says "Agora que voce sabe qual e o erro dos 78%..."
2. Line 2: Action optimized for algorithm. Priority: save > share > comment > like. Example: "Salva esse carrossel pra revisar antes do proximo post."
3. Line 3: Social proof nudge. Example: "Manda pra aquele amigo que ainda acha que alcance organico morreu."

Never use: "me siga", "curta esse post", "comente abaixo" alone. Always tie the CTA to the CONTENT.

# RADICAL SPECIFICITY (mandatory)
BANNED forever: "muitas pessoas", "resultados incriveis", "game-changer", "nesse sentido", "atualmente", "e por isso que", "a maioria", "muito tempo", "grandes resultados"
REQUIRED: every claim has a number ("78%", "R$12k", "23 minutos", "3 em cada 10"), a name, or a concrete example. No exceptions.

# STYLE
Choose: data (statistics/proof-driven), story (narrative/personal), or provocative (contrarian/bold). Pick whichever creates the strongest emotional arc for THIS specific topic.

# VISUAL RHYTHM — per-slide VARIANT (MANDATORY)
Cada slide DECLARA seu layout. O carrossel só "funciona visualmente" se você variar. Dois slides seguidos iguais = carrossel morto.

Variants disponíveis:
- "cover" — abre o carrossel. Headline ENORME em background bold. Body é subtítulo curto.
- "headline" — workhorse. Statement grande + body de apoio.
- "photo" — imagem domina, body é caption curto. Use quando a cena visual é a mensagem.
- "quote" — pull-quote screenshottable. 1 frase forte isolada.
- "split" — 2 colunas / antes-depois / contraste. Use pra comparações ou reveals.
- "cta" — último slide. Chamada de ação fechando o loop do hook.

REGRAS DE ABERTURA (slide 1) — ESCOLHA DELIBERADA, NÃO AUTOMÁTICA:
- Na variação "data": slide 1 pode ser "cover" (com dado gigante) OU "headline" (declaração forte que já soca um número).
- Na variação "story": slide 1 pode ser "quote" (1 frase pessoal) OU "cover" (título evocativo).
- Na variação "provocative": slide 1 pode ser "headline" direto (afirmação chocante, sem cover) OU "cover" tipo headline de manifesto.
- Cada uma das 3 variações DEVE começar com um variant DIFERENTE das outras 2. NUNCA entregue 3 variações todas começando em "cover".

REGRAS DO SLIDE 2:
- Slide 2 NUNCA repete o variant do slide 1. Se slide 1 é "cover", slide 2 é "split" ou "headline" ou "photo" (nunca cover de novo).
- Slide 2 tem que SOCAR — é o "segundo golpe" depois do hook. Entregue um dado, um contraste (split), uma cena (photo) ou uma provocação (headline). Jamais "headline" genérico repetindo o hook.

DEMAIS REGRAS:
1. Último slide MUST ser "cta".
2. Meio: NUNCA o mesmo variant 3 slides em sequência.
3. "quote" no máximo 2 vezes, em picos de tensão.
4. "photo" quando imageQuery é cena concreta (pessoa, objeto, cenário).
5. "split" quando o slide contém contraste explícito ("antes X, agora Y" / "todo mundo acha A, realidade é B").
6. Arrange narrativa exemplo (8 slides): "cover → split → headline → photo → quote → headline → split → cta" OU "headline → photo → headline → split → quote → photo → headline → cta" (variar é chave).

# IMAGE QUERY — cinematográfica, específica, ligada a ESTE slide
O campo "imageQuery" alimenta geração/busca de imagem. Regras:

1. ESPECIFICIDADE TOTAL pra o slide: leia heading E body inteiro antes de escrever. A imagem deve ser a CENA que esse slide conta.
2. 4-8 keywords em inglês (não 3-6). Mais específico = melhor.
3. Sempre inclua SUBJECT + AÇÃO/ESTADO + AMBIENTE. Ex: "young founder" (subject) + "staring at laptop" (ação) + "dim home office late night" (ambiente).
4. Se o slide é sobre dado/contraste: descreva a CENA da consequência (não o gráfico abstrato). "burnout entrepreneur receipts scattered desk" é melhor que "financial crisis chart".
5. Modifier estéticos obrigatórios: sempre termine com 1 desses pra dar direção visual:
   - "editorial photography documentary style natural light"
   - "cinematic still hard shadow 35mm film grain"
   - "overhead flat-lay soft window light"
   - "close-up macro shallow depth of field"
   - "wide environmental portrait golden hour"

BANIDAS (nunca use — puxam stock genérico): "strategy", "innovation", "growth", "AI", "future", "success", "business", "digital", "mindset", "impact", "transformation", "leadership", "teamwork", "collaboration".

Exemplos bons (heading/body → imageQuery):
- "78% dos criadores travam no slide 1" / "O hook é a maior queda de visualização"
  → "young creator phone screen instagram hand hesitating editorial photography documentary style natural light"
- "Perdi R$50k em 90 dias" / "Aprendi tarde o que todo anúncio exige"
  → "crumpled receipts spilling from wallet laptop background cinematic still hard shadow 35mm film grain"
- "A mecânica é simples" / "Toda venda depende de 3 pontos invisíveis"
  → "three gears turning metal machinery close-up macro shallow depth of field"
- "O algoritmo não te odeia" / "Seu post médio odeia"
  → "person scrolling phone in dark room blue screen glow cinematic still hard shadow 35mm film grain"

# OUTPUT FORMAT
Return valid JSON with exactly 3 variations — one in each style (data, story, provocative).
Each variation is a DISTINCT creative approach to the same topic.
Shape:
{
  "variations": [
    {
      "title": "string",
      "style": "data" | "story" | "provocative",
      "ctaType": "save" | "comment" | "share",
      "slides": [
        {
          "heading": "string",
          "body": "string",
          "imageQuery": "3-6 English keywords of a concrete visual scene for THIS slide",
          "variant": "cover" | "headline" | "photo" | "quote" | "split" | "cta"
        }
      ]
    }
  ]
}
Each slides array must have 6-10 items. Every slide MUST include a valid "variant".`;

    const userMessage =
      sourceContent
        ? `Create 3 carousel variations (data, story, provocative) based on this content:\n\nTopic: ${topic}\n\nSource:\n${sourceContent.slice(0, 3000)}`
        : `Create 3 carousel variations (data, story, provocative) about: ${topic}`;

    // 3. Increment usage BEFORE calling AI — ensures quota is always counted
    //    even if the response fails or user closes the tab.
    if (sb) {
      const { error: incErr } = await sb.rpc("increment_usage_count", { uid: user.id });
      if (incErr) {
        console.warn("[generate] RPC increment failed, falling back:", incErr.message);
        const { data: currentProfile } = await sb
          .from("profiles")
          .select("usage_count")
          .eq("id", user.id)
          .single();
        if (currentProfile) {
          await sb
            .from("profiles")
            .update({ usage_count: (currentProfile.usage_count ?? 0) + 1 })
            .eq("id", user.id);
        }
      }
    }

    // 4. Call Gemini 2.5 Flash
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    let textResponse: string;
    let inputTokens = 0;
    let outputTokens = 0;
    try {
      const genResult = await geminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${userMessage}\n\n[variation-seed: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}]`,
          config: {
            systemInstruction: systemPrompt,
            // Temperatura alta continua (ajuda variedade das aberturas),
            // mas thinking/maxOutput mais conservadores — thinking 5000 +
            // maxOutput 12000 estavam estourando o maxDuration de 60s no
            // Vercel Hobby, causando "Erro interno".
            temperature: 0.95,
            topP: 0.95,
            maxOutputTokens: 10000,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 2000 },
          },
        })
      );
      textResponse = genResult.text || "";
      // Capture real token usage for cost auditing
      const usage = genResult.usageMetadata;
      if (usage) {
        inputTokens = usage.promptTokenCount ?? 0;
        outputTokens = usage.candidatesTokenCount ?? 0;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("[generate] Gemini API error (after retries):", {
        message: msg,
        stack,
        userId: user.id,
        sourceType,
        hasSourceContent: Boolean(sourceContent),
      });
      return Response.json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? `Geração com IA falhou. ${msg.slice(0, 120)}`
              : `Geração com IA falhou. ${msg}`,
        },
        { status: 502 }
      );
    }

    if (!textResponse) {
      return Response.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    // 4. Parse the JSON response (Gemini with responseMimeType=json should return clean JSON)
    let result: GenerateResponse;
    try {
      result = JSON.parse(textResponse);
    } catch {
      // Try extracting JSON from potential wrapper
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("[generate] Failed to parse Gemini response:", textResponse.slice(0, 500));
        return Response.json(
          { error: "Failed to parse AI response" },
          { status: 502 }
        );
      }
    }

    // 5. Validate structure
    if (!result.variations || !Array.isArray(result.variations)) {
      return Response.json(
        { error: "Invalid AI response structure" },
        { status: 502 }
      );
    }

    // 5b. Normalize + sanitize slides:
    //     - variant: apenas corrige inválidos. NÃO força slide 1 = cover
    //       (Gabriel reclamou que os 2 primeiros slides sempre eram iguais).
    //       O prompt já pede pra variar abertura entre variações.
    //     - heading/body: se Gemini esqueceu, preenche fallback pra não crashar.
    for (const variation of result.variations) {
      if (!variation?.slides || !Array.isArray(variation.slides)) continue;
      const total = variation.slides.length;
      variation.slides = variation.slides.map((s, i) => {
        const raw = s as {
          heading?: unknown;
          body?: unknown;
          imageQuery?: unknown;
          variant?: unknown;
        };
        const heading =
          typeof raw.heading === "string" && raw.heading.trim()
            ? raw.heading
            : "(sem título)";
        const body =
          typeof raw.body === "string" && raw.body.trim()
            ? raw.body
            : "";
        const imageQuery =
          typeof raw.imageQuery === "string" ? raw.imageQuery : "";
        // Só força CTA no último (closing sempre precisa fechar o loop).
        // Slide 1 fica como o Gemini decidiu (cover, headline, quote, etc.).
        // Se veio lixo, cai na distribuição de fallback (cover pra o primeiro).
        let variant: SlideVariant;
        if (total <= 1) {
          variant = "cover";
        } else if (i === total - 1) {
          variant = "cta";
        } else {
          variant = normalizeVariant(raw.variant, i, total);
        }
        return { heading, body, imageQuery, variant };
      });

      // Anti-monotonia: se os 2 primeiros slides saíram com o mesmo variant
      // (Gemini às vezes ignora regra), troca o segundo pelo mais contrastante.
      if (variation.slides.length >= 2) {
        const v1 = variation.slides[0].variant;
        const v2 = variation.slides[1].variant;
        if (v1 === v2) {
          const contrast: Record<SlideVariant, SlideVariant> = {
            cover: "split",
            headline: "photo",
            photo: "headline",
            quote: "split",
            split: "photo",
            cta: "headline",
          };
          variation.slides[1] = {
            ...variation.slides[1],
            variant: contrast[v1] ?? "photo",
          };
        }
      }
    }

    // Record generation with real token counts (usage already incremented above)
    if (sb) {
      // Gemini 2.5 Flash pricing (approx): $0.15/1M input, $0.60/1M output
      const costUsd = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);
      try {
        await sb.from("generations").insert({
          user_id: user.id,
          model: "gemini-2.5-flash",
          provider: "google",
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: Math.round(costUsd * 1_000_000) / 1_000_000, // 6 decimal places
          prompt_type: sourceType,
        });
      } catch (e) {
        console.warn("[generate] Failed to record generation:", e);
      }
    }

    getPostHogClient().capture({
      distinctId: user.id,
      event: "carousel_generated",
      properties: {
        source_type: sourceType,
        niche,
        tone,
        language,
        slide_count: result.variations?.[0]?.slides?.length ?? 0,
        variation_count: result.variations?.length ?? 0,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    });

    return Response.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[generate] Unhandled error:", {
      message: msg,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
    });
    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? `Erro interno. ${msg.slice(0, 120)}`
            : msg,
      },
      { status: 500 }
    );
  }
}

