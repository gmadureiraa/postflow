"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  TEMPLATES_META,
  TemplateRenderer,
  type TemplateId,
} from "@/components/app/templates";
import { useAuth } from "@/lib/auth-context";
import { useDraft, useAutoSaveDraft } from "@/lib/create/use-draft";
import { useImages } from "@/lib/create/use-images";
import type { CreateSlide, SlideVariant } from "@/lib/create/types";

/**
 * Tela 03 — Editor. 3 colunas (variantes/layers · canvas · branding) no
 * desktop; vira tabs no mobile. Canvas central usa `<TemplateRenderer>`
 * com o templateId escolhido. Auto-save 1200ms (debounced).
 */

/**
 * Google Fonts necessários pras opções de fonte display do editor.
 * Carregamos via `<link>` injetado em document.head na montagem do editor —
 * evita pesar a landing e o shell global.
 */
const DISPLAY_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Archivo+Black&family=Bebas+Neue&family=Instrument+Serif:ital@0;1&display=swap";

function useInjectDisplayFonts() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "sv-create-display-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = DISPLAY_FONTS_HREF;
    document.head.appendChild(link);
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre1);
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);
  }, []);
}

const VARIANT_OPTS: { id: SlideVariant; label: string; ic: React.ReactNode }[] = [
  {
    id: "cover",
    label: "Capa",
    ic: <span style={{ width: 22, height: 22, background: "var(--sv-ink)", border: "1.5px solid var(--sv-ink)" }} />,
  },
  {
    id: "headline",
    label: "Headline",
    ic: <span style={{ width: 22, height: 22, background: "var(--sv-green)", border: "1.5px solid var(--sv-ink)" }} />,
  },
  {
    id: "photo",
    label: "Foto",
    ic: (
      <span
        style={{
          width: 22,
          height: 22,
          background: "linear-gradient(var(--sv-ink) 50%, var(--sv-paper) 50%)",
          border: "1.5px solid var(--sv-ink)",
        }}
      />
    ),
  },
  {
    id: "quote",
    label: "Citação",
    ic: <span style={{ width: 22, height: 22, background: "var(--sv-pink)", border: "1.5px solid var(--sv-ink)" }} />,
  },
  {
    id: "split",
    label: "Split",
    ic: <span style={{ width: 22, height: 22, background: "var(--sv-white)", border: "1.5px solid var(--sv-ink)" }} />,
  },
  {
    id: "cta",
    label: "CTA",
    ic: (
      <span
        style={{
          width: 22,
          height: 22,
          background: "var(--sv-ink)",
          borderLeft: "4px solid var(--sv-green)",
          border: "1.5px solid var(--sv-ink)",
        }}
      />
    ),
  },
];

const ACCENT_SWATCHES = [
  "#7CF067",
  "#D262B2",
  "#FF4A1C",
  "#F5C518",
  "#2B5FFF",
  "#0A0A0A",
];

// Opções de fonte display. `family` é a string CSS completa pra passar em
// `displayFontOverride`. `id` bate com o persistido em `style.display_font`.
// `atelier` = default do Manifesto (editorial). As 4 outras vêm do Google
// Fonts (ver <link> em `app/app/layout.tsx`).
const FONT_OPTS = [
  {
    id: "atelier",
    label: "Atelier",
    family:
      '"Atelier", "Instrument Serif", "Times New Roman", Georgia, serif',
    italic: true,
  },
  {
    id: "grotesk",
    label: "Grotesk",
    family: '"Space Grotesk", system-ui, sans-serif',
    italic: false,
  },
  {
    id: "archivo",
    label: "Archivo",
    family: '"Archivo Black", system-ui, sans-serif',
    italic: false,
  },
  {
    id: "bebas",
    label: "Bebas",
    family: '"Bebas Neue", system-ui, sans-serif',
    italic: false,
  },
  {
    id: "serif",
    label: "Serif",
    family: '"Instrument Serif", Georgia, serif',
    italic: true,
  },
];

