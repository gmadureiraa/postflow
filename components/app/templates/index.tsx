"use client";

import { forwardRef } from "react";
import TemplateManifesto from "./template-manifesto";
import TemplateFuturista from "./template-futurista";
import TemplateAutoral from "./template-autoral";
import TemplateTwitter from "./template-twitter";
import type { SlideProps, TemplateId, TemplateMeta } from "./types";

export type { SlideProps, TemplateId, TemplateMeta } from "./types";

/**
 * Orchestrator — escolhe o template certo baseado em `templateId`.
 * Repassa ref e todas as props de `SlideProps` pro componente alvo.
 */
export const TemplateRenderer = forwardRef<
  HTMLDivElement,
  SlideProps & { templateId: TemplateId }
>(function TemplateRenderer({ templateId, ...rest }, ref) {
  switch (templateId) {
    case "manifesto":
      return <TemplateManifesto ref={ref} {...rest} />;
    case "futurista":
      return <TemplateFuturista ref={ref} {...rest} />;
    case "autoral":
      return <TemplateAutoral ref={ref} {...rest} />;
    case "twitter":
      return <TemplateTwitter ref={ref} {...rest} />;
    default:
      return <TemplateTwitter ref={ref} {...rest} />;
  }
});

/** Metadados pra picker de template na UI (nome, kicker, paleta de preview). */
export const TEMPLATES_META: TemplateMeta[] = [
  {
    id: "manifesto",
    name: "Manifesto",
    kicker: "Nº 01 · EDITORIAL",
    palette: ["#0A0A0A", "#7CF067", "#F7F5EF"],
  },
  {
    id: "futurista",
    name: "Futurista",
    kicker: "Nº 02 · TECH",
    palette: ["#0B0F1E", "#00F0A0", "#FFFFFF"],
  },
  {
    id: "autoral",
    name: "Autoral",
    kicker: "Nº 03 · ZINE",
    palette: ["#F7F5EF", "#D262B2", "#0A0A0A"],
  },
  {
    id: "twitter",
    name: "Twitter v2",
    kicker: "Nº 04 · SCREENSHOT",
    palette: ["#FFFFFF", "#1D9BF0", "#0A0A0A"],
  },
];

export { TemplateManifesto, TemplateFuturista, TemplateAutoral, TemplateTwitter };
