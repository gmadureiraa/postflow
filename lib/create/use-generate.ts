"use client";

import { useCallback, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { jsonWithAuth } from "@/lib/api-auth-headers";
import type { CreateConcept, CreateVariation } from "./types";

/**
 * Hooks de chamada pras rotas de geração de conteúdo. Extraído de
 * `app/app/create/page.tsx` (versão legada) pra reaproveitar no fluxo novo.
 */

export interface GenerateConceptsInput {
  topic: string;
  niche: string;
  tone: string;
  language: string;
}

export interface GenerateCarouselInput {
  concept: CreateConcept;
  niche: string;
  tone: string;
  language: string;
  designTemplate?: string;
  sourceType?: "idea" | "link" | "video" | "instagram" | "ai";
  sourceUrl?: string;
}

export function useGenerate(session: Session | null) {
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateConcepts = useCallback(
    async (input: GenerateConceptsInput): Promise<CreateConcept[]> => {
      setError(null);
      setLoadingConcepts(true);
      try {
        const res = await fetch("/api/generate-concepts", {
          method: "POST",
          headers: jsonWithAuth(session),
          body: JSON.stringify(input),
        });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const raw = await res.text();
          throw new Error(raw.slice(0, 200));
        }
        const data: { concepts?: CreateConcept[]; error?: string } =
          await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao gerar conceitos.");
        if (!data.concepts?.length)
          throw new Error("Nenhum conceito gerado. Tente outro tópico.");
        return data.concepts;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao gerar conceitos.";
        setError(msg);
        throw err;
      } finally {
        setLoadingConcepts(false);
      }
    },
    [session]
  );

  const generateCarousel = useCallback(
    async (input: GenerateCarouselInput): Promise<CreateVariation[]> => {
      setError(null);
      setLoadingCarousel(true);
      try {
        const { concept } = input;
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: jsonWithAuth(session),
          body: JSON.stringify({
            topic: `${concept.title}\n\nHook: ${concept.hook}\nAngle: ${concept.angle}\nStyle: ${concept.style}`,
            sourceType: input.sourceType ?? "idea",
            sourceUrl: input.sourceUrl,
            niche: input.niche,
            tone: input.tone,
            language: input.language,
            designTemplate: input.designTemplate ?? "twitter",
          }),
        });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const raw = await res.text();
          throw new Error(raw.slice(0, 200));
        }
        const data: { variations?: CreateVariation[]; error?: string } =
          await res.json();
        if (!res.ok) throw new Error(data.error || "Falha na geração.");
        if (!data.variations?.length)
          throw new Error("Nenhum carrossel gerado.");
        return data.variations;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao gerar carrossel.";
        setError(msg);
        throw err;
      } finally {
        setLoadingCarousel(false);
      }
    },
    [session]
  );

  return {
    generateConcepts,
    generateCarousel,
    loadingConcepts,
    loadingCarousel,
    error,
  };
}
