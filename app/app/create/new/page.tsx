"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { upsertUserCarousel } from "@/lib/carousel-storage";
import { useGenerate } from "@/lib/create/use-generate";
import { makeMockSlides } from "@/lib/create/types";

/**
 * Tela 01 — Nova criação (novo carrossel). Baseado em `v-new` do handoff.
 * Usuário digita ideia → gera conceitos via /api/generate-concepts →
 * persiste rascunho inicial com slides mock → navega pra /[id]/templates.
 */

type SlidesCount = 6 | 8 | 10 | 12;
type Tone = "editorial" | "informal" | "direto" | "provocativo";
type Cta = "seguir" | "salvar" | "compartilhar" | "comentar";
type Lang = "pt-br" | "en";

const SHORTCUTS: { label: string; seed: string }[] = [
  { label: "+ Análise de lançamento", seed: "Análise do lançamento do novo produto X" },
  { label: "+ Case em 5 lições", seed: "5 lições do case Y para marcas pequenas" },
  { label: "+ Opinião polêmica", seed: "Por que a estratégia Z não vai funcionar" },
  { label: "+ Resumir link", seed: "Colar aqui o link de uma matéria" },
];

const SLIDES_OPTS: SlidesCount[] = [6, 8, 10, 12];
const TONE_OPTS: { id: Tone; label: string }[] = [
  { id: "editorial", label: "Editorial" },
  { id: "informal", label: "Informal" },
  { id: "direto", label: "Direto" },
  { id: "provocativo", label: "Provocativo" },
];
const CTA_OPTS: { id: Cta; label: string }[] = [
  { id: "seguir", label: "Seguir" },
  { id: "salvar", label: "Salvar" },
  { id: "compartilhar", label: "Compartilhar" },
  { id: "comentar", label: "Comentar" },
];
const LANG_OPTS: { id: Lang; label: string }[] = [
  { id: "pt-br", label: "PT-BR" },
  { id: "en", label: "EN" },
];

function OptCycler<T extends string | number>({
  label,
  value,
  options,
  onChange,
  formatter,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  formatter?: (v: T) => string;
}) {
  const idx = options.indexOf(value);
  const next = () => {
    const ni = (idx + 1) % options.length;
    onChange(options[ni]);
  };
  const display = formatter ? formatter(value) : String(value);
  return (
    <button
      type="button"
      onClick={next}
      className="flex items-center justify-between px-4 py-[14px] transition-all"
      style={{
        background: "var(--sv-white)",
        border: "1.5px solid var(--sv-ink)",
        boxShadow: "0 0 0 0 var(--sv-ink)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-1px,-1px)";
        e.currentTarget.style.boxShadow = "3px 3px 0 0 var(--sv-ink)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0,0)";
        e.currentTarget.style.boxShadow = "0 0 0 0 var(--sv-ink)";
      }}
    >
      <span
        style={{
          fontFamily: "var(--sv-sans)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--sv-ink)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--sv-ink)",
          fontWeight: 700,
        }}
      >
        {display}
      </span>
    </button>
  );
}

