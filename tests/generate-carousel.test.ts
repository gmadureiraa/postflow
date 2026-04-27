import { describe, it, expect } from "vitest";
import {
  validateImageQuery,
  buildFallbackImageQuery,
  VALID_VARIANTS,
} from "../lib/server/generate-carousel";
import { emptyFacts } from "../lib/server/source-ner";

/**
 * Cobertura dos invariantes do pipeline de geração:
 *  - validateImageQuery rejeita queries genéricas (banned keywords)
 *  - validateImageQuery aceita queries específicas (>= 4 palavras + sem banidas)
 *  - buildFallbackImageQuery sempre devolve string não-vazia, mesmo com facts vazios
 *
 * Esses são os pontos onde o LLM geralmente devolve lixo "AI strategy
 * innovation" e a gente precisa filtrar antes de queimar Imagen.
 */
describe("generate-carousel — image query validation", () => {
  describe("validateImageQuery", () => {
    it("rejeita strings vazias", () => {
      expect(validateImageQuery("").ok).toBe(false);
      expect(validateImageQuery("   ").ok).toBe(false);
    });

    it("rejeita strings muito curtas", () => {
      expect(validateImageQuery("ab").ok).toBe(false);
      expect(validateImageQuery("abc").ok).toBe(false);
    });

    it("rejeita queries com poucas palavras", () => {
      expect(validateImageQuery("hand close").ok).toBe(false);
      expect(validateImageQuery("dog walking park").ok).toBe(false);
    });

    it("rejeita keywords genéricas banidas", () => {
      const banned = [
        "ai strategy innovation growth",
        "business success digital transformation",
        "leadership teamwork collaboration office",
        "professional corporate synergy meeting",
      ];
      for (const q of banned) {
        const r = validateImageQuery(q);
        expect(r.ok, `"${q}" deveria ser rejeitada`).toBe(false);
        expect(r.reason).toMatch(/^banned:/);
      }
    });

    it("aceita queries específicas com 4+ palavras e sem banidas", () => {
      const ok = [
        "founder late night laptop monitor glow",
        "bitcoin physical coin macro ledger display",
        "hands on keyboard cinematic film grain",
        "vinyl record turntable warm window light",
      ];
      for (const q of ok) {
        const r = validateImageQuery(q);
        expect(r.ok, `"${q}" deveria passar — reason=${r.reason}`).toBe(true);
      }
    });

    it("não pega 'ai' como banida dentro de outra palavra (aim, mainland)", () => {
      // Regex é word-boundary safe.
      const r = validateImageQuery("aim mainland portrait studio light");
      expect(r.ok).toBe(true);
    });

    it("é case-insensitive ao detectar banidas", () => {
      expect(validateImageQuery("AI Strategy Growth Innovation").ok).toBe(
        false
      );
      expect(validateImageQuery("Synergy Corporate Teamwork meeting").ok).toBe(
        false
      );
    });
  });

  describe("buildFallbackImageQuery", () => {
    it("devolve string não vazia mesmo com facts vazios e heading curto", () => {
      const q = buildFallbackImageQuery("oi", "", emptyFacts());
      expect(q.length).toBeGreaterThan(0);
      // O fallback hardcoded "person hand close up" é o seed mínimo
      expect(q).toContain("close-up");
    });

    it("usa entity do NER quando disponível", () => {
      const facts = {
        ...emptyFacts(),
        entities: ["bitcoin halving"],
      };
      const q = buildFallbackImageQuery("Mercado em alta", "ETH a 5k", facts);
      expect(q.toLowerCase()).toContain("bitcoin halving");
    });

    it("incorpora keywords úteis do heading e body, ignorando banidas", () => {
      const q = buildFallbackImageQuery(
        "Algoritmo do Instagram mudou",
        "engagement caiu drasticamente nas últimas semanas",
        emptyFacts()
      );
      // 'algoritmo' tem mais de 3 letras -> entra no headingClean
      expect(q.toLowerCase()).toContain("algoritmo");
    });

    it("sempre termina com modifier cinematográfico", () => {
      const q = buildFallbackImageQuery("Foo", "bar", emptyFacts());
      expect(q).toMatch(/cinematic|documentary|film/i);
    });
  });

  describe("VALID_VARIANTS", () => {
    it("contém as 9 variantes esperadas pelo render", () => {
      expect(VALID_VARIANTS).toContain("cover");
      expect(VALID_VARIANTS).toContain("cta");
      expect(VALID_VARIANTS).toContain("solid-brand");
      expect(VALID_VARIANTS).toContain("full-photo-bottom");
      expect(VALID_VARIANTS).toContain("text-only");
      expect(VALID_VARIANTS.length).toBe(9);
    });
  });
});