function familyFromFontId(id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return FONT_OPTS.find((f) => f.id === id)?.family;
}
function fontIdFromFamily(family: string | undefined): string {
  if (!family) return "atelier";
  return FONT_OPTS.find((f) => f.family === family)?.id ?? "atelier";
}

function buildPreviewProfile(profile: {
  name: string;
  twitter_handle?: string;
  instagram_handle?: string;
  avatar_url?: string;
} | null) {
  if (!profile) return { name: "Seu nome", handle: "@seuhandle", photoUrl: "" };
  const handle = profile.twitter_handle
    ? `@${profile.twitter_handle}`
    : profile.instagram_handle
      ? `@${profile.instagram_handle}`
      : "@seuhandle";
  return {
    name: profile.name || "Seu nome",
    handle,
    photoUrl: profile.avatar_url || "",
  };
}

type MobileTab = "variants" | "canvas" | "branding";

export default function EditPage(props: {
  params: Promise<{ id: string }>;
}) {
  useInjectDisplayFonts();
  const { id } = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, session } = useAuth();
  const { draft, loading, error } = useDraft(id);

  const imagesHook = useImages(session);

  const initialTemplate = (searchParams.get("template") as TemplateId | null) ?? null;

  // Estado local do editor — hidratado a partir do draft no useEffect abaixo.
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<CreateSlide[]>([]);
  const [slideStyle, setSlideStyle] = useState<"white" | "dark">("white");
  const [templateId, setTemplateId] = useState<TemplateId>(
    initialTemplate ?? "manifesto"
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [kicker, setKicker] = useState("");
  const [handle, setHandle] = useState("@seuhandle");
  const [fontId, setFontId] = useState<string>("atelier");
  const [accent, setAccent] = useState<string>("#7CF067");
  const [textScale, setTextScale] = useState(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");
  // Flag pra saber se o usuário já mexeu no accent/font/scale (pra não
  // forçar overrides quando o draft nem tem nada salvo — deixa o template
  // usar a cor/fonte default dele).
  const [accentTouched, setAccentTouched] = useState(false);
  const [fontTouched, setFontTouched] = useState(false);
  const [scaleTouched, setScaleTouched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Usamos um input de upload separado por slide (via indexRef) — armazenamos
  // o slide alvo pra reutilizar o mesmo file input oculto.
  const uploadTargetRef = useRef<number | null>(null);

  // Hidrata do draft quando carrega.
  useEffect(() => {
    if (!draft) return;
    setTitle(draft.title);
    setSlides(draft.slides.length ? draft.slides : []);
    setSlideStyle(draft.style === "dark" ? "dark" : "white");
    if (!initialTemplate && draft.visualTemplate) {
      setTemplateId(draft.visualTemplate);
    }
    // Hidrata overrides persistidos (accent/font/text scale).
    if (draft.accentOverride) {
      setAccent(draft.accentOverride);
      setAccentTouched(true);
    }
    if (draft.displayFont) {
      setFontId(fontIdFromFamily(draft.displayFont));
      setFontTouched(true);
    }
    if (typeof draft.textScale === "number") {
      setTextScale(draft.textScale);
      setScaleTouched(true);
    }
    if (profile) {
      setKicker(profile.name || "Seu nome");
      setHandle(
        profile.twitter_handle
          ? `@${profile.twitter_handle}`
          : profile.instagram_handle
            ? `@${profile.instagram_handle}`
            : "@seuhandle"
      );
    }
  }, [draft, initialTemplate, profile]);

  const previewProfile = useMemo(
    () => ({
      name: kicker || "Seu nome",
      handle: handle || "@seuhandle",
      photoUrl: profile?.avatar_url || "",
    }),
    [kicker, handle, profile?.avatar_url]
  );

  // Auto-save debounced. Só envia accent/font/scale se o usuário mexeu —
  // evita sobrescrever com defaults toda vez que o draft hidratar.
  useAutoSaveDraft({
    userId: user?.id ?? null,
    id,
    slides,
    title,
    slideStyle,
    visualTemplate: templateId,
    accentOverride: accentTouched ? accent : undefined,
    displayFont: fontTouched ? familyFromFontId(fontId) : undefined,
    textScale: scaleTouched ? textScale : undefined,
    enabled: slides.length > 0,
  });

  function updateSlide(index: number, patch: Partial<CreateSlide>) {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addSlide(afterIndex: number) {
    setSlides((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, {
        heading: "Novo slide",
        body: "Adicione o texto deste slide.",
        imageQuery: "placeholder",
        variant: "headline",
      });
      return next;
    });
    setActiveIndex(afterIndex + 1);
  }

  async function handleUploadImage(file: File, targetIndex: number) {
    if (!file) return;
    const url = await imagesHook.uploadImage(targetIndex, file, id);
    if (url) {
      updateSlide(targetIndex, { imageUrl: url });
      toast.success("Imagem carregada.");
    } else if (imagesHook.error) {
      toast.error(imagesHook.error);
    }
  }

  async function handleSearchImage(targetIndex: number) {
    const s = slides[targetIndex];
    if (!s) return;
    const query =
      (s.imageQuery && s.imageQuery.trim()) ||
      (s.heading && s.heading.trim()) ||
      (s.body && s.body.trim().slice(0, 60)) ||
      title;
    if (!query) {
      toast.error("Escreva um título ou corpo antes de buscar imagem.");
      return;
    }
    try {
      const res = await imagesHook.refetchImage(targetIndex, {
        query,
        contextHeading: s.heading,
        contextBody: s.body,
        mode: "search",
      });
      if (res.appliedUrl) updateSlide(targetIndex, { imageUrl: res.appliedUrl });
    } catch {
      if (imagesHook.error) toast.error(imagesHook.error);
    }
  }

  async function handleGenerateImage(targetIndex: number) {
    const s = slides[targetIndex];
    if (!s) return;
    const query =
      (s.imageQuery && s.imageQuery.trim()) ||
      (s.heading && s.heading.trim()) ||
      title;
    if (!query) {
      toast.error("Escreva um título antes de gerar imagem.");
      return;
    }
    try {
      const res = await imagesHook.refetchImage(targetIndex, {
        query,
        contextHeading: s.heading,
        contextBody: s.body,
        mode: "generate",
      });
      if (res.appliedUrl) {
        updateSlide(targetIndex, { imageUrl: res.appliedUrl });
        toast.success("Imagem gerada.");
      }
    } catch {
      if (imagesHook.error) toast.error(imagesHook.error);
    }
  }

  function handleRemoveImage(targetIndex: number) {
    updateSlide(targetIndex, { imageUrl: "" });
    toast("Imagem removida do slide.");
  }

  function triggerUploadFor(targetIndex: number) {
    uploadTargetRef.current = targetIndex;
    fileInputRef.current?.click();
  }

  function pickPickerImage(url: string) {
    const idx = imagesHook.pickerIndex;
    if (idx === null) return;
    updateSlide(idx, { imageUrl: url });
    imagesHook.clearPicker();
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          Carregando rascunho...
        </p>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: "var(--sv-ink)" }}>{error ?? "Rascunho não encontrado."}</p>
      </div>
    );
  }

  const active = slides[activeIndex];
  const selectedMeta = TEMPLATES_META.find((m) => m.id === templateId);

  const VariantsCol = (
    <div className="flex flex-col gap-4">
      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
        }}
      >
        Variante do slide
      </h4>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {VARIANT_OPTS.map((v) => {
          const on = active?.variant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => active && updateSlide(activeIndex, { variant: v.id })}
              style={{
                padding: "10px 4px",
                border: "1.5px solid var(--sv-ink)",
                background: on ? "var(--sv-green)" : "var(--sv-white)",
                cursor: "pointer",
                fontFamily: "var(--sv-mono)",
                fontSize: 8.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                color: "var(--sv-ink)",
              }}
            >
              {v.ic}
              {v.label}
            </button>
          );
        })}
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Camadas
      </h4>
      <div className="flex flex-col gap-1">
        {["Título", "Corpo", "Fundo", "+ Adicionar"].map((layer) => (
          <div
            key={layer}
            style={{
              padding: "8px 10px",
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-white)",
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--sv-ink)",
            }}
          >
            {layer}
          </div>
        ))}
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Background
      </h4>
      <div className="flex gap-1.5 flex-wrap">
        {["#0A0A0A", "#7CF067", "#D262B2", "#FFFFFF", "#0B0F1E"].map((color) => (
          <button
            key={color}
            type="button"
            onClick={() =>
              setSlideStyle(color === "#FFFFFF" || color === "#7CF067" ? "white" : "dark")
            }
            style={{
              width: 26,
              height: 26,
              background: color,
              border: "1.5px solid var(--sv-ink)",
              cursor: "pointer",
            }}
            aria-label={`Background ${color}`}
          />
        ))}
      </div>
    </div>
  );

  const CanvasCol = (
    <div
      className="flex flex-col items-center gap-6"
      style={{ padding: "28px 20px", background: "var(--sv-soft)", minHeight: 600 }}
    >
      {active && (
        <div
          style={{
            boxShadow: "6px 6px 0 0 var(--sv-ink)",
            border: "1.5px solid var(--sv-ink)",
          }}
        >
          <TemplateRenderer
            templateId={templateId}
            heading={active.heading}
            body={active.body}
            imageUrl={active.imageUrl}
            slideNumber={activeIndex + 1}
            totalSlides={slides.length}
            profile={previewProfile}
            style={slideStyle}
            showFooter={activeIndex === 0}
            scale={0.44}
            isLastSlide={activeIndex === slides.length - 1}
            accentOverride={accentTouched ? accent : undefined}
            displayFontOverride={
              fontTouched ? familyFromFontId(fontId) : undefined
            }
            textScale={scaleTouched ? textScale : undefined}
          />
        </div>
      )}

      {/* Inputs do slide ativo */}
      <div
        className="grid gap-3 w-full"
        style={{ maxWidth: 720, gridTemplateColumns: "1fr" }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "var(--sv-mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Título do slide
          </label>
          <input
            type="text"
            value={active?.heading ?? ""}
            onChange={(e) => updateSlide(activeIndex, { heading: e.target.value })}
            className="sv-input"
            style={{ width: "100%", fontFamily: "var(--sv-display)", fontSize: 18 }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "var(--sv-mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Corpo (use **bold** pra destacar)
          </label>
          <textarea
            value={active?.body ?? ""}
            onChange={(e) => updateSlide(activeIndex, { body: e.target.value })}
            className="sv-input"
            style={{ width: "100%", minHeight: 90, fontSize: 14 }}
          />
        </div>
      </div>

      {/* Thumbs horizontais */}
      <div
        className="flex gap-2.5 overflow-x-auto py-1"
        style={{ width: "100%", maxWidth: 720 }}
      >
        {slides.map((s, i) => {
          const on = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              style={{
                flexShrink: 0,
                width: 78,
                aspectRatio: "4/5",
                border: "1.5px solid var(--sv-ink)",
                padding: "7px 6px",
                fontFamily: "var(--sv-display)",
                fontSize: 8,
                lineHeight: 1.05,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform .12s",
                background: i % 2 === 0 ? "var(--sv-ink)" : "var(--sv-green)",
                color: i % 2 === 0 ? "var(--sv-paper)" : "var(--sv-ink)",
                transform: on ? "translateY(-2px)" : "translateY(0)",
                boxShadow: on ? "3px 3px 0 0 var(--sv-green)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 6.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  opacity: 0.65,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontStyle: "italic" }}>
                {s.heading?.slice(0, 24) || "—"}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => addSlide(slides.length - 1)}
          style={{
            flexShrink: 0,
            width: 78,
            aspectRatio: "4/5",
            border: "1.5px dashed var(--sv-ink)",
            background: "var(--sv-paper)",
            color: "var(--sv-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--sv-display)",
            fontSize: 28,
            fontStyle: "italic",
            cursor: "pointer",
          }}
          aria-label="Adicionar slide"
        >
          +
        </button>
      </div>
    </div>
  );

  const BrandingCol = (
    <div className="flex flex-col gap-4">
      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
        }}
      >
        Branding
      </h4>
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Kicker (nome)
        </label>
        <input
          type="text"
          value={kicker}
          onChange={(e) => setKicker(e.target.value)}
          className="sv-input"
          style={{ width: "100%", fontSize: 13 }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          @ Handle
        </label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="sv-input"
          style={{ width: "100%", fontSize: 13 }}
        />
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Fonte display
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {FONT_OPTS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFontId(f.id);
              setFontTouched(true);
            }}
            style={{
              padding: "7px 11px",
              border: "1.5px solid var(--sv-ink)",
              background: fontId === f.id ? "var(--sv-ink)" : "var(--sv-white)",
              color: fontId === f.id ? "var(--sv-paper)" : "var(--sv-ink)",
              cursor: "pointer",
              fontFamily: f.family,
              fontStyle: f.italic ? "italic" : "normal",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: 11,
              lineHeight: 1,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Cor de destaque
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {ACCENT_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              setAccent(color);
              setAccentTouched(true);
            }}
            style={{
              width: 26,
              height: 26,
              background: color,
              border: "1.5px solid var(--sv-ink)",
              cursor: "pointer",
              boxShadow:
                accent === color && accentTouched
                  ? "0 0 0 2px var(--sv-paper) inset, 0 0 0 4px var(--sv-ink)"
                  : "none",
            }}
            aria-label={`Accent ${color}`}
          />
        ))}
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Tamanho do texto
      </h4>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={0.8}
          max={1.3}
          step={0.02}
          value={textScale}
          onChange={(e) => {
            setTextScale(parseFloat(e.target.value));
            setScaleTouched(true);
          }}
          style={{ flex: 1, accentColor: "var(--sv-ink)" }}
        />
        <span
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            fontWeight: 700,
            minWidth: 42,
            textAlign: "right",
          }}
        >
          {textScale.toFixed(2)}×
        </span>
      </div>

      <h4
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginTop: 10,
        }}
      >
        Imagem do slide ativo
      </h4>

      {active?.imageUrl ? (
        <div
          style={{
            width: "100%",
            aspectRatio: "4/5",
            background: `url(${active.imageUrl}) center/cover`,
            border: "1.5px solid var(--sv-ink)",
          }}
          aria-label="Preview da imagem atual"
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "4/5",
            background: "var(--sv-paper)",
            border: "1.5px dashed var(--sv-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          Sem imagem
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const target = uploadTargetRef.current ?? activeIndex;
          if (file) void handleUploadImage(file, target);
          uploadTargetRef.current = null;
          e.target.value = "";
        }}
      />

      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button
          type="button"
          onClick={() => void handleSearchImage(activeIndex)}
          disabled={imagesHook.loadingIndex === activeIndex}
          className="sv-btn sv-btn-outline"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "8px 10px",
            fontSize: 9.5,
          }}
        >
          {imagesHook.loadingIndex === activeIndex ? "..." : "Buscar"}
        </button>
        <button
          type="button"
          onClick={() => void handleGenerateImage(activeIndex)}
          disabled={imagesHook.loadingIndex === activeIndex}
          className="sv-btn sv-btn-outline"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "8px 10px",
            fontSize: 9.5,
          }}
        >
          {imagesHook.loadingIndex === activeIndex ? "..." : "Gerar IA"}
        </button>
        <button
          type="button"
          onClick={() => triggerUploadFor(activeIndex)}
          className="sv-btn sv-btn-outline"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "8px 10px",
            fontSize: 9.5,
          }}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => handleRemoveImage(activeIndex)}
          className="sv-btn sv-btn-outline"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "8px 10px",
            fontSize: 9.5,
            color: "var(--sv-pink, #D262B2)",
          }}
        >
          Remover
        </button>
      </div>

      {imagesHook.pickerOptions.length > 0 && (
        <>
          <div
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--sv-muted)",
              fontWeight: 700,
            }}
          >
            Escolher resultado:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {imagesHook.pickerOptions.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => pickPickerImage(url)}
                style={{
                  aspectRatio: "1",
                  background: `url(${url}) center/cover`,
                  border: "1.5px solid var(--sv-ink)",
                  cursor: "pointer",
                }}
                aria-label="Escolher imagem"
              />
            ))}
          </div>
        </>
      )}

      <div
        className="mt-2"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 8.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sv-muted)",
        }}
      >
        Template: <strong>{selectedMeta?.name ?? templateId}</strong>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Topbar do editor */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 mb-5"
        style={{
          padding: "14px 16px",
          border: "1.5px solid var(--sv-ink)",
          background: "var(--sv-white)",
          boxShadow: "3px 3px 0 0 var(--sv-ink)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          Slide{" "}
          <strong style={{ color: "var(--sv-ink)" }}>
            {String(activeIndex + 1).padStart(2, "0")}
          </strong>{" "}
          / {String(slides.length).padStart(2, "0")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="sv-btn sv-btn-outline"
            style={{ padding: "7px 12px", fontSize: 9 }}
            onClick={() => toast("Desfazer ainda vem por aí")}
          >
            ⌘Z Desfazer
          </button>
          <button
            type="button"
            className="sv-btn sv-btn-outline"
            style={{ padding: "7px 12px", fontSize: 9 }}
            onClick={() => router.push(`/app/create/${id}/templates`)}
          >
            Trocar template
          </button>
          <button
            type="button"
            className="sv-btn sv-btn-primary"
            style={{ padding: "7px 12px", fontSize: 9 }}
            onClick={() => router.push(`/app/create/${id}/preview`)}
          >
            Preview & Export →
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden mb-4 flex" style={{ border: "1.5px solid var(--sv-ink)", boxShadow: "2px 2px 0 0 var(--sv-ink)" }}>
        {(["variants", "canvas", "branding"] as MobileTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMobileTab(t)}
            style={{
              flex: 1,
              padding: "9px 12px",
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
              background: mobileTab === t ? "var(--sv-ink)" : "var(--sv-white)",
              color: mobileTab === t ? "var(--sv-paper)" : "var(--sv-ink)",
              borderRight: t !== "branding" ? "1.5px solid var(--sv-ink)" : "none",
            }}
          >
            {t === "variants" ? "Variantes" : t === "canvas" ? "Canvas" : "Branding"}
          </button>
        ))}
      </div>

      {/* Desktop 3 colunas · Mobile tab único */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: "220px 1fr 280px",
          gap: 0,
          border: "1.5px solid var(--sv-ink)",
          boxShadow: "4px 4px 0 0 var(--sv-ink)",
          background: "var(--sv-white)",
        }}
      >
        <aside
          style={{
            padding: "20px 18px",
            borderRight: "1.5px solid var(--sv-ink)",
            background: "var(--sv-white)",
          }}
        >
          {VariantsCol}
        </aside>
        <div>{CanvasCol}</div>
        <aside
          style={{
            padding: "20px 18px",
            borderLeft: "1.5px solid var(--sv-ink)",
            background: "var(--sv-white)",
          }}
        >
          {BrandingCol}
        </aside>
      </div>

      <div
        className="lg:hidden"
        style={{
          border: "1.5px solid var(--sv-ink)",
          boxShadow: "3px 3px 0 0 var(--sv-ink)",
          background: "var(--sv-white)",
          padding: "18px 16px",
        }}
      >
        {mobileTab === "variants" && VariantsCol}
        {mobileTab === "canvas" && CanvasCol}
        {mobileTab === "branding" && BrandingCol}
      </div>
    </motion.div>
  );
}
