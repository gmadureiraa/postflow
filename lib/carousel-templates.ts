/**
 * Templates visuais do produto. Cada um define:
 * - Render visual (em components/app/templates/)
 * - Style guide de imagem (Imagen + Serper qualifiers)
 * - Paleta e mood coerentes entre os 8 slides de um carrossel
 */

export type DesignTemplateId = "twitter" | "manifesto" | "futurista" | "autoral";

/** Template default quando nada é especificado. */
export const DEFAULT_DESIGN_TEMPLATE: DesignTemplateId = "manifesto";

export type CreationMode = "quick" | "guided";

/** Preferência de pessoas em fotos (busca stock + prompt Imagen). */
export type ImagePeopleMode = "auto" | "with_people" | "no_people";

export function normalizeImagePeopleMode(
  raw: string | null | undefined
): ImagePeopleMode {
  if (raw === "with_people" || raw === "no_people") return raw;
  return "auto";
}

/** Sufixo curto em inglês para busca de imagens (Serper/Unsplash). */
export function imagePeopleModeSearchSuffix(mode: ImagePeopleMode): string {
  switch (mode) {
    case "with_people":
      return "real people candid professional photography authentic portrait lifestyle";
    case "no_people":
      return "no people empty scene still life architecture texture object detail";
    default:
      return "";
  }
}

/** Instruções extras para o prompt do Imagen (inglês). */
export function imagePeopleModeImagenInstruction(mode: ImagePeopleMode): string {
  switch (mode) {
    case "with_people":
      return "Include one or more realistic adult human subjects naturally integrated into the scene; diverse, natural poses and expressions; photorealistic skin and fabric.";
    case "no_people":
      return "Strictly no people: no faces, no full bodies, no silhouettes that read as persons. Focus on environment, objects, hands-free workspace, architecture, nature, or abstract detail.";
    default:
      return "If the slide theme implies people or human activity, show believable diverse adults in natural light; otherwise prefer strong environmental or object photography without inventing people.";
  }
}

/** Regras narrativas do Content Machine (render). */
const CONTENT_MACHINE_NARRATIVE_RULES =
  "Narrativa contínua estilo editorial premium: alternância de ritmo, micro-ganchos entre blocos, capa forte + fechamento com CTA que referencia o gancho inicial. É melhor entregar menos blocos densos do que inflar com filler.";

export interface DesignTemplateMeta {
  id: DesignTemplateId;
  emoji: string;
  name: string;
  desc: string;
  color: string;
  blockCount: number;
  figmaLabel: string;
  /** Qualifiers pra busca stock (Serper Google Images). */
  imageSearchStyleHint: string;
  /** Fragmento curto do prompt Imagen — mantido pra retrocompat. */
  imageGenRealismFragment: string;
  /** Style guide completo injetado no Imagen pra coerência visual. */
  styleGuidePrompt: string;
  /** Modifier estético único usado em TODOS os slides deste template. */
  slideAestheticModifier: string;
  /** Palette hex que o Imagen deve favorecer (acento do template). */
  preferPalette: string[];
  /** Palette que o Imagen deve evitar (conflita com accent). */
  avoidPalette: string[];
}

