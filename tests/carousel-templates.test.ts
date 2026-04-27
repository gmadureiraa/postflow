import { describe, it, expect } from "vitest";
import {
  DESIGN_TEMPLATES,
  DEFAULT_DESIGN_TEMPLATE,
  buildTemplateLockBlock,
  getDesignTemplateMeta,
  normalizeDesignTemplate,
} from "../lib/carousel-templates";

/**
 * Garantias de invariantes do sistema de templates:
 * - normalize aceita só IDs válidos + faz aliasing de IDs legados
 * - buildTemplateLockBlock injeta os 5 campos críticos do meta no prompt
 * - todo template tem styleGuide / modifier / palette consistentes
 *
 * Esses testes barram o regress mais comum: alguém adicionar um template
 * novo e esquecer de popular preferPalette/avoidPalette ou modifier.
 */

describe("carousel-templates", () => {
  describe("normalizeDesignTemplate", () => {
    it("aceita os 6 IDs canônicos", () => {
      const ids = [
        "twitter",
        "manifesto",
        "futurista",
        "autoral",
        "ambitious",
        "blank",
      ] as const;
      for (const id of ids) {
        expect(normalizeDesignTemplate(id)).toBe(id);
      }
    });

    it("normaliza case + trim", () => {
      expect(normalizeDesignTemplate(" Manifesto ")).toBe("manifesto");
      expect(normalizeDesignTemplate("FUTURISTA")).toBe("futurista");
    });

    it("aplica aliases legados editorial/spotlight → manifesto", () => {
      expect(normalizeDesignTemplate("editorial")).toBe("manifesto");
      expect(normalizeDesignTemplate("spotlight")).toBe("manifesto");
    });

    it("retorna default em input inválido", () => {
      expect(normalizeDesignTemplate("xyz")).toBe(DEFAULT_DESIGN_TEMPLATE);
      expect(normalizeDesignTemplate(undefined)).toBe(DEFAULT_DESIGN_TEMPLATE);
      expect(normalizeDesignTemplate(null)).toBe(DEFAULT_DESIGN_TEMPLATE);
      // 123 não é string — deve cair no default sem crashar
      expect(
        normalizeDesignTemplate(123 as unknown as string)
      ).toBe(DEFAULT_DESIGN_TEMPLATE);
    });
  });

  describe("buildTemplateLockBlock", () => {
    it("injeta nome + ID + blockCount no bloco", () => {
      const block = buildTemplateLockBlock("manifesto");
      expect(block).toContain("Manifesto");
      expect(block).toContain("id: manifesto");
      expect(block).toContain("Quantidade de slides alvo: 10");
    });

    it("injeta styleGuide do template no bloco", () => {
      const block = buildTemplateLockBlock("futurista");
      const meta = getDesignTemplateMeta("futurista");
      expect(block).toContain(meta.styleGuidePrompt);
    });

    it("injeta modifier estético único no bloco", () => {
      const block = buildTemplateLockBlock("autoral");
      const meta = getDesignTemplateMeta("autoral");
      expect(block).toContain(meta.slideAestheticModifier);
    });

    it("injeta paleta prefer + avoid no bloco", () => {
      const block = buildTemplateLockBlock("blank");
      const meta = getDesignTemplateMeta("blank");
      for (const c of meta.preferPalette) expect(block).toContain(c);
      for (const c of meta.avoidPalette) expect(block).toContain(c);
    });

    it("declara que o template VENCE em conflito de briefing", () => {
      const block = buildTemplateLockBlock("twitter");
      // Frase chave da regra inviolável — barreira anti-improviso da IA
      expect(block.toUpperCase()).toContain("TEMPLATE VENCE");
    });

    it("força slide 1 cover + último cta", () => {
      const block = buildTemplateLockBlock("ambitious");
      expect(block).toContain('variant="cover"');
      expect(block).toContain('variant="cta"');
    });
  });

  describe("invariantes globais dos 6 templates", () => {
    it("cada template tem todos os campos críticos populados", () => {
      for (const t of DESIGN_TEMPLATES) {
        expect(t.id).toBeTruthy();
        expect(t.name.length).toBeGreaterThan(0);
        expect(t.styleGuidePrompt.length).toBeGreaterThan(50);
        expect(t.slideAestheticModifier.length).toBeGreaterThan(10);
        expect(t.preferPalette.length).toBeGreaterThan(0);
        // avoidPalette pode ser vazio (twitter) — só checar que é array
        expect(Array.isArray(t.avoidPalette)).toBe(true);
        expect(t.blockCount).toBeGreaterThanOrEqual(6);
        expect(t.blockCount).toBeLessThanOrEqual(20);
      }
    });

    it("preferPalette e avoidPalette nunca colidem (mesmo template)", () => {
      for (const t of DESIGN_TEMPLATES) {
        const inter = t.preferPalette.filter((c) =>
          t.avoidPalette.includes(c)
        );
        expect(inter, `${t.id}: ${inter.join(",")} em prefer E avoid`).toEqual(
          []
        );
      }
    });

    it("todo cor é hex válido nas paletas", () => {
      const hexRe = /^#[0-9A-F]{6}$/i;
      for (const t of DESIGN_TEMPLATES) {
        for (const c of [...t.preferPalette, ...t.avoidPalette]) {
          expect(c, `${t.id}: ${c} não é hex válido`).toMatch(hexRe);
        }
      }
    });
  });
});
