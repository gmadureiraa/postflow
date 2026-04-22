"use client";

/**
 * Onboarding v2 — replica do fluxo Posttar adaptado ao brutalist editorial do SV.
 *
 * Diferenca chave vs v1: zero escrita do usuario. A IA infere bio/tom/publico
 * a partir do Instagram, o usuario so confirma. Ao final ja existe:
 *   - DNA capturado
 *   - Identidade visual escolhida
 *   - 3 ideias aprovadas
 *   - 3 primeiros posts prontos para conferir
 *
 * Acessar em http://localhost:3000/app/onboarding-v2 (dev).
 * Nao substitui /app/onboarding enquanto o user nao validar.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X, Zap, Pencil, ImageIcon, Instagram, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { BrandAnalysis } from "@/lib/auth-context";
import { jsonWithAuth } from "@/lib/api-auth-headers";
import { scrubInstagramCdn } from "@/lib/instagram-cdn";

// ──────────────────────────────────────────────────────────────────
// Domain types
// ──────────────────────────────────────────────────────────────────
type RecentPost = { text: string; likes: number; comments: number };

interface ScrapedProfile {
  handle: string;
  platform: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followers: number | null;
  following: number | null;
  niche: string | null;
  recentPosts: RecentPost[];
  partial: boolean;
}

interface BrandAnalysisResult {
  detected_niche: string[];
  tone_detected: string;
  top_topics: string[];
  posting_frequency: string;
  avg_engagement: { likes: number; comments: number };
  suggested_pillars: string[];
  suggested_audience: string;
}

interface Suggestion {
  id: string;
  title: string;
  hook: string;
  angle: string;
  style?: string;
}

// ──────────────────────────────────────────────────────────────────
// Visual presets (Posttar-style card pickers)
// ──────────────────────────────────────────────────────────────────
const BRAND_COLORS = [
  { id: "green", label: "Lima", hex: "#7CF067" },
  { id: "ink", label: "Preto", hex: "#0A0A0A" },
  { id: "pink", label: "Pink", hex: "#D262B2" },
  { id: "blue", label: "Azul", hex: "#2B5FFF" },
  { id: "orange", label: "Laranja", hex: "#FF4A1C" },
  { id: "yellow", label: "Mostarda", hex: "#F5C518" },
] as const;

const IMAGE_STYLES = [
  { id: "photo", label: "Fotografia editorial", desc: "cenas reais, luz natural" },
  { id: "illus", label: "Ilustração", desc: "traço limpo, cores planas" },
  { id: "iso3d", label: "3D isométrico", desc: "objetos e cena isométrica" },
] as const;

const DESIGN_STYLES = [
  { id: "manifesto", label: "Futurista", desc: "navy + grids + tipografia display" },
  { id: "twitter", label: "Twitter", desc: "tweets no slide, bio no topo" },
] as const;

// ──────────────────────────────────────────────────────────────────
// Step machine
// ──────────────────────────────────────────────────────────────────
type Step =
  | "about"
  | "connect"
  | "analyze"
  | "dna"
  | "visual"
  | "ideas"
  | "autopilot"
  | "posts"
  | "done";

const STEP_ORDER: Step[] = [
  "about",
  "connect",
  "analyze",
  "dna",
  "visual",
  "ideas",
  "autopilot",
  "posts",
  "done",
];

function stepIndex(s: Step): number {
  return STEP_ORDER.indexOf(s);
}

// ──────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────
export default function OnboardingV2Page() {
  const router = useRouter();
  const { profile, user, session, updateProfile } = useAuth();

  const [step, setStep] = useState<Step>("about");
  const [saving, setSaving] = useState(false);

  // Step 1 — about
  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Step 2 — connect
  const [igHandle, setIgHandle] = useState("");

  // Step 3 — analyze
  const [scrapedProfile, setScrapedProfile] = useState<ScrapedProfile | null>(null);
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzePhase, setAnalyzePhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Step 4 — dna
  const [dnaWho, setDnaWho] = useState("");
  const [dnaAudience, setDnaAudience] = useState("");
  const [dnaStyle, setDnaStyle] = useState("");
  const [dnaPillars, setDnaPillars] = useState("");

  // Step 5 — visual
  const [colorId, setColorId] = useState<string>("green");
  const [imageStyleId, setImageStyleId] = useState<string>("photo");
  const [designId, setDesignId] = useState<string>("manifesto");

  // Step 6 — ideas
  const [ideas, setIdeas] = useState<Suggestion[]>([]);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [approvedIdeas, setApprovedIdeas] = useState<Suggestion[]>([]);

  // Step 7 — autopilot
  const [autopilot, setAutopilot] = useState(false);

  // Pre-fill from profile / user metadata once.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (profile) {
      if (profile.name) setDisplayName(profile.name);
      if (profile.instagram_handle) setIgHandle(profile.instagram_handle);
    }
    if (user?.user_metadata && !displayName) {
      const fn = (user.user_metadata as Record<string, unknown>).full_name;
      if (typeof fn === "string") setDisplayName(fn);
    }
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user]);

  // Redirect away if already onboarded (unless ?force=1).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const force = new URLSearchParams(window.location.search).get("force") === "1";
    if (!force && profile?.onboarding_completed) {
      router.replace("/app");
    }
  }, [profile?.onboarding_completed, router]);

  const goto = useCallback((next: Step) => setStep(next), []);

  // ───── Scrape + analyze IG ─────
  const runAnalysis = useCallback(
    async (handleInput: string) => {
      const clean = handleInput.replace(/^@/, "").trim();
      if (!clean) {
        setAnalysisError("Digite seu @ do Instagram pra gente começar.");
        return;
      }
      setAnalyzing(true);
      setAnalysisError(null);
      setAnalyzePhase(1);
      try {
        const res = await fetch("/api/profile-scraper", {
          method: "POST",
          headers: jsonWithAuth(session),
          body: JSON.stringify({ platform: "instagram", handle: clean }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            typeof body?.error === "string"
              ? body.error
              : "Não consegui ler esse perfil agora."
          );
        }
        const scraped: ScrapedProfile = await res.json();
        setScrapedProfile(scraped);
        setAnalyzePhase(2);

        if (!scraped.recentPosts || scraped.recentPosts.length === 0) {
          setAnalyzePhase(4);
          return;
        }

        setAnalyzePhase(3);
        const analysisRes = await fetch("/api/brand-analysis", {
          method: "POST",
          headers: jsonWithAuth(session),
          body: JSON.stringify({
            bio: scraped.bio,
            recentPosts: scraped.recentPosts,
            handle: clean,
            platform: "instagram",
            followers: scraped.followers,
          }),
        });
        if (!analysisRes.ok) {
          const body = await analysisRes.json().catch(() => null);
          throw new Error(
            typeof body?.error === "string"
              ? body.error
              : "Falha ao analisar marca."
          );
        }
        const analysis: BrandAnalysisResult = await analysisRes.json();
        setBrandAnalysis(analysis);
        // Pre-fill DNA fields
        setDnaWho(
          scraped.bio ??
            `${scraped.name ?? clean} — criador de conteúdo sobre ${
              analysis.detected_niche[0] ?? "seu nicho"
            }.`
        );
        setDnaAudience(analysis.suggested_audience ?? "");
        setDnaStyle(
          `Tom ${analysis.tone_detected}. Formato dominante: ${analysis.posting_frequency}.`
        );
        setDnaPillars((analysis.suggested_pillars ?? []).join(", "));
        setAnalyzePhase(4);
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : "Erro inesperado.");
        setAnalyzePhase(0);
      } finally {
        setAnalyzing(false);
      }
    },
    [session]
  );

  // ───── Load ideas ─────
  const loadIdeas = useCallback(async () => {
    if (ideas.length > 0) return;
    setIdeasLoading(true);
    try {
      const res = await fetch("/api/suggestions?refresh=1", {
        method: "GET",
        headers: jsonWithAuth(session),
      });
      if (!res.ok) {
        setIdeas([]);
        return;
      }
      const body = (await res.json()) as { items?: Suggestion[] };
      setIdeas((body.items ?? []).slice(0, 6));
    } catch {
      setIdeas([]);
    } finally {
      setIdeasLoading(false);
    }
  }, [session, ideas.length]);

  useEffect(() => {
    if (step === "ideas") void loadIdeas();
  }, [step, loadIdeas]);

  const approveIdea = () => {
    const current = ideas[ideaIndex];
    if (!current) return;
    setApprovedIdeas((prev) => [...prev, current]);
    advanceIdea();
  };
  const rejectIdea = () => advanceIdea();
  const advanceIdea = () => {
    setIdeaIndex((i) => i + 1);
  };

  // ───── Finish onboarding ─────
  async function finish() {
    setSaving(true);
    try {
      const pillars = dnaPillars
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const detectedNiche = brandAnalysis?.detected_niche ?? [];
      const tone = brandAnalysis?.tone_detected ?? "casual";

      const brand: BrandAnalysis = {
        detected_niche: detectedNiche,
        tone_detected: tone,
        top_topics: brandAnalysis?.top_topics ?? [],
        posting_frequency: brandAnalysis?.posting_frequency ?? "",
        avg_engagement: brandAnalysis?.avg_engagement ?? { likes: 0, comments: 0 },
        content_pillars: pillars,
        audience_description: dnaAudience,
        inspirations: [],
        voice_preference: "",
        voice_samples: [],
        tabus: [],
        content_rules: [],
      };

      await updateProfile({
        name: displayName || undefined,
        avatar_url: scrubInstagramCdn(scrapedProfile?.avatarUrl ?? "") || "",
        instagram_handle: igHandle.replace(/^@/, ""),
        niche: detectedNiche,
        tone,
        carousel_style: designId,
        onboarding_completed: true,
        brand_analysis: brand,
      });

      try {
        localStorage.removeItem("sequencia-viral_onboarding");
      } catch {
        /* ignore */
      }

      const firstApproved = approvedIdeas[0];
      if (firstApproved) {
        const idea = encodeURIComponent(firstApproved.title);
        window.location.href = `/app/create/new?idea=${idea}&template=${designId}`;
        return;
      }
      window.location.href = "/app";
    } catch (err) {
      toast.error(
        err instanceof Error ? `Falha: ${err.message}` : "Falha ao concluir."
      );
      setSaving(false);
    }
  }

  const canAdvanceAbout = displayName.trim().length >= 2;
  const progress = stepIndex(step) / (STEP_ORDER.length - 1);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--sv-paper)" }}
    >
      {/* Header with progress bar */}
      <TopBar progress={progress} step={step} />

      <main className="flex flex-1 items-start justify-center px-5 py-10 md:py-14">
        <div className="w-full max-w-[920px]">
          <AnimatePresence mode="wait">
            {step === "about" && (
              <StepAbout
                key="about"
                name={displayName}
                setName={setDisplayName}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
                disabled={!canAdvanceAbout}
                onNext={() => goto("connect")}
              />
            )}
            {step === "connect" && (
              <StepConnect
                key="connect"
                handle={igHandle}
                setHandle={setIgHandle}
                onBack={() => goto("about")}
                onConnect={async () => {
                  goto("analyze");
                  await runAnalysis(igHandle);
                }}
                onSkip={() => goto("visual")}
              />
            )}
            {step === "analyze" && (
              <StepAnalyze
                key="analyze"
                phase={analyzePhase}
                scrapedProfile={scrapedProfile}
                analysis={brandAnalysis}
                analyzing={analyzing}
                error={analysisError}
                onRetry={() => runAnalysis(igHandle)}
                onBack={() => goto("connect")}
                onNext={() => goto("dna")}
              />
            )}
            {step === "dna" && (
              <StepDNA
                key="dna"
                scrapedProfile={scrapedProfile}
                analysis={brandAnalysis}
                who={dnaWho}
                setWho={setDnaWho}
                audience={dnaAudience}
                setAudience={setDnaAudience}
                styleLine={dnaStyle}
                setStyleLine={setDnaStyle}
                pillars={dnaPillars}
                setPillars={setDnaPillars}
                onBack={() => goto("analyze")}
                onNext={() => goto("visual")}
              />
            )}
            {step === "visual" && (
              <StepVisual
                key="visual"
                colorId={colorId}
                setColorId={setColorId}
                imageStyleId={imageStyleId}
                setImageStyleId={setImageStyleId}
                designId={designId}
                setDesignId={setDesignId}
                onBack={() => goto(scrapedProfile ? "dna" : "connect")}
                onNext={() => goto("ideas")}
              />
            )}
            {step === "ideas" && (
              <StepIdeas
                key="ideas"
                ideas={ideas}
                idx={ideaIndex}
                loading={ideasLoading}
                approvedCount={approvedIdeas.length}
                onApprove={approveIdea}
                onReject={rejectIdea}
                onSkip={() => goto("autopilot")}
                onNext={() => goto("autopilot")}
              />
            )}
            {step === "autopilot" && (
              <StepAutopilot
                key="autopilot"
                on={autopilot}
                setOn={setAutopilot}
                onBack={() => goto("ideas")}
                onNext={() => goto("posts")}
              />
            )}
            {step === "posts" && (
              <StepPosts
                key="posts"
                scrapedProfile={scrapedProfile}
                ideas={approvedIdeas.length > 0 ? approvedIdeas : ideas.slice(0, 3)}
                designId={designId}
                colorHex={BRAND_COLORS.find((c) => c.id === colorId)?.hex ?? "#7CF067"}
                onContinue={() => goto("done")}
              />
            )}
            {step === "done" && (
              <StepDone
                key="done"
                saving={saving}
                onFinish={finish}
                approved={approvedIdeas.length}
                autopilot={autopilot}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Top bar with progress
// ──────────────────────────────────────────────────────────────────
function TopBar({ progress, step }: { progress: number; step: Step }) {
  const pct = Math.round(progress * 100);
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-10"
      style={{
        height: 60,
        background: "var(--sv-paper)",
        borderBottom: "1px solid rgba(10,10,10,.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: "var(--sv-green)",
            border: "1.5px solid var(--sv-ink)",
          }}
        >
          <Sparkles size={13} color="#0A0A0A" />
        </span>
        <span
          style={{
            fontFamily: "var(--sv-display)",
            fontSize: 16,
            lineHeight: 1,
            color: "var(--sv-ink)",
          }}
        >
          Sequência <em className="italic">Viral</em>
        </span>
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--sv-muted)",
            paddingLeft: 12,
            borderLeft: "1px solid rgba(10,10,10,.15)",
            marginLeft: 12,
          }}
        >
          ONBOARDING · V2 · PREVIEW
        </span>
      </div>
      <div className="flex items-center gap-3 min-w-[180px]">
        <div
          className="flex-1"
          style={{
            height: 4,
            background: "rgba(10,10,10,0.1)",
            border: "1px solid var(--sv-ink)",
            minWidth: 120,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "var(--sv-ink)",
              transition: "width .4s",
            }}
          />
        </div>
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--sv-ink)",
            whiteSpace: "nowrap",
          }}
        >
          {step === "done" ? "100%" : `${pct}%`}
        </span>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────
