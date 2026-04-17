/**
 * Design templates (visual / Figma) vs creation modes (quick vs guided).
 * Single source of truth for block counts and export metadata.
 */

export type DesignTemplateId = "twitter" | "principal" | "futurista" | "autoral";

export type CreationMode = "quick" | "guided";

export const DESIGN_TEMPLATES: {
  id: DesignTemplateId;
  emoji: string;
  name: string;
  desc: string;
  color: string;
  /** Target text blocks for Content Machine render / quick generation */
  blockCount: number;
  figmaLabel: string;
}[] = [
  {
    id: "twitter",
    emoji: "🐦",
    name: "Twitter",
    desc: "Estilo tweet screenshot · 6–10 slides",
    color: "#0ea5e9",
    blockCount: 21,
    figmaLabel: "Template Twitter",
  },
  {
    id: "principal",
    emoji: "📰",
    name: "Principal",
    desc: "Imagem hero + texto bold · 18 blocos",
    color: "#EC6000",
    blockCount: 18,
    figmaLabel: "Template Principal",
  },
  {
    id: "futurista",
    emoji: "🔮",
    name: "Futurista",
    desc: "Editorial limpo · 14 textos",
    color: "#2563eb",
    blockCount: 14,
    figmaLabel: "Template Futurista",
  },
  {
    id: "autoral",
    emoji: "✍️",
    name: "Autoral",
    desc: "Narrativa contínua · 18 blocos",
    color: "#16a34a",
    blockCount: 18,
    figmaLabel: "Template Autoral",
  },
] as const;

export const V2_TEMPLATE_COLORS: Record<Exclude<DesignTemplateId, "twitter">, { bg: string; accent: string }> = {
  principal: { bg: "#0A0A0A", accent: "#EC6000" },
  futurista: { bg: "#F8FAFC", accent: "#2563eb" },
  autoral: { bg: "#0A0A0A", accent: "#16a34a" },
};

export function getDesignTemplateMeta(id: DesignTemplateId) {
  return DESIGN_TEMPLATES.find((t) => t.id === id) ?? DESIGN_TEMPLATES[0];
}

/** Rules for Content Machine `render` step (aligned with /api/generate-v2). */
export const CONTENT_MACHINE_RENDER_SPECS: Record<
  DesignTemplateId,
  { blocks: number; rules: string }
> = {
  principal: {
    blocks: 18,
    rules:
      "Exatamente 18 blocos. Alternância entre blocos mais curtos e mais densos. A capa deve preservar reenquadramento + stake + mecanismo.",
  },
  futurista: {
    blocks: 14,
    rules: "Exatamente 14 textos para 10 slides. Compactação maior. Blocos densos e concisos.",
  },
  autoral: {
    blocks: 18,
    rules:
      "Exatamente 18 blocos. Progressão narrativa contínua. Preservar o mecanismo central ao longo do desenvolvimento.",
  },
  twitter: {
    blocks: 21,
    rules:
      "Exatamente 21 blocos. Estrutura fragmentada estilo thread. Manter continuidade lógica entre os blocos.",
  },
};

/** Tweet-style in-app preview + PNG/PDF; outros usam export Figma / lista de blocos. */
export function usesTweetStylePreview(template: DesignTemplateId): boolean {
  return template === "twitter";
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
    `Modo: ${payload.creationMode === "guided" ? "Guiado (Content Machine)" : "Rápido"}`,
    `Arquivo: ${payload.figmaFileUrl}`,
    "",
    "--- Blocos (cole no plugin na ordem) ---",
    "",
    ...payload.blocks.map((b, i) => `${i + 1}. ${b.replace(/^texto\s+\d+\s*[-–—]\s*/i, "").trim()}`),
  ];
  return lines.join("\n");
}