export default function NewCarouselPage() {
  const router = useRouter();
  const { user, session, profile } = useAuth();
  const { generateConcepts, loadingConcepts } = useGenerate(session);

  const [idea, setIdea] = useState("");
  const [slidesCount, setSlidesCount] = useState<SlidesCount>(8);
  const [tone, setTone] = useState<Tone>("editorial");
  const [cta, setCta] = useState<Cta>("seguir");
  const [lang, setLang] = useState<Lang>("pt-br");

  const niche = useMemo(() => {
    const blob = (profile?.niche ?? []).join(" ").toLowerCase();
    if (blob.includes("cripto") || blob.includes("web3")) return "crypto";
    if (blob.includes("ia") || blob.includes("automa")) return "ai";
    if (blob.includes("market") || blob.includes("mkt")) return "marketing";
    return "business";
  }, [profile]);

  async function handleGenerate() {
    if (!idea.trim()) {
      toast.error("Escreva uma ideia antes de gerar.");
      return;
    }
    if (!user || !supabase) {
      toast.error("Faça login para criar um carrossel.");
      return;
    }
    try {
      // 1. Gera conceitos (barato, ~3s)
      const concepts = await generateConcepts({
        topic: idea,
        niche,
        tone,
        language: lang,
      });
      const chosen = concepts[0];
      const title = chosen?.title || idea.slice(0, 60);

      // 2. Persiste rascunho inicial com slides mock.
      const mockSlides = makeMockSlides(chosen?.title ?? idea, slidesCount);

      const { row } = await upsertUserCarousel(supabase, user.id, {
        id: null,
        title,
        slides: mockSlides,
        slideStyle: "white",
        status: "draft",
      });

      // 3. Navega pra escolha de template com o id do rascunho.
      router.push(`/app/create/${row.id}/templates`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar o carrossel.";
      toast.error(msg);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full"
      style={{ maxWidth: 1200 }}
    >
      {/* eyebrow */}
      <span className="sv-eyebrow">
        <span className="sv-dot" /> Novo · Rascunho sem título
      </span>

      <h1
        className="sv-display mt-4"
        style={{
          fontSize: "clamp(38px, 6vw, 56px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
        }}
      >
        Qual é a <em>ideia</em> do{" "}
        <span
          style={{
            background: "var(--sv-green)",
            padding: "0 10px",
            fontStyle: "italic",
          }}
        >
          carrossel
        </span>
        ?
      </h1>
      <p
        className="mt-2"
        style={{
          color: "var(--sv-muted)",
          fontSize: 15,
          lineHeight: 1.55,
          maxWidth: 560,
        }}
      >
        Cole um link, escreva um tema, jogue um rascunho. A Sequência estrutura
        em slides editoriais.
      </p>

      {/* Split */}
      <div
        className="mt-6 grid gap-8"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* LEFT */}
        <div className="flex flex-col gap-5 min-w-0">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ex: A estratégia dos três zeros da Coca-Cola e por que ela redefine o mercado de bebidas..."
            style={{
              minHeight: 220,
              fontFamily: "var(--sv-display)",
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              padding: 20,
              background: "var(--sv-white)",
              border: "1.5px solid var(--sv-ink)",
              outline: 0,
              boxShadow: "3px 3px 0 0 var(--sv-ink)",
              fontWeight: 400,
              resize: "vertical",
              color: "var(--sv-ink)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "5px 5px 0 0 var(--sv-green)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "3px 3px 0 0 var(--sv-ink)";
            }}
          />

          <div>
            <div
              className="mb-2"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
              }}
            >
              Ou comece com um atalho:
            </div>
            <div className="flex flex-wrap gap-2">
              {SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="sv-chip"
                  onClick={() => setIdea(s.seed)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              className="mb-2.5"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
              }}
            >
              Opções
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <OptCycler
                label="Nº de slides"
                value={slidesCount}
                options={SLIDES_OPTS}
                onChange={(v) => setSlidesCount(v)}
              />
              <OptCycler
                label="Tom"
                value={tone}
                options={TONE_OPTS.map((o) => o.id)}
                onChange={(v) => setTone(v)}
                formatter={(v) => TONE_OPTS.find((o) => o.id === v)?.label ?? String(v)}
              />
              <OptCycler
                label="CTA final"
                value={cta}
                options={CTA_OPTS.map((o) => o.id)}
                onChange={(v) => setCta(v)}
                formatter={(v) => CTA_OPTS.find((o) => o.id === v)?.label ?? String(v)}
              />
              <OptCycler
                label="Idioma"
                value={lang}
                options={LANG_OPTS.map((o) => o.id)}
                onChange={(v) => setLang(v)}
                formatter={(v) => LANG_OPTS.find((o) => o.id === v)?.label ?? String(v)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loadingConcepts || !idea.trim()}
            onClick={handleGenerate}
            className="sv-btn sv-btn-primary"
            style={{
              padding: "14px 22px",
              fontSize: 11.5,
              alignSelf: "flex-start",
              opacity: loadingConcepts || !idea.trim() ? 0.55 : 1,
              cursor:
                loadingConcepts || !idea.trim() ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.3 5.8 22l2.4-8.1L2 9.4h7.6z" />
            </svg>
            {loadingConcepts ? "Gerando..." : "Gerar rascunho →"}
          </button>
        </div>

        {/* RIGHT (preview ao vivo) */}
        <div
          style={{
            padding: 28,
            background: "var(--sv-ink)",
            color: "var(--sv-paper)",
            border: "1.5px solid var(--sv-ink)",
            boxShadow: "3px 3px 0 0 var(--sv-ink)",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 1.5px)",
            backgroundSize: "14px 14px",
            minHeight: 520,
          }}
        >
          <div
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--sv-green)",
              marginBottom: 14,
            }}
          >
            ✦ Preview ao vivo
          </div>
          <h3
            style={{
              fontFamily: "var(--sv-display)",
              fontSize: 26,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              fontWeight: 400,
              marginBottom: 8,
            }}
          >
            A Sequência <em style={{ fontStyle: "italic" }}>estrutura</em> seu
            texto em slides editoriais — você só refina.
          </h3>

          {idea.trim().length === 0 ? (
            <div
              className="mt-6"
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "rgba(245,243,236,.5)",
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--sv-display)",
                  fontSize: 52,
                  fontStyle: "italic",
                  color: "var(--sv-green)",
                  marginBottom: 12,
                  display: "block",
                  fontWeight: 400,
                }}
              >
                ✺
              </span>
              Cole uma ideia ao lado
              <br /> pra gerar a prévia
            </div>
          ) : (
            <div className="mt-5 flex gap-2.5 overflow-x-auto pb-3">
              {makeMockSlides(idea, slidesCount).map((s, i) => {
                const variantBg =
                  s.variant === "cta"
                    ? "var(--sv-pink)"
                    : s.variant === "photo"
                      ? "var(--sv-green)"
                      : i % 2 === 0
                        ? "var(--sv-ink)"
                        : "var(--sv-green)";
                const isDark = variantBg === "var(--sv-ink)";
                return (
                  <div
                    key={i}
                    className="shrink-0"
                    style={{
                      width: 120,
                      aspectRatio: "4/5",
                      border: "1.5px solid var(--sv-paper)",
                      background: variantBg,
                      color: isDark ? "var(--sv-paper)" : "var(--sv-ink)",
                      padding: 10,
                      fontFamily: "var(--sv-display)",
                      fontSize: 11,
                      lineHeight: 1.1,
                      fontWeight: 400,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      backgroundImage: isDark
                        ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,.15) 1px, transparent 1.5px)"
                        : undefined,
                      backgroundSize: isDark ? "5px 5px" : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--sv-mono)",
                        fontSize: 7,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        opacity: 0.7,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")} · {s.variant ?? "Slide"}
                    </div>
                    <div style={{ fontStyle: "italic" }}>{s.heading}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
