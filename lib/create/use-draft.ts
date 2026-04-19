"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  fetchUserCarousel,
  isCarouselUuid,
  upsertUserCarousel,
  type SavedCarousel,
} from "@/lib/carousel-storage";
import type { TemplateId as VisualTemplateId } from "@/components/app/templates/types";
import type { CreateSlide } from "./types";

/**
 * Hooks pra carregar e salvar rascunhos. Reaproveita `upsertUserCarousel` /
 * `fetchUserCarousel` do arquivo legado — lógica Supabase intacta.
 */

export interface DraftPayload {
  title: string;
  slides: CreateSlide[];
  slideStyle: "white" | "dark";
  visualTemplate?: VisualTemplateId;
  status?: "draft" | "published" | "archived";
}

export function useDraft(id: string | null) {
  const [draft, setDraft] = useState<SavedCarousel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !supabase) return;
    if (!isCarouselUuid(id)) {
      setError("Rascunho inválido.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const c = await fetchUserCarousel(supabase!, id);
        if (cancelled) return;
        if (!c) {
          setError("Rascunho não encontrado.");
          return;
        }
        setDraft(c);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar rascunho.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { draft, setDraft, loading, error };
}

export function useSaveDraft(userId: string | null, _session: Session | null) {
  const saveNow = useCallback(
    async (
      id: string | null,
      payload: DraftPayload
    ): Promise<SavedCarousel | null> => {
      if (!userId || !supabase) return null;
      const { row, inserted } = await upsertUserCarousel(supabase, userId, {
        id,
        title: payload.title,
        slides: payload.slides,
        slideStyle: payload.slideStyle,
        status: payload.status ?? "draft",
        visualTemplate: payload.visualTemplate,
      });
      return {
        id: row.id,
        title: row.title ?? payload.title,
        slides: payload.slides,
        style: payload.slideStyle,
        savedAt: row.updated_at || row.created_at,
        status: payload.status ?? "draft",
        visualTemplate: payload.visualTemplate,
        _inserted: inserted,
      } as SavedCarousel & { _inserted: boolean };
    },
    [userId]
  );
  return { saveNow };
}

/** Auto-save debounced (1200ms) — devolve estado idle/saving/saved. */
export function useAutoSaveDraft({
  userId,
  id,
  slides,
  title,
  slideStyle,
  visualTemplate,
  enabled,
}: {
  userId: string | null;
  id: string | null;
  slides: CreateSlide[];
  title: string;
  slideStyle: "white" | "dark";
  visualTemplate?: VisualTemplateId;
  enabled: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || !userId || !id || !supabase) return;
    if (slides.length === 0) return;
    const serialized = JSON.stringify({
      slides,
      title,
      slideStyle,
      visualTemplate,
    });
    if (serialized === lastRef.current) return;

    const handle = window.setTimeout(async () => {
      setStatus("saving");
      try {
        await upsertUserCarousel(supabase!, userId, {
          id,
          title,
          slides,
          slideStyle,
          status: "draft",
          visualTemplate,
        });
        lastRef.current = serialized;
        setStatus("saved");
        window.setTimeout(() => setStatus("idle"), 1500);
      } catch {
        setStatus("idle");
      }
    }, 1200);

    return () => window.clearTimeout(handle);
  }, [enabled, userId, id, slides, title, slideStyle, visualTemplate]);

  return { status };
}
