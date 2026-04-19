"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { TemplateRenderer, type TemplateId } from "@/components/app/templates";
import { useAuth } from "@/lib/auth-context";
import { useDraft } from "@/lib/create/use-draft";
import { useExport } from "@/lib/create/use-export";

/**
 * Tela 04 — Preview / Export. iPhone mockup com slides do rascunho,
 * controles de export PNG/PDF/Clipboard, legenda editável e agendamento stub.
 */

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

export default function PreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const router = useRouter();
  const { profile } = useAuth();
  const { draft, loading, error } = useDraft(id);

  const slides = draft?.slides ?? [];
  const templateId: TemplateId = draft?.visualTemplate ?? "manifesto";
  const previewProfile = useMemo(
    () =>
      buildPreviewProfile(
        profile
          ? {
              name: profile.name,
              twitter_handle: profile.twitter_handle,
              instagram_handle: profile.instagram_handle,
              avatar_url: profile.avatar_url,
            }
          : null
      ),
    [profile]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [caption, setCaption] = useState("");
  const [scheduleOn, setScheduleOn] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:30");

  const slideStyle = draft?.style === "dark" ? "dark" : "white";

  const { exportRefs, exportPng, exportPdf, isExporting, progress } = useExport(
    slides.length
  );

  async function handleClipboard() {
    const full = [
      ...slides.map((s, i) => `${i + 1}. ${s.heading}\n${s.body}`),
      "",
      caption,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(full);
      toast.success("Copiado para o clipboard.");
    } catch {
      toast.error("Falha ao copiar.");
    }
  }

  function handleSchedule() {
    if (!scheduleOn) {
      toast.success("Para publicar agora, conecte a conta Instagram.");
      return;
    }
    if (!scheduleDate) {
      toast.error("Escolha uma data para o agendamento.");
      return;
    }
    toast.success(`✓ Agendado para ${scheduleDate} às ${scheduleTime}.`);
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
          Carregando...
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

  const active = slides[currentSlide] ?? slides[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full"
      style={{ maxWidth: 1200 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="sv-eyebrow">
          <span className="sv-dot" /> Pronto · {slides.length} slides · 4:5
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="sv-btn sv-btn-outline"
            style={{ padding: "7px 12px", fontSize: 9 }}
            onClick={() => router.push(`/app/create/${id}/edit`)}
          >
            ← Editar
          </button>
        </div>
      </div>

      <h1
        className="sv-display"
        style={{
          fontSize: "clamp(38px, 6vw, 56px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
        }}
      >
        Preview no <em>Instagram</em>.
      </h1>
      <p
        className="mt-2"
        style={{
          color: "var(--sv-muted)",
          fontSize: 15,
          maxWidth: 560,
        }}
      >
        Veja como fica no feed antes de exportar. Você pode ajustar a legenda e
        agendar direto.
      </p>

      <div
        className="mt-6 grid gap-10 items-start"
        style={{ gridTemplateColumns: "1.1fr 1fr" }}
      >
        {/* LEFT: iPhone mockup */}
        <div className="flex flex-col items-center gap-4">
          <div
            style={{
              width: 320,
              aspectRatio: "9/19",
              background: "#111",
              borderRadius: 36,
              padding: 10,
              border: "1.5px solid var(--sv-ink)",
              boxShadow: "6px 6px 0 0 var(--sv-ink)",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 18,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 6,
                background: "#000",
                borderRadius: 10,
                zIndex: 5,
              }}
            />
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--sv-white)",
                borderRadius: 28,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* IG bar */}
              <div
                className="flex items-center gap-2.5"
                style={{
                  padding: "44px 14px 10px",
                  borderBottom: "1px solid rgba(0,0,0,.08)",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,#f09433,#dc2743,#bc1888)",
                    padding: 2,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "var(--sv-green)",
                      border: "1.5px solid var(--sv-ink)",
                    }}
                  />
                </div>
                <div
                  className="flex-1"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {previewProfile.handle.replace(/^@/, "")}
                </div>
                <div style={{ fontSize: 18, letterSpacing: 4 }}>• • •</div>
              </div>

              {/* Post */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--sv-white)" }}>
                {active && (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TemplateRenderer
                      templateId={templateId}
                      heading={active.heading}
                      body={active.body}
                      imageUrl={active.imageUrl}
                      slideNumber={currentSlide + 1}
                      totalSlides={slides.length}
                      profile={previewProfile}
                      style={slideStyle}
                      scale={0.26}
                      showFooter={currentSlide === 0}
                      isLastSlide={currentSlide === slides.length - 1}
                    />
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background:
                          i === currentSlide
                            ? "var(--sv-white)"
                            : "rgba(255,255,255,.4)",
                        border: "0.5px solid rgba(0,0,0,.2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Action bar */}
              <div
                className="flex gap-3.5"
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid rgba(0,0,0,.08)",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.8}>
                  <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" />
                </svg>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.8}>
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" />
                </svg>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.8}>
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <div style={{ flex: 1 }} />
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.8}>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>

              <div
                style={{
                  padding: "0 14px 16px",
                  fontFamily: "var(--sv-sans)",
                  fontSize: 11,
                  lineHeight: 1.4,
                }}
              >
                <strong>{previewProfile.handle.replace(/^@/, "")}</strong>{" "}
                {caption.slice(0, 80) || "Adicione uma legenda..."}
              </div>
            </div>
          </div>

          {/* Nav circular */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((i) => (i - 1 + slides.length) % slides.length)
              }
              style={{
                width: 36,
                height: 36,
                border: "1.5px solid var(--sv-ink)",
                borderRadius: "50%",
                background: "var(--sv-white)",
                boxShadow: "2px 2px 0 0 var(--sv-ink)",
                cursor: "pointer",
              }}
              aria-label="Slide anterior"
            >
              ←
            </button>
            <span
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Slide{" "}
              <strong>{String(currentSlide + 1).padStart(2, "0")}</strong> /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentSlide((i) => (i + 1) % slides.length)}
              style={{
                width: 36,
                height: 36,
                border: "1.5px solid var(--sv-ink)",
                borderRadius: "50%",
                background: "var(--sv-white)",
                boxShadow: "2px 2px 0 0 var(--sv-ink)",
                cursor: "pointer",
              }}
              aria-label="Próximo slide"
            >
              →
            </button>
          </div>
        </div>

        {/* RIGHT: 3 cards */}
        <div className="flex flex-col gap-4">
          {/* Exportar */}
          <div
            style={{
              padding: 22,
              background: "var(--sv-ink)",
              color: "var(--sv-paper)",
              border: "1.5px solid var(--sv-ink)",
              boxShadow: "3px 3px 0 0 var(--sv-green)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 9.5,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--sv-green)",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              ✦ Exportar
            </div>
            <h4
              className="sv-display"
              style={{ fontSize: 24, letterSpacing: "-0.01em", marginBottom: 16 }}
            >
              Escolha o <em>formato</em>.
            </h4>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { label: "📦 Baixar .zip", hi: true, onClick: () => void exportPng() },
                { label: `🖼 PNG × ${slides.length}`, onClick: () => void exportPng() },
                { label: "📄 PDF", onClick: () => void exportPdf(draft.title) },
                { label: "✂ Copiar", onClick: () => void handleClipboard() },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={btn.onClick}
                  disabled={isExporting}
                  style={{
                    padding: "11px 12px",
                    border: btn.hi
                      ? "1.5px solid var(--sv-ink)"
                      : "1.5px solid var(--sv-paper)",
                    background: btn.hi ? "var(--sv-green)" : "transparent",
                    color: btn.hi ? "var(--sv-ink)" : "var(--sv-paper)",
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    cursor: isExporting ? "wait" : "pointer",
                    fontWeight: 700,
                    opacity: isExporting ? 0.6 : 1,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {progress && (
              <div
                className="mt-3"
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(247,245,239,.7)",
                }}
              >
                {progress}
              </div>
            )}
          </div>

          {/* Legenda */}
          <div
            style={{
              padding: 22,
              background: "var(--sv-white)",
              border: "1.5px solid var(--sv-ink)",
              boxShadow: "3px 3px 0 0 var(--sv-ink)",
            }}
          >
            <label
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
                marginBottom: 8,
                display: "block",
                fontWeight: 700,
              }}
            >
              Legenda · Instagram
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 4000))}
              style={{
                width: "100%",
                minHeight: 120,
                border: "1.5px solid var(--sv-ink)",
                padding: 12,
                fontFamily: "var(--sv-sans)",
                fontSize: 13,
                lineHeight: 1.5,
                outline: 0,
                resize: "vertical",
                background: "var(--sv-paper)",
                color: "var(--sv-ink)",
              }}
              placeholder="Conte a história do carrossel..."
            />
            <div
              className="mt-2"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 9,
                color: "var(--sv-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {caption.length} / 4000
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {["#marketing", "#carrossel", "#estrategia", "#+5"].map((h) => (
                <span
                  key={h}
                  style={{
                    padding: "4px 9px",
                    background: "var(--sv-paper)",
                    border: "1.5px solid var(--sv-ink)",
                    fontFamily: "var(--sv-mono)",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Agendamento */}
          <div
            style={{
              padding: 22,
              background: "var(--sv-white)",
              border: "1.5px solid var(--sv-ink)",
              boxShadow: "3px 3px 0 0 var(--sv-ink)",
            }}
          >
            <label
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
                fontWeight: 700,
                display: "block",
                marginBottom: 8,
              }}
            >
              Publicação
            </label>
            <div className="flex items-center gap-3 mt-3.5">
              <button
                type="button"
                onClick={() => setScheduleOn((v) => !v)}
                style={{
                  width: 42,
                  height: 22,
                  background: scheduleOn ? "var(--sv-green)" : "var(--sv-ink)",
                  borderRadius: 999,
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  border: 0,
                  padding: 0,
                }}
                aria-label="Agendar"
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 3,
                    left: scheduleOn ? 23 : 3,
                    width: 16,
                    height: 16,
                    background: scheduleOn ? "var(--sv-ink)" : "var(--sv-paper)",
                    borderRadius: "50%",
                    transition: "left .18s",
                  }}
                />
              </button>
              <div>
                <b style={{ fontFamily: "var(--sv-sans)", fontSize: 13 }}>
                  Agendar para depois
                </b>
                <div
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 8.5,
                    letterSpacing: "0.16em",
                    color: "var(--sv-muted)",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {scheduleOn
                    ? `${scheduleDate || "escolha data"} · ${scheduleTime}`
                    : "desligado"}
                </div>
              </div>
            </div>

            {scheduleOn && (
              <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="sv-input"
                  style={{ fontSize: 13 }}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="sv-input"
                  style={{ fontSize: 13 }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSchedule}
              className="sv-btn sv-btn-ink"
              style={{ width: "100%", marginTop: 16 }}
            >
              Publicar no Instagram →
            </button>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 8.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--sv-muted)",
              }}
            >
              TODO · Conexão OAuth com Instagram Graph API pendente (MVP stub).
            </p>
          </div>
        </div>
      </div>

      {/* Export render hidden container: 1080×1350 full scale. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: -99999,
          left: -99999,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            ref={(el: HTMLDivElement | null) => {
              exportRefs.current[i] = el;
            }}
          >
            <TemplateRenderer
              templateId={templateId}
              heading={s.heading}
              body={s.body}
              imageUrl={s.imageUrl}
              slideNumber={i + 1}
              totalSlides={slides.length}
              profile={previewProfile}
              style={slideStyle}
              scale={1}
              showFooter={i === 0}
              isLastSlide={i === slides.length - 1}
              exportMode
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
