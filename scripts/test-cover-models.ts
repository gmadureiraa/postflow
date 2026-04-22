/**
 * Gera capas de teste pra comparar Gemini 3.1 Flash Image (mais barato) vs
 * Imagen 4 (atual). Saida em public/brand/test-covers/ pro Gabriel decidir
 * se vale migrar capa pro modelo mais barato.
 *
 * Roda: bun scripts/test-cover-models.ts
 */

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

function loadEnv(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf-8").split("\n")) {
    const m = line.trim().match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(path.resolve(process.cwd(), ".env.vercel.prod"));
const key = env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY missing — run: vercel env pull .env.vercel.prod");

const ai = new GoogleGenAI({ apiKey: key });

const NO_TEXT =
  "ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS anywhere. No signs, billboards, logos, screen text, book covers. If a surface would normally have text, render it blank or blurred.";

const covers = [
  {
    id: "01-reels-morte",
    prompt: `Cinematic editorial photography, medium shot. A young creator sitting alone in a dim minimalist living room at dusk, staring at a phone screen that shows a pulsing red recording dot. Blue hour light streaming from the window on the left, deep shadows on the right. Subject in upper-center third, bottom third darker for text overlay. 35mm lens shallow depth of field, film grain, Netflix thriller mood. Muted palette: navy blue, deep amber, skin tones. Composition stops the scroll. 1:1 Instagram square. ${NO_TEXT}`,
  },
  {
    id: "02-chatgpt-mentir",
    prompt: `Cinematic photorealistic medium shot. A modern office at night, glowing laptop screen casting blue light on the face of a tired engineer looking at it with unease. Behind the engineer, reflections blur into distortion — glitchy doubles. Rim light from the screen, practical warm desk lamp in the corner. Subject center upper third. Bottom third simpler for text. Vogue editorial meets cyber-thriller mood. Palette: electric blue, warm amber, deep charcoal. Film grain, shallow depth of field. 1:1 square. ${NO_TEXT}`,
  },
  {
    id: "03-ceo-invisivel",
    prompt: `Cinematic editorial photography. An empty CEO executive chair at the head of a long corporate boardroom table, illuminated only by a single dramatic spotlight from above, while around the table sit executives whose faces are half-lit and turned toward the empty chair with uneasy expressions. Hard top-down lighting, deep shadows, theatrical composition. Rule of thirds: empty chair in upper center third, bottom third darker for text. Wall Street Journal documentary meets Succession HBO mood. Muted palette: charcoal, oxblood red, champagne. Film grain, 50mm prime. 1:1 square. ${NO_TEXT}`,
  },
];

async function generateWithGeminiFlash(prompt: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseModalities: ["IMAGE"] },
    });
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inline = (p as any).inlineData;
      if (inline?.data) return inline.data as string;
    }
    return null;
  } catch (err) {
    console.error("gemini flash error:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function generateWithImagen4(prompt: string): Promise<string | null> {
  try {
    const res = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: { numberOfImages: 1, aspectRatio: "1:1" },
    });
    const bytes = res.generatedImages?.[0]?.image?.imageBytes;
    return bytes ?? null;
  } catch (err) {
    console.error("imagen4 error:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  const outDir = path.resolve(process.cwd(), "public/brand/test-covers");
  fs.mkdirSync(outDir, { recursive: true });

  for (const c of covers) {
    console.log(`→ ${c.id}...`);
    const [flash, imagen] = await Promise.all([
      generateWithGeminiFlash(c.prompt),
      generateWithImagen4(c.prompt),
    ]);

    if (flash) {
      const p = path.join(outDir, `${c.id}__flash.jpg`);
      fs.writeFileSync(p, Buffer.from(flash, "base64"));
      console.log(`  ✓ flash ${Math.round(fs.statSync(p).size / 1024)}kb`);
    } else {
      console.log("  ✗ flash failed");
    }

    if (imagen) {
      const p = path.join(outDir, `${c.id}__imagen4.jpg`);
      fs.writeFileSync(p, Buffer.from(imagen, "base64"));
      console.log(`  ✓ imagen4 ${Math.round(fs.statSync(p).size / 1024)}kb`);
    } else {
      console.log("  ✗ imagen4 failed");
    }
  }

  console.log(`\ndone. compare side-by-side em ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