// Reusable atoms
// ──────────────────────────────────────────────────────────────────
function Card({
  children,
  pad = 28,
}: {
  children: React.ReactNode;
  pad?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        padding: pad,
        background: "var(--sv-white)",
        border: "1.5px solid var(--sv-ink)",
        boxShadow: "6px 6px 0 0 var(--sv-ink)",
      }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="sv-eyebrow mb-5 inline-flex">
      <span className="sv-dot" />
      {children}
    </span>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "var(--sv-display)",
        fontSize: "clamp(32px, 4.4vw, 48px)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        fontWeight: 400,
        color: "var(--sv-ink)",
        marginBottom: 12,
      }}
    >
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--sv-sans)",
        color: "var(--sv-muted)",
        fontSize: 15,
        lineHeight: 1.55,
        marginBottom: 28,
        maxWidth: 620,
      }}
    >
      {children}
    </p>
  );
}

function Footer({
  back,
  primary,
  secondary,
}: {
  back?: { label: string; onClick: () => void };
  primary: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="mt-10 flex items-center justify-between gap-3"
      style={{ borderTop: "1.5px solid var(--sv-ink)", paddingTop: 20 }}
    >
      {back ? (
        <button
          onClick={back.onClick}
          className="sv-btn sv-btn-ghost"
          style={{ padding: "10px 14px", fontSize: 11 }}
        >
          ← {back.label}
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {secondary && (
          <button
            onClick={secondary.onClick}
            className="sv-btn sv-btn-ghost"
            style={{ padding: "10px 14px", fontSize: 11 }}
          >
            {secondary.label}
          </button>
        )}
        <button
          onClick={primary.onClick}
          disabled={primary.disabled || primary.loading}
          className="sv-btn sv-btn-primary"
          style={{
            padding: "14px 22px",
            fontSize: 12,
            opacity: primary.disabled || primary.loading ? 0.55 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {primary.loading && <Loader2 size={14} className="animate-spin" />}
          {primary.label}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: About
// ──────────────────────────────────────────────────────────────────
function StepAbout({
  name,
  setName,
  whatsapp,
  setWhatsapp,
  disabled,
  onNext,
}: {
  name: string;
  setName: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  disabled: boolean;
  onNext: () => void;
}) {
  return (
    <Card>
      <Eyebrow>● Passo 01 · Sobre você</Eyebrow>
      <H1>
        Vamos te <em className="italic">conhecer</em> rapidinho.
      </H1>
      <Sub>
        A gente precisa de uma referência mínima pra começar. Tudo que vem depois é gerado pela IA a partir do seu Instagram.
      </Sub>
      <div className="grid gap-4">
        <Field label="Como a gente te chama?" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="sv-input"
            style={{ padding: "12px 14px", fontSize: 14 }}
            autoFocus
          />
        </Field>
        <Field
          label="WhatsApp (opcional)"
          hint="A gente manda o resumo semanal do desempenho pelo WhatsApp."
        >
          <div className="flex gap-2">
            <span
              className="flex items-center justify-center"
              style={{
                padding: "10px 12px",
                background: "var(--sv-white)",
                border: "1.5px solid var(--sv-ink)",
                fontFamily: "var(--sv-mono)",
                fontSize: 12,
              }}
            >
              🇧🇷 +55
            </span>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 9 9999-9999"
              className="sv-input flex-1"
              style={{ padding: "12px 14px", fontSize: 14 }}
            />
          </div>
        </Field>
      </div>
      <Footer
        primary={{ label: "Avançar →", onClick: onNext, disabled }}
      />
    </Card>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="uppercase"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--sv-ink)",
          fontWeight: 700,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--sv-pink)" }}> *</span>}
      </label>
      {children}
      {hint && (
        <span
          style={{
            fontFamily: "var(--sv-sans)",
            fontSize: 12,
            color: "var(--sv-muted)",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Connect Instagram
// ──────────────────────────────────────────────────────────────────
function StepConnect({
  handle,
  setHandle,
  onConnect,
  onBack,
  onSkip,
}: {
  handle: string;
  setHandle: (v: string) => void;
  onConnect: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const clean = handle.replace(/^@/, "").trim();
  return (
    <Card>
      <Eyebrow>● Passo 02 · Instagram</Eyebrow>
      <H1>
        Conecta o <em className="italic">Instagram</em>.
      </H1>
      <Sub>
        A gente lê seus últimos posts, bio e link pra inferir nicho, tom, público e pilares — sem você escrever nada. Leva uns 20 segundos.
      </Sub>
      <div
        className="flex items-center gap-4 p-5"
        style={{
          background: "var(--sv-soft)",
          border: "1.5px solid var(--sv-ink)",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background:
              "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
            border: "1.5px solid var(--sv-ink)",
          }}
        >
          <Instagram size={24} color="#fff" />
        </div>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--sv-display)",
              fontSize: 22,
              color: "var(--sv-ink)",
              marginBottom: 4,
            }}
          >
            Seu @ do Instagram
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center"
              style={{
                width: 34,
                height: 38,
                borderRight: "1.5px solid var(--sv-ink)",
                fontFamily: "var(--sv-display)",
                fontSize: 16,
                color: "var(--sv-ink)",
                background: "var(--sv-white)",
                border: "1.5px solid var(--sv-ink)",
              }}
            >
              @
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
              placeholder="seuhandle"
              className="sv-input flex-1"
              style={{ padding: "10px 12px", fontSize: 14 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && clean) onConnect();
              }}
            />
          </div>
        </div>
        <button
          onClick={onConnect}
          disabled={!clean}
          className="sv-btn sv-btn-primary"
          style={{
            padding: "14px 22px",
            fontSize: 12,
            opacity: clean ? 1 : 0.5,
          }}
        >
          Conectar →
        </button>
      </div>
      <Footer
        back={{ label: "Voltar", onClick: onBack }}
        secondary={{ label: "Pular por enquanto", onClick: onSkip }}
        primary={{
          label: "Analisar →",
          onClick: onConnect,
          disabled: !clean,
        }}
      />
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Analyze (live sidebar)
// ──────────────────────────────────────────────────────────────────
function StepAnalyze({
  phase,
  scrapedProfile,
  analysis,
  analyzing,
  error,
  onRetry,
  onBack,
  onNext,
}: {
  phase: 0 | 1 | 2 | 3 | 4;
  scrapedProfile: ScrapedProfile | null;
  analysis: BrandAnalysisResult | null;
  analyzing: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const steps = [
    { id: 1, label: "Importar posts" },
    { id: 2, label: "Ler bio e link" },
    { id: 3, label: "Analisar posts" },
    { id: 4, label: "Montar DNA" },
  ];

  return (
    <Card pad={0}>
      <div className="grid" style={{ gridTemplateColumns: "260px 1fr", minHeight: 420 }}>
        {/* Sidebar */}
        <aside
          style={{
            padding: 28,
            borderRight: "1.5px solid var(--sv-ink)",
            background: "var(--sv-soft)",
          }}
        >
          <Eyebrow>Análise IA</Eyebrow>
          <div className="flex flex-col gap-5">
            {steps.map((s) => {
              const done = phase > s.id;
              const active = phase === s.id;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "1.5px solid var(--sv-ink)",
                      background: done
                        ? "var(--sv-green)"
                        : active
                          ? "var(--sv-white)"
                          : "transparent",
                    }}
                  >
                    {done ? (
                      <Check size={14} color="#0A0A0A" strokeWidth={2.5} />
                    ) : active ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                        style={{ color: "var(--sv-ink)" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--sv-mono)",
                          fontSize: 11,
                          color: "var(--sv-muted)",
                        }}
                      >
                        {s.id}
                      </span>
                    )}
                  </span>
                  <span
                    className="uppercase"
                    style={{
                      fontFamily: "var(--sv-mono)",
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      color: active || done ? "var(--sv-ink)" : "var(--sv-muted)",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          {error && (
            <div
              className="mt-6"
              style={{
                padding: "12px 14px",
                border: "1.5px solid #C23A1E",
                background: "#FFE8E4",
                color: "#7A1D0D",
                fontFamily: "var(--sv-sans)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={onBack}
            className="sv-btn sv-btn-ghost mt-6"
            style={{ padding: "8px 12px", fontSize: 11 }}
          >
            ← Voltar
          </button>
        </aside>

        {/* Main panel */}
        <div style={{ padding: 28 }}>
          {scrapedProfile ? (
            <ProfileHeader sp={scrapedProfile} />
          ) : (
            <div
              className="animate-pulse"
              style={{
                height: 120,
                background: "var(--sv-soft)",
                border: "1.5px solid var(--sv-ink)",
              }}
            />
          )}

          <div
            className="mt-6"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--sv-muted)",
              textTransform: "uppercase",
            }}
          >
            Posts analisados
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const post = scrapedProfile?.recentPosts[i];
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    border: "1.5px solid var(--sv-ink)",
                    background: post ? "var(--sv-white)" : "var(--sv-soft)",
                    padding: 10,
                    fontFamily: "var(--sv-sans)",
                    fontSize: 11,
                    lineHeight: 1.35,
                    color: "var(--sv-ink)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {post ? (
                    <>
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {post.text || "(sem legenda)"}
                      </div>
                      <div
                        className="uppercase"
                        style={{
                          position: "absolute",
                          bottom: 6,
                          left: 10,
                          right: 10,
                          fontFamily: "var(--sv-mono)",
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          color: "var(--sv-muted)",
                        }}
                      >
                        ❤ {post.likes} · 💬 {post.comments}
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="mt-8 flex items-center justify-between gap-3"
            style={{ borderTop: "1.5px solid var(--sv-ink)", paddingTop: 16 }}
          >
            {error ? (
              <button
                onClick={onRetry}
                className="sv-btn sv-btn-ghost"
                style={{ padding: "10px 14px", fontSize: 11 }}
              >
                ↻ Tentar de novo
              </button>
            ) : (
              <span
                className="uppercase"
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "var(--sv-muted)",
                }}
              >
                {analyzing ? "Calibrando..." : analysis ? "Análise pronta" : "Aguardando..."}
              </span>
            )}
            <button
              onClick={onNext}
              disabled={!analysis && !error}
              className="sv-btn sv-btn-primary"
              style={{
                padding: "14px 22px",
                fontSize: 12,
                opacity: !analysis && !error ? 0.5 : 1,
              }}
            >
              {analysis ? "Ver meu DNA →" : "Continuar →"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProfileHeader({ sp }: { sp: ScrapedProfile }) {
  return (
    <div
      className="flex items-center gap-4"
      style={{
        padding: 18,
        border: "1.5px solid var(--sv-ink)",
        background: "var(--sv-white)",
      }}
    >
      {sp.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sp.avatarUrl}
          alt={sp.handle}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1.5px solid var(--sv-ink)",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--sv-green)",
            border: "1.5px solid var(--sv-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--sv-display)",
            fontSize: 24,
            color: "var(--sv-ink)",
          }}
        >
          {(sp.name ?? sp.handle).slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "var(--sv-display)",
            fontSize: 20,
            color: "var(--sv-ink)",
          }}
        >
          {sp.name ?? `@${sp.handle}`}
        </div>
        <div
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 11,
            color: "var(--sv-muted)",
            letterSpacing: "0.1em",
          }}
        >
          @{sp.handle}
          {sp.followers != null && (
            <>
              {" · "}
              {sp.followers.toLocaleString("pt-BR")} seguidores
            </>
          )}
        </div>
        {sp.bio && (
          <p
            className="mt-2 truncate"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 13,
              color: "var(--sv-ink)",
            }}
          >
            {sp.bio}
          </p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: DNA (editable summary)
// ──────────────────────────────────────────────────────────────────
function StepDNA({
  scrapedProfile,
  analysis,
  who,
  setWho,
  audience,
  setAudience,
  styleLine,
  setStyleLine,
  pillars,
  setPillars,
  onBack,
  onNext,
}: {
  scrapedProfile: ScrapedProfile | null;
  analysis: BrandAnalysisResult | null;
  who: string;
  setWho: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  styleLine: string;
  setStyleLine: (v: string) => void;
  pillars: string;
  setPillars: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const niche = analysis?.detected_niche ?? [];
  return (
    <Card>
      <Eyebrow>● Passo 03 · DNA</Eyebrow>
      <H1>
        O que a gente <em className="italic">descobriu</em> sobre você.
      </H1>
      <Sub>
        Tudo abaixo foi inferido pela IA do seu Instagram. Só ajusta o que estiver errado — o resto a gente usa como verdade do perfil.
      </Sub>

      {niche.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {niche.map((n) => (
            <span
              key={n}
              className="uppercase"
              style={{
                padding: "6px 12px",
                border: "1.5px solid var(--sv-ink)",
                background: "var(--sv-green)",
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                fontWeight: 700,
                color: "var(--sv-ink)",
              }}
            >
              {n}
            </span>
          ))}
          {analysis?.tone_detected && (
            <span
              className="uppercase"
              style={{
                padding: "6px 12px",
                border: "1.5px solid var(--sv-ink)",
                background: "var(--sv-pink)",
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                fontWeight: 700,
                color: "var(--sv-ink)",
              }}
            >
              Tom: {analysis.tone_detected}
            </span>
          )}
          {scrapedProfile?.followers != null && (
            <span
              className="uppercase"
              style={{
                padding: "6px 12px",
                border: "1.5px solid var(--sv-ink)",
                background: "var(--sv-white)",
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                fontWeight: 700,
                color: "var(--sv-ink)",
              }}
            >
              {scrapedProfile.followers.toLocaleString("pt-BR")} seguidores
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4">
        <DnaField label="Quem você é" value={who} onChange={setWho} rows={3} />
        <DnaField label="Público-alvo" value={audience} onChange={setAudience} rows={3} />
        <DnaField label="Estilo de comunicação" value={styleLine} onChange={setStyleLine} rows={2} />
        <DnaField
          label="Pilares de conteúdo (separados por vírgula)"
          value={pillars}
          onChange={setPillars}
          rows={2}
        />
      </div>

      <Footer
        back={{ label: "Voltar", onClick: onBack }}
        primary={{ label: "Identidade visual →", onClick: onNext }}
      />
    </Card>
  );
}

function DnaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--sv-ink)",
            fontWeight: 700,
          }}
        >
          {label}
        </label>
        <Pencil size={12} style={{ color: "var(--sv-muted)" }} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="sv-input"
        style={{
          padding: 14,
          fontFamily: "var(--sv-sans)",
          fontSize: 13,
          lineHeight: 1.5,
          background: "var(--sv-white)",
          border: "1.5px solid var(--sv-ink)",
          color: "var(--sv-ink)",
          resize: "vertical",
          outline: 0,
          boxShadow: "3px 3px 0 0 var(--sv-ink)",
        }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Visual identity
// ──────────────────────────────────────────────────────────────────
function StepVisual({
  colorId,
  setColorId,
  imageStyleId,
  setImageStyleId,
  designId,
  setDesignId,
  onBack,
  onNext,
}: {
  colorId: string;
  setColorId: (v: string) => void;
  imageStyleId: string;
  setImageStyleId: (v: string) => void;
  designId: string;
  setDesignId: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <Eyebrow>● Passo 04 · Identidade visual</Eyebrow>
      <H1>
        Escolha a <em className="italic">cara</em> dos seus posts.
      </H1>
      <Sub>
        Cor de destaque, estilo de imagem e design do carrossel. Dá pra mudar tudo depois em Ajustes.
      </Sub>

      <div className="mb-8">
        <MiniLabel>Cor da marca</MiniLabel>
        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((c) => {
            const on = colorId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setColorId(c.id)}
                className="flex flex-col items-center"
                style={{ cursor: "pointer" }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: c.hex,
                    border: on ? "3px solid var(--sv-ink)" : "1.5px solid var(--sv-ink)",
                    boxShadow: on ? "3px 3px 0 0 var(--sv-ink)" : "none",
                    transform: on ? "translate(-1px, -1px)" : "none",
                  }}
                />
                <span
                  className="uppercase mt-1.5"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: on ? "var(--sv-ink)" : "var(--sv-muted)",
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <MiniLabel>Estilo de imagem</MiniLabel>
        <div className="grid sm:grid-cols-3 gap-3">
          {IMAGE_STYLES.map((s) => {
            const on = imageStyleId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setImageStyleId(s.id)}
                className="text-left"
                style={{
                  padding: 18,
                  background: on ? "var(--sv-green)" : "var(--sv-white)",
                  border: "1.5px solid var(--sv-ink)",
                  boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                  transform: on ? "translate(-1px, -1px)" : "none",
                  cursor: "pointer",
                }}
              >
                <ImageIcon size={20} style={{ color: "var(--sv-ink)" }} />
                <div
                  className="mt-3"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--sv-ink)",
                  }}
                >
                  {s.label}
                </div>
                <div
                  className="uppercase"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: on ? "var(--sv-ink)" : "var(--sv-muted)",
                    marginTop: 4,
                  }}
                >
                  {s.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2">
        <MiniLabel>Design do carrossel</MiniLabel>
        <div className="grid sm:grid-cols-2 gap-3">
          {DESIGN_STYLES.map((s) => {
            const on = designId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setDesignId(s.id)}
                className="text-left"
                style={{
                  padding: 18,
                  background: on ? "var(--sv-green)" : "var(--sv-white)",
                  border: "1.5px solid var(--sv-ink)",
                  boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                  transform: on ? "translate(-1px, -1px)" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--sv-display)",
                    fontSize: 22,
                    color: "var(--sv-ink)",
                    marginBottom: 6,
                  }}
                >
                  {s.label}
                </div>
                <div
                  className="uppercase"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: on ? "var(--sv-ink)" : "var(--sv-muted)",
                  }}
                >
                  {s.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Footer
        back={{ label: "Voltar", onClick: onBack }}
        primary={{ label: "Ver ideias geradas →", onClick: onNext }}
      />
    </Card>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase mb-3"
      style={{
        fontFamily: "var(--sv-mono)",
        fontSize: 10,
        letterSpacing: "0.18em",
        color: "var(--sv-ink)",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Approve 3 ideas
// ──────────────────────────────────────────────────────────────────
function StepIdeas({
  ideas,
  idx,
  loading,
  approvedCount,
  onApprove,
  onReject,
  onSkip,
  onNext,
}: {
  ideas: Suggestion[];
  idx: number;
  loading: boolean;
  approvedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  const current = ideas[idx];
  const total = Math.min(ideas.length, 3);
  const done = approvedCount >= 3 || (!current && !loading);

  useEffect(() => {
    if (done && ideas.length > 0) {
      const t = setTimeout(onNext, 600);
      return () => clearTimeout(t);
    }
  }, [done, ideas.length, onNext]);

  return (
    <Card>
      <Eyebrow>● Passo 05 · Ideias aprovadas</Eyebrow>
      <H1>
        Aprove <em className="italic">3 ideias</em> de conteúdo.
      </H1>
      <Sub>
        A gente gera 6 ângulos com base no seu DNA. Deslize ✓ pra aprovar ou ✕ pra descartar. Precisa de 3 aprovadas pra continuar.
      </Sub>

      {/* Progress */}
      <div
        className="flex items-center gap-3 mb-5"
        style={{ fontFamily: "var(--sv-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        <div
          className="flex-1"
          style={{
            height: 5,
            background: "rgba(10,10,10,0.1)",
            border: "1px solid var(--sv-ink)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(approvedCount / 3) * 100}%`,
              background: "var(--sv-green)",
              transition: "width .3s",
            }}
          />
        </div>
        <span>{approvedCount} de 3</span>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center"
            style={{
              height: 220,
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-soft)",
            }}
          >
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--sv-ink)" }} />
            <span
              className="uppercase mt-3"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--sv-ink)",
              }}
            >
              Gerando ideias…
            </span>
          </motion.div>
        )}
        {current && !loading && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center text-center"
            style={{
              padding: 32,
              minHeight: 220,
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-white)",
              boxShadow: "4px 4px 0 0 var(--sv-ink)",
            }}
          >
            <div
              className="uppercase mb-3"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--sv-muted)",
              }}
            >
              Ideia {idx + 1} / {Math.max(total, 3)}
            </div>
            <h2
              style={{
                fontFamily: "var(--sv-display)",
                fontSize: "clamp(20px, 3vw, 26px)",
                lineHeight: 1.25,
                color: "var(--sv-ink)",
                marginBottom: 10,
                maxWidth: 600,
              }}
            >
              {current.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--sv-sans)",
                fontSize: 13,
                color: "var(--sv-muted)",
                maxWidth: 520,
                lineHeight: 1.55,
              }}
            >
              {current.angle}
            </p>
          </motion.div>
        )}
        {!current && !loading && ideas.length > 0 && approvedCount < 3 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{
              padding: 24,
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-soft)",
            }}
          >
            <p
              className="uppercase"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "var(--sv-muted)",
              }}
            >
              Fim das ideias geradas. Siga com o que você aprovou.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {current && !loading && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={onReject}
            className="sv-btn sv-btn-ghost"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-white)",
            }}
            aria-label="Descartar"
          >
            <X size={20} />
          </button>
          <button
            onClick={onApprove}
            className="sv-btn sv-btn-primary"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Aprovar"
          >
            <Check size={22} strokeWidth={3} />
          </button>
        </div>
      )}

      <Footer
        secondary={{
          label: approvedCount > 0 ? "Já aprovei o suficiente →" : "Pular etapa",
          onClick: onNext,
        }}
        primary={{
          label: approvedCount >= 3 ? "Gerar posts →" : `Faltam ${3 - approvedCount}`,
          onClick: onNext,
          disabled: approvedCount < 1,
        }}
        back={{ label: "Voltar", onClick: onSkip }}
      />
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Autopilot toggle
// ──────────────────────────────────────────────────────────────────
function StepAutopilot({
  on,
  setOn,
  onBack,
  onNext,
}: {
  on: boolean;
  setOn: (v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <Eyebrow>● Passo 06 · Piloto automático</Eyebrow>
      <H1>
        Quer que a IA <em className="italic">publique sozinha</em>?
      </H1>
      <Sub>
        Opcional. Quando ligado, o Sequência Viral cria 3 carrosséis por semana e publica nos horários de pico. Desliga a qualquer momento.
      </Sub>
      <div
        className="flex items-center gap-4 p-5"
        style={{
          background: on ? "var(--sv-green)" : "var(--sv-white)",
          border: "1.5px solid var(--sv-ink)",
          boxShadow: "4px 4px 0 0 var(--sv-ink)",
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            border: "1.5px solid var(--sv-ink)",
            background: on ? "var(--sv-ink)" : "var(--sv-white)",
          }}
        >
          <Zap size={20} color={on ? "#7CF067" : "#0A0A0A"} />
        </span>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--sv-sans)",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--sv-ink)",
            }}
          >
            Ativar piloto automático
          </div>
          <div
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 13,
              color: "var(--sv-ink)",
              opacity: 0.8,
            }}
          >
            3 posts por semana, sem intervenção manual.
          </div>
        </div>
        <button
          onClick={() => setOn(!on)}
          style={{
            width: 58,
            height: 32,
            borderRadius: 16,
            border: "1.5px solid var(--sv-ink)",
            background: on ? "var(--sv-ink)" : "var(--sv-white)",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: on ? 28 : 3,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: on ? "var(--sv-green)" : "var(--sv-ink)",
              transition: "left .25s",
            }}
          />
        </button>
      </div>
      <Footer
        back={{ label: "Voltar", onClick: onBack }}
        primary={{ label: "Ver meus posts →", onClick: onNext }}
      />
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: First 3 posts preview
// ──────────────────────────────────────────────────────────────────
function StepPosts({
  scrapedProfile,
  ideas,
  designId,
  colorHex,
  onContinue,
}: {
  scrapedProfile: ScrapedProfile | null;
  ideas: Suggestion[];
  designId: string;
  colorHex: string;
  onContinue: () => void;
}) {
  const [modalIdea, setModalIdea] = useState<Suggestion | null>(null);
  const three = ideas.slice(0, 3);
  const placeholders = useMemo(() => {
    const fillers: Suggestion[] = [
      { id: "p1", title: "O erro que trava seu próximo post.", hook: "", angle: "Padrões que matam conversão antes do slide 2." },
      { id: "p2", title: "Como a audiência lê antes de decidir.", hook: "", angle: "Os 3 segundos que definem tudo." },
      { id: "p3", title: "O que ninguém vai te contar sobre alcance.", hook: "", angle: "Métricas honestas vs métricas vaidosas." },
    ];
    return three.length >= 3 ? three : [...three, ...fillers.slice(0, 3 - three.length)];
  }, [three]);

  return (
    <Card>
      <Eyebrow>● Passo 07 · Seus primeiros posts</Eyebrow>
      <H1>
        <em className="italic">Prontinho.</em> Seus 3 primeiros carrosséis.
      </H1>
      <Sub>
        Gerados com base no seu DNA, pilares e identidade visual. Clica num post pra ver em tamanho grande. Dá pra refinar cada um no editor depois.
      </Sub>
      {scrapedProfile && (
        <div className="mb-5">
          <ProfileHeader sp={scrapedProfile} />
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-4">
        {placeholders.map((idea, i) => (
          <PostMockup
            key={idea.id + i}
            title={idea.title}
            handle={scrapedProfile?.handle ?? "seuhandle"}
            designId={designId}
            colorHex={colorHex}
            onClick={() => setModalIdea(idea)}
          />
        ))}
      </div>
      <div
        className="mt-10 flex items-center justify-between gap-3"
        style={{ borderTop: "1.5px solid var(--sv-ink)", paddingTop: 20 }}
      >
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--sv-muted)",
          }}
        >
          {scrapedProfile?.followers != null
            ? `${scrapedProfile.followers.toLocaleString("pt-BR")} seguidores prontos pra ver isso`
            : "3 posts prontos"}
        </span>
        <button
          onClick={onContinue}
          className="sv-btn sv-btn-primary"
          style={{ padding: "14px 22px", fontSize: 12 }}
        >
          Continuar pro plano →
        </button>
      </div>

      <AnimatePresence>
        {modalIdea && (
          <PostModal
            idea={modalIdea}
            handle={scrapedProfile?.handle ?? "seuhandle"}
            designId={designId}
            colorHex={colorHex}
            onClose={() => setModalIdea(null)}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}

function PostMockup({
  title,
  handle,
  designId,
  colorHex,
  onClick,
}: {
  title: string;
  handle: string;
  designId: string;
  colorHex: string;
  onClick: () => void;
}) {
  const isManifesto = designId === "manifesto";
  return (
    <button
      onClick={onClick}
      style={{
        aspectRatio: "4 / 5",
        background: isManifesto ? "var(--sv-navy)" : "var(--sv-paper)",
        border: "1.5px solid var(--sv-ink)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "transform .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-2px, -2px)";
        e.currentTarget.style.boxShadow = "4px 4px 0 0 var(--sv-ink)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div>
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: isManifesto ? colorHex : "var(--sv-ink)",
            fontWeight: 700,
          }}
        >
          {isManifesto ? "MANIFESTO" : "TWITTER"}
        </span>
        <h3
          className="mt-4"
          style={{
            fontFamily: "var(--sv-display)",
            fontSize: "clamp(18px, 2.6vw, 22px)",
            lineHeight: 1.15,
            color: isManifesto ? "#fff" : "var(--sv-ink)",
          }}
        >
          {title}
        </h3>
      </div>
      <div>
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: isManifesto ? "rgba(255,255,255,.7)" : "var(--sv-muted)",
          }}
        >
          @{handle}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: 4,
          background: colorHex,
        }}
      />
    </button>
  );
}

