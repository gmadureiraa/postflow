/**
 * Helpers compartilhados pelos templates do Sequência Viral.
 *
 * - `resolveImgSrc`: roteia imagens externas pelo proxy same-origin quando
 *   em modo export (senão `html-to-image` gera canvas tainted).
 * - `renderRichText`: suporta `**bold**` inline para ênfase dentro do body.
 */

import * as React from "react";

export function resolveImgSrc(
  url: string | undefined,
  exportMode: boolean
): string | undefined {
  if (!url) return undefined;
  if (!exportMode) return url;
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/"))
    return url;
  try {
    const u = new URL(url);
    if (typeof window !== "undefined" && u.origin === window.location.origin) {
      return url;
    }
    return `/api/img-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

export function renderRichText(
  text: string,
  accent?: string
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement(
        "strong",
        {
          key: i,
          style: { fontWeight: 800, color: accent },
        },
        part.slice(2, -2)
      );
    }
    return React.createElement("span", { key: i }, part);
  });
}

/** Dimensões reais do canvas Instagram 4:5 usado por todos os templates. */
export const CANVAS_W = 1080;
export const CANVAS_H = 1350;

/** Stack mono reutilizável. Gridlite é carregada via @font-face em globals.css. */
export const MONO_STACK =
  '"Gridlite", "JetBrains Mono", "Courier New", ui-monospace, monospace';