export const DESIGN_TEMPLATES: DesignTemplateMeta[] = [
  {
    id: "manifesto",
    emoji: "▓",
    name: "Manifesto",
    desc: "Editorial premium: creme + preto, serif condensada, fotografia documental silenciosa (ref: BrandsDecoded, Kinfolk, Apartamento).",
    color: "#0A0A0A",
    blockCount: 10,
    figmaLabel: "Template Manifesto",
    imageSearchStyleHint:
      "editorial photography magazine spread natural window light film grain muted palette kinfolk aesthetic -watermark -shutterstock -getty -istock -dreamstime",
    imageGenRealismFragment:
      "Editorial magazine photograph, muted palette, soft window light, 35mm film grain. Looks like a real photo from a print magazine — not illustration, not 3D render.",
    styleGuidePrompt:
      "Editorial magazine photography in BrandsDecoded / Kinfolk reference aesthetic: muted off-white and warm cream backgrounds, deep black as accent. Soft directional window light, long soft shadows, 35mm film grain barely perceptible, medium format compression. Close-up editorial crops or medium portraits — never wide landscape. Natural unsaturated skin tones, fabric texture visible. Mood: silent, premium, print magazine, 1990s Kinfolk meets Apartamento. Camera: Mamiya RZ67 equivalent, f/2.8, slight film halation on highlights. AVOID: neon, teal, cyan, hot pink, high saturation, 3D render, stock office imagery, smiling on-camera subjects, corporate handshakes.",
    slideAestheticModifier:
      "editorial photography documentary style natural window light 35mm film grain muted cream palette",
    preferPalette: ["#F7F5EF", "#0A0A0A", "#8A6C4A", "#B97E5A"],
    avoidPalette: ["#00F0A0", "#7CF067", "#D262B2", "#1D9BF0"],
  },
  {
    id: "futurista",
    emoji: "◉",
    name: "Futurista",
    desc: "Dark tech editorial: navy profundo + highlight mint/teal, luz azul fria, fotografia moody tipo Bloomberg Tech.",
    color: "#00F0A0",
    blockCount: 10,
    figmaLabel: "Template Futurista",
    imageSearchStyleHint:
      "dark moody tech photography blue hour monitor glow shallow depth of field bloomberg businessweek aesthetic -watermark -shutterstock -getty -istock",
    imageGenRealismFragment:
      "Moody dark environmental photograph, deep navy and charcoal tones, single cold highlight. Real photo, not illustration, not 3D render.",
    styleGuidePrompt:
      "Moody dark environmental photography for tech/finance editorial: deep navy and charcoal backgrounds, single teal-mint highlight (screen glow or reflected light only — never full scene tint). Directional cold hard light from single source (monitor glow, street sodium, blue hour window). High contrast, deep shadows, specular highlights on metal/glass. Camera: Sony A7 + 35mm f/1.4, shallow DoF, documentary candid. Subjects: hands on keyboard, desk detail, hardware, data center interiors, night cityscapes through glass. Mood: late night deep work, Bloomberg Businessweek, Dwell tech issue. AVOID: warm golden hour, outdoor daylight nature, green foliage, faces smiling at camera, stock office clichés, laptop with visible UI text.",
    slideAestheticModifier:
      "moody dark tech photography cold blue hour monitor glow shallow depth of field cinematic",
    preferPalette: ["#0B0F1E", "#1A2233", "#00F0A0", "#0F1C2E"],
    avoidPalette: ["#F7F5EF", "#F5E8D0", "#FFC79A", "#7CF067"],
  },
  {
    id: "autoral",
    emoji: "✦",
    name: "Autoral",
    desc: "Zine editorial: creme + pink sutil, serif italic, polaroid. Referência: diário editorial, fotografia 35mm quente.",
    color: "#D262B2",
    blockCount: 10,
    figmaLabel: "Template Autoral",
    imageSearchStyleHint:
      "warm 35mm film photography portrait natural light zine editorial analog grain kodak portra 400 -watermark -shutterstock -getty -istock",
    imageGenRealismFragment:
      "Warm 35mm film portrait or intimate scene, Kodak Portra 400 palette, analog grain. Real photo, not illustration, not 3D render.",
    styleGuidePrompt:
      "Warm 35mm film photography in zine / editorial diary aesthetic: Kodak Portra 400 palette (warm skin tones, amber highlights, muted greens), analog grain, slight light leak on edges. Natural indoor light (window, candle, reading lamp) or golden hour outdoor. Intimate scale: single subject, close composition, portrait or object detail. Camera: Pentax K1000 + 50mm f/1.8 or Contax T2. Mood: personal diary, Apartamento Magazine, The Gentlewoman, quiet confession. AVOID: cold light, neon, 3D render, stock corporate, wide landscape, multiple subjects crowding frame, high saturation synthetic colors.",
    slideAestheticModifier:
      "warm 35mm film photography analog grain kodak portra natural light intimate scale",
    preferPalette: ["#F7F5EF", "#D262B2", "#B97E5A", "#8A6C4A"],
    avoidPalette: ["#00F0A0", "#1D9BF0", "#0B0F1E"],
  },
  {
    id: "twitter",
    emoji: "𝕏",
    name: "Thread (Twitter/X)",
    desc: "Screenshot de thread: avatar, handle, texto e foto attachment. Fotografia candid autêntica, tipo post pessoal.",
    color: "#1D9BF0",
    blockCount: 16,
    figmaLabel: "Template Thread",
    imageSearchStyleHint:
      "candid iphone photography authentic social media natural light unfiltered real life -watermark -shutterstock -getty -istock",
    imageGenRealismFragment:
      "Candid photograph suitable for a social thread post: natural light, authentic environment, believable imperfect composition. Looks like a real iPhone photo — not illustration, not 3D render, not anime.",
    styleGuidePrompt:
      "Candid authentic photography that looks like a real iPhone shot someone posted to a social thread: natural uncomplicated light, authentic environment, believable imperfect composition (slight tilt OK, not centered perfectly), real texture, no obvious staging. Subjects: real people in normal life, objects on a desk, food, hands, cityscape from window. Mood: unfiltered moment, screenshot from real feed. AVOID: studio lighting, perfectly centered composition, obvious stock photography, 3D render, illustration, anime, watermark.",
    slideAestheticModifier:
      "candid authentic iphone photography natural light unfiltered real moment",
    preferPalette: ["#FFFFFF", "#0A0A0A", "#1D9BF0"],
    avoidPalette: [],
  },
] as const;