function PostModal({
  idea,
  handle,
  designId,
  colorHex,
  onClose,
}: {
  idea: Suggestion;
  handle: string;
  designId: string;
  colorHex: string;
  onClose: () => void;
}) {
  const isManifesto = designId === "manifesto";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(500px, 100%)",
          aspectRatio: "4 / 5",
          background: isManifesto ? "var(--sv-navy)" : "var(--sv-paper)",
          border: "1.5px solid var(--sv-ink)",
          padding: 36,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            border: "1.5px solid var(--sv-ink)",
            background: "var(--sv-white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
        <div>
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: isManifesto ? colorHex : "var(--sv-ink)",
              fontWeight: 700,
            }}
          >
            {isManifesto ? "MANIFESTO" : "TWITTER"} · SLIDE 1 / 5
          </span>
          <h2
            className="mt-5"
            style={{
              fontFamily: "var(--sv-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.1,
              color: isManifesto ? "#fff" : "var(--sv-ink)",
            }}
          >
            {idea.title}
          </h2>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 14,
              lineHeight: 1.55,
              color: isManifesto ? "rgba(255,255,255,.78)" : "var(--sv-muted)",
              maxWidth: 380,
            }}
          >
            {idea.angle}
          </p>
        </div>
        <div>
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: isManifesto ? "rgba(255,255,255,.65)" : "var(--sv-ink)",
            }}
          >
            @{handle}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 6,
            background: colorHex,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Step: Done → finish
// ──────────────────────────────────────────────────────────────────
function StepDone({
  saving,
  onFinish,
  approved,
  autopilot,
}: {
  saving: boolean;
  onFinish: () => void;
  approved: number;
  autopilot: boolean;
}) {
  return (
    <Card>
      <Eyebrow>● Passo 08 · Último passo</Eyebrow>
      <H1>
        Tudo pronto. Bora <em className="italic">publicar</em>?
      </H1>
      <Sub>
        Seu DNA está salvo. Os posts aprovados entram no editor com seu estilo. Se quiser escolher um plano, clica em continuar.
      </Sub>
      <ul className="flex flex-col gap-3 mb-6">
        <Done label="DNA capturado" />
        <Done label="Identidade visual definida" />
        <Done label={`${approved} ideia${approved === 1 ? "" : "s"} aprovada${approved === 1 ? "" : "s"}`} />
        <Done label={autopilot ? "Piloto automático ligado" : "Modo manual (edita antes de publicar)"} />
      </ul>
      <Footer
        primary={{
          label: saving ? "Salvando…" : "Continuar →",
          onClick: onFinish,
          disabled: saving,
          loading: saving,
        }}
      />
    </Card>
  );
}

function Done({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className="flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1.5px solid var(--sv-ink)",
          background: "var(--sv-green)",
        }}
      >
        <Check size={13} color="#0A0A0A" strokeWidth={2.5} />
      </span>
      <span
        style={{
          fontFamily: "var(--sv-sans)",
          fontSize: 14,
          color: "var(--sv-ink)",
        }}
      >
        {label}
      </span>
    </li>
  );
}