export const EDITORIAL_ACCENT = "#FF5500";
export const EDITORIAL_BG_DARK = "#121212";
export const EDITORIAL_BG_LIGHT = "#fafafa";

export function getDesignTemplateMeta(id: DesignTemplateId) {
  return DESIGN_TEMPLATES.find((t) => t.id === id) ?? DESIGN_TEMPLATES[0];
}

const VALID_TEMPLATE_IDS: readonly DesignTemplateId[] = [
  "manifesto",
  "futurista",
  "autoral",
  "twitter",
];

/** Normaliza qualquer string em um DesignTemplateId válido (default: manifesto). */
export function normalizeDesignTemplate(
  raw: string | null | undefined
): DesignTemplateId {
  if (typeof raw !== "string") return DEFAULT_DESIGN_TEMPLATE;
  const v = raw.trim().toLowerCase();
  if ((VALID_TEMPLATE_IDS as readonly string[]).includes(v)) {
    return v as DesignTemplateId;
  }
  // Aliases legados
  if (v === "editorial" || v === "spotlight") return "manifesto";
  return DEFAULT_DESIGN_TEMPLATE;
}

export const CONTENT_MACHINE_RENDER_SPECS: Record<
  DesignTemplateId,
  { blocks: number; rules: string }
> = {
  manifesto: { blocks: 8, rules: CONTENT_MACHINE_NARRATIVE_RULES },
  futurista: { blocks: 8, rules: CONTENT_MACHINE_NARRATIVE_RULES },
  autoral: { blocks: 8, rules: CONTENT_MACHINE_NARRATIVE_RULES },
  twitter: { blocks: 10, rules: CONTENT_MACHINE_NARRATIVE_RULES },
};

export function usesNativeSlidePreview(_template: DesignTemplateId): boolean {
  return true;
}

/** @deprecated */
export function usesTweetStylePreview(_template: DesignTemplateId): boolean {
  return true;
}

export type PluginExportPayload = {
  version: 1;
  designTemplate: DesignTemplateId;
  creationMode: CreationMode;
  figmaFileUrl: string;
  generatedAt: string;
  blocks: string[];
};

const FIGMA_TEMPLATES_URL =
  "https://www.figma.com/design/K503FED5B8c6xQbwjgS9wp/Templates-%7C-Content-Machine-4.0";

export function buildContentMachinePluginExport(args: {
  designTemplate: DesignTemplateId;
  creationMode: CreationMode;
  blocks: string[];
}): PluginExportPayload {
  return {
    version: 1,
    designTemplate: args.designTemplate,
    creationMode: args.creationMode,
    figmaFileUrl: FIGMA_TEMPLATES_URL,
    generatedAt: new Date().toISOString(),
    blocks: args.blocks,
  };
}

export function pluginExportToPrettyText(payload: PluginExportPayload): string {
  const meta = getDesignTemplateMeta(payload.designTemplate);
  const lines = [
    `Postflow → Content Machine (template Figma: ${meta.figmaLabel})`,
    `Modo: ${payload.creationMode === "guided" ? "Avançado (Content Machine)" : "Rápido"}`,
    `Arquivo: ${payload.figmaFileUrl}`,
    "",
    "--- Blocos (cole no plugin na ordem) ---",
    "",
    ...payload.blocks.map((b, i) => `${i + 1}. ${b.replace(/^texto\s+\d+\s*[-–—]\s*/i, "").trim()}`),
  ];
  return lines.join("\n");
}
