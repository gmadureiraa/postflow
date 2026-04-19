"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, type BrandAnalysis } from "@/lib/auth-context";
import {
  PLANS,
  type PlanId,
  FREE_PLAN_USAGE_LIMIT,
  BUSINESS_USAGE_LIMIT_SENTINEL,
} from "@/lib/pricing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Save,
  AlertTriangle,
  X,
  Loader2,
  Check,
  ExternalLink,
  CreditCard,
  LogOut,
  Sparkles,
  Instagram,
  Linkedin,
  Plug,
  Mail,
  Bell,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { jsonWithAuth } from "@/lib/api-auth-headers";
import posthog from "posthog-js";

function isPaidPlanParam(id: string): id is PlanId {
  return id === "pro" || id === "business";
}

type TabId =
  | "profile"
  | "branding"
  | "social"
  | "voice"
  | "notifications"
  | "plan"
  | "security";

const TABS: { id: TabId; label: string; glyph: string }[] = [
  { id: "profile", label: "Perfil", glyph: "◉" },
  { id: "branding", label: "Branding padrão", glyph: "◆" },
  { id: "social", label: "Redes", glyph: "❋" },
  { id: "voice", label: "Voz IA", glyph: "✦" },
  { id: "notifications", label: "Notificações", glyph: "●" },
  { id: "plan", label: "Plano", glyph: "☆" },
  { id: "security", label: "Segurança", glyph: "▲" },
];

// ──────────────────────────────────────────────────────────────────
// Voice options (Editorial ✦, Direto ◆, Provocador ❋, Pessoal ☆)
// Mapeia para o campo `tone` via VOICE_TO_TONE (consistente com onboarding)
// ──────────────────────────────────────────────────────────────────
const VOICE_TO_TONE: Record<string, string> = {
  editorial: "educational",
  direct: "professional",
  provocative: "provocative",
  personal: "casual",
};
const TONE_TO_VOICE: Record<string, string> = {
  educational: "editorial",
  professional: "direct",
  provocative: "provocative",
  casual: "personal",
};

const VOICE_OPTIONS: {
  value: string;
  glyph: string;
  label: string;
  desc: string;
  sample: string;
}[] = [
  {
    value: "editorial",
    glyph: "✦",
    label: "Editorial",
    desc: "Analítico, ensaístico, prova com dado.",
    sample:
      "A maioria dos criadores confunde consistência com repetição. São coisas opostas, e a diferença custa caro.",
  },
  {
    value: "direct",
    glyph: "◆",
    label: "Direto",
    desc: "Curto, afiado, vai na jugular.",
    sample:
      "Se você ainda posta sem um ponto de vista, você não é criador — é jornalista do óbvio.",
  },
  {
    value: "provocative",
    glyph: "❋",
    label: "Provocador",
    desc: "Conflito, contrário, abre debate.",
    sample:
      "Pare de seguir gurus de marketing. Eles ganham ensinando, não praticando. Você tá pagando a escola deles.",
  },
  {
    value: "personal",
    glyph: "☆",
    label: "Pessoal",
    desc: "Bastidor, vulnerável, humano.",
    sample:
      "Demorei 3 anos pra aceitar que ninguém ia ler meu texto se eu não botasse a cara. Hoje, é isso que cola.",
  },
];

// ──────────────────────────────────────────────────────────────────
// Branding — cores e fontes (do handoff)
// ──────────────────────────────────────────────────────────────────
const ACCENT_SWATCHES = [
  { value: "#7CF067", name: "Verde" },
  { value: "#D262B2", name: "Pink" },
  { value: "#FF4A1C", name: "Laranja" },
  { value: "#F5C518", name: "Amarelo" },
  { value: "#2B5FFF", name: "Azul" },
  { value: "#0A0A0A", name: "Preto" },
];

const FONT_OPTIONS = [
  { value: "serif", label: "Serif", font: "var(--sv-display)", italic: true },
  { value: "anton", label: "Anton", font: "'Anton', sans-serif" },
  { value: "archivo", label: "Archivo", font: "'Archivo Black', sans-serif" },
  { value: "bebas", label: "Bebas", font: "'Bebas Neue', sans-serif" },
  { value: "grotesk", label: "Grotesk", font: "'Space Grotesk', sans-serif" },
];

// ──────────────────────────────────────────────────────────────────
// Notificações (salvas em brand_analysis.__notifications — JSONB sidecar)
// ──────────────────────────────────────────────────────────────────
type NotifPrefs = {
  carousel_ready: boolean;
  upgrade_available: boolean;
  weekly_summary: boolean;
  limit_warnings: boolean;
};
const DEFAULT_NOTIFS: NotifPrefs = {
  carousel_ready: true,
  upgrade_available: true,
  weekly_summary: true,
  limit_warnings: true,
};

function readNotifsFromProfile(
  brand: BrandAnalysis | undefined | null
): NotifPrefs {
  const raw = (brand as unknown as Record<string, unknown> | null | undefined)?.[
    "__notifications"
  ];
  if (!raw || typeof raw !== "object") return { ...DEFAULT_NOTIFS };
  const r = raw as Record<string, unknown>;
  return {
    carousel_ready:
      typeof r.carousel_ready === "boolean"
        ? r.carousel_ready
        : DEFAULT_NOTIFS.carousel_ready,
    upgrade_available:
      typeof r.upgrade_available === "boolean"
        ? r.upgrade_available
        : DEFAULT_NOTIFS.upgrade_available,
    weekly_summary:
      typeof r.weekly_summary === "boolean"
        ? r.weekly_summary
        : DEFAULT_NOTIFS.weekly_summary,
    limit_warnings:
      typeof r.limit_warnings === "boolean"
        ? r.limit_warnings
        : DEFAULT_NOTIFS.limit_warnings,
  };
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, updateProfile, signOut, session, refreshProfile } =
    useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile core states (preserved)
  const [name, setName] = useState(profile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [twitterHandle, setTwitterHandle] = useState(
    profile?.twitter_handle || ""
  );
  const [instagramHandle, setInstagramHandle] = useState(
    profile?.instagram_handle || ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [niche, setNiche] = useState<string[]>(profile?.niche || []);
  const [tone, setTone] = useState(profile?.tone || "casual");
  const [language, setLanguage] = useState(profile?.language || "pt-br");
  const [carouselStyle, setCarouselStyle] = useState(
    profile?.carousel_style || "white"
  );

  // Branding extras (stored in brand_analysis sidecar as __branding)
  const [kickerDefault, setKickerDefault] = useState("");
  const [footerDefault, setFooterDefault] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_SWATCHES[0].value);
  const [fontChoice, setFontChoice] = useState<string>(FONT_OPTIONS[0].value);

  // Notifications
  const [notifs, setNotifs] = useState<NotifPrefs>(DEFAULT_NOTIFS);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setAvatarUrl(profile.avatar_url || "");
    setTwitterHandle(profile.twitter_handle || "");
    setInstagramHandle(profile.instagram_handle || "");
    setLinkedinUrl(profile.linkedin_url || "");
    setNiche(profile.niche || []);
    setTone(profile.tone || "casual");
    setLanguage(profile.language || "pt-br");
    setCarouselStyle(profile.carousel_style || "white");
    setNotifs(readNotifsFromProfile(profile.brand_analysis));

    const branding = (profile.brand_analysis as unknown as
      | Record<string, unknown>
      | undefined)?.["__branding"] as Record<string, unknown> | undefined;
    if (branding && typeof branding === "object") {
      if (typeof branding.kicker === "string") setKickerDefault(branding.kicker);
      if (typeof branding.footer === "string") setFooterDefault(branding.footer);
      if (typeof branding.accent === "string") setAccentColor(branding.accent);
      if (typeof branding.font === "string") setFontChoice(branding.font);
    }
  }, [profile]);

  useEffect(() => {
    const pay = searchParams.get("payment");
    const planParam = searchParams.get("plan");
    if (pay === "success") {
      setPaymentNotice(
        planParam && isPaidPlanParam(planParam)
          ? `Pagamento confirmado — plano ${PLANS[planParam].name} ativo.`
          : "Pagamento confirmado."
      );
      void refreshProfile();
    } else if (pay === "cancelled") {
      setPaymentNotice("Checkout cancelado. Nada foi cobrado.");
    }
  }, [searchParams, refreshProfile]);

  const NICHE_SUGGESTIONS = [
    "Marketing",
    "IA & Automação",
    "Cripto",
    "Finanças",
    "Educação",
    "Produtividade",
    "Saúde",
    "Design",
    "Tech",
    "Negócios",
  ];

  function toggleNiche(v: string) {
    const value = v.trim();
    if (!value) return;
    if (niche.includes(value)) {
      setNiche(niche.filter((n) => n !== value));
    } else {
      setNiche([...niche, value]);
    }
  }

  function buildBrandAnalysisUpdate(): BrandAnalysis {
    const prev =
      (profile?.brand_analysis as unknown as Record<string, unknown>) || {};
    const merged: Record<string, unknown> = {
      ...prev,
      __notifications: notifs,
      __branding: {
        kicker: kickerDefault,
        footer: footerDefault,
        accent: accentColor,
        font: fontChoice,
      },
    };
    return merged as unknown as BrandAnalysis;
  }

  async function handleSave() {
    setSaving(true);
    setPaymentNotice(null);
    try {
      await updateProfile({
        name,
        avatar_url: avatarUrl,
        twitter_handle: twitterHandle,
        instagram_handle: instagramHandle,
        linkedin_url: linkedinUrl,
        niche,
        tone,
        language,
        carousel_style: carouselStyle,
        brand_analysis: buildBrandAnalysisUpdate(),
      });
      posthog.capture("settings_saved", {
        has_twitter: !!twitterHandle,
        has_instagram: !!instagramHandle,
        has_linkedin: !!linkedinUrl,
        niche_count: niche.length,
        tone,
        language,
        carousel_style: carouselStyle,
        accent: accentColor,
        font: fontChoice,
        notifs_on: Object.values(notifs).filter(Boolean).length,
      });
      setSaved(true);
      toast.success("Alterações salvas.");
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente de novo."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFile(file: File) {
    if (!session) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo precisa ser uma imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máx 8MB.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("carouselId", "avatar");
      form.append("slideIndex", "0");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload falhou.");
      }
      setAvatarUrl(data.url);
      toast.success("Avatar atualizado — lembre de salvar.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha no upload do avatar."
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: jsonWithAuth(session),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error || "Não foi possível excluir a conta.");
        return;
      }
      try {
        localStorage.removeItem("sequencia-viral_onboarding");
      } catch {
        /* ignore */
      }
      await signOut();
      window.location.href = "/";
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao excluir conta."
      );
    }
  }

  const plan = profile?.plan ?? "free";
  const used = profile?.usage_count ?? 0;
  const limit = profile?.usage_limit ?? FREE_PLAN_USAGE_LIMIT;
  const isUnlimited =
    plan === "business" ||
    (typeof limit === "number" && limit >= BUSINESS_USAGE_LIMIT_SENTINEL);
  const usageRatio = isUnlimited
    ? 0
    : Math.max(0, Math.min(1, limit > 0 ? used / limit : 0));
  const usageLabel = isUnlimited
    ? `${used} carrosséis neste ciclo · ilimitado`
    : `${used} / ${limit} carrosséis neste ciclo`;

  const planName =
    plan === "free"
      ? "Grátis"
      : plan === "pro"
        ? PLANS.pro.name
        : plan === "business"
          ? PLANS.business.name
          : plan.charAt(0).toUpperCase() + plan.slice(1);

  const currentVoice = TONE_TO_VOICE[tone] || "personal";
  const handleDefault =
    twitterHandle || instagramHandle || (profile?.email?.split("@")[0] ?? "");

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <span className="sv-eyebrow mb-6">
          <span className="sv-dot" />
          Conta · {profile?.email ?? "sua conta"}
        </span>
        <h1
          className="sv-display mt-6"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Seus <em>ajustes</em>.
        </h1>
        <p
          className="mt-4"
          style={{
            fontFamily: "var(--sv-sans)",
            fontSize: 16,
            color: "var(--sv-muted)",
            maxWidth: 540,
          }}
        >
          Perfil, branding, voz da IA, redes, notificações e plano. Tudo que
          torna o Sequência Viral <em style={{ fontFamily: "var(--sv-display)" }}>seu</em>.
        </p>
      </motion.div>

      {paymentNotice && (
        <div
          className="mb-8 flex items-start justify-between gap-3 px-5 py-4"
          style={{
            border: "1.5px solid var(--sv-ink)",
            background: "var(--sv-green)",
            color: "var(--sv-ink)",
            boxShadow: "3px 3px 0 0 var(--sv-ink)",
            fontFamily: "var(--sv-sans)",
            fontSize: 14,
          }}
        >
          <span>{paymentNotice}</span>
          <button
            type="button"
            onClick={() => setPaymentNotice(null)}
            className="shrink-0"
            aria-label="Fechar aviso"
            style={{ color: "var(--sv-ink)" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Split layout: nav + content */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Nav */}
        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <div
            className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            style={{
              padding: 10,
              border: "1.5px solid var(--sv-ink)",
              background: "var(--sv-white)",
              boxShadow: "4px 4px 0 0 var(--sv-ink)",
            }}
          >
            {TABS.map((t) => {
              const on = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-left transition-all"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    background: on ? "var(--sv-ink)" : "transparent",
                    color: on ? "var(--sv-paper)" : "var(--sv-ink)",
                  }}
                >
                  <span style={{ opacity: on ? 1 : 0.5 }}>{t.glyph}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {/* ========== PERFIL ========== */}
          {activeTab === "profile" && (
            <Section
              title="Seu perfil"
              subtitle="Como você aparece nas exportações e nos slides."
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 shrink-0 object-cover"
                    style={{ border: "1.5px solid var(--sv-ink)" }}
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 shrink-0 items-center justify-center"
                    style={{
                      background: "var(--sv-pink)",
                      border: "1.5px solid var(--sv-ink)",
                      fontFamily: "var(--sv-display)",
                      fontStyle: "italic",
                      fontSize: 38,
                      color: "var(--sv-ink)",
                    }}
                  >
                    {name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex-1">
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: "var(--sv-display)",
                      fontSize: 28,
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {(name || "Você").split(" ").slice(0, 1).join(" ")}{" "}
                    <em>
                      {(name || "").split(" ").slice(1).join(" ") || "criador"}
                    </em>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--sv-mono)",
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--sv-muted)",
                    }}
                  >
                    {profile?.email ?? "—"}
                    {profile?.plan
                      ? ` · plano ${planName.toLowerCase()}`
                      : ""}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label
                      className="sv-btn-outline cursor-pointer"
                      aria-disabled={uploadingAvatar}
                      style={{
                        opacity: uploadingAvatar ? 0.6 : 1,
                        pointerEvents: uploadingAvatar ? "none" : "auto",
                      }}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={12} /> Trocar foto
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleAvatarFile(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        className="sv-btn-ghost"
                        onClick={() => setAvatarUrl("")}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label>URL da foto</Label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="sv-input w-full"
                  placeholder="https://..."
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nome</Label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="sv-input w-full"
                  />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <input
                    type="text"
                    readOnly
                    value={profile?.email || "Não definido"}
                    className="sv-input w-full"
                    style={{
                      background: "var(--sv-soft)",
                      color: "var(--sv-muted)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Handle Twitter / X</Label>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) =>
                      setTwitterHandle(e.target.value.replace(/^@/, ""))
                    }
                    className="sv-input w-full"
                    placeholder="seu_handle"
                  />
                </div>
                <div>
                  <Label>Handle Instagram</Label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) =>
                      setInstagramHandle(e.target.value.replace(/^@/, ""))
                    }
                    className="sv-input w-full"
                    placeholder="seu_handle"
                  />
                </div>
              </div>

              <div className="mt-5">
                <Label>LinkedIn URL</Label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="sv-input w-full"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="mt-5">
                <Label>Nichos e temas</Label>
                <div className="flex flex-wrap gap-2">
                  {NICHE_SUGGESTIONS.map((s) => {
                    const on = niche.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleNiche(s)}
                        className={`sv-chip ${on ? "sv-chip-on" : ""}`}
                      >
                        {on ? "✓ " : "+ "}
                        {s}
                      </button>
                    );
                  })}
                </div>
                {niche.filter((n) => !NICHE_SUGGESTIONS.includes(n)).length >
                  0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {niche
                      .filter((n) => !NICHE_SUGGESTIONS.includes(n))
                      .map((n) => (
                        <button
                          key={n}
                          onClick={() => toggleNiche(n)}
                          className="sv-chip sv-chip-on"
                        >
                          {n} <X size={10} />
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <Label>Idioma</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="sv-input w-full"
                >
                  <option value="pt-br">Português (BR)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </Section>
          )}

          {/* ========== BRANDING ========== */}
          {activeTab === "branding" && (
            <Section
              title="Branding padrão"
              subtitle="Aplicado automaticamente em todo novo carrossel. Dá pra sobrescrever por projeto."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Kicker (header dos slides)</Label>
                  <input
                    type="text"
                    value={kickerDefault}
                    onChange={(e) => setKickerDefault(e.target.value)}
                    className="sv-input w-full"
                    placeholder="Sua Marca · Ed. nº 01"
                  />
                </div>
                <div>
                  <Label>Footer padrão</Label>
                  <input
                    type="text"
                    value={footerDefault}
                    onChange={(e) => setFooterDefault(e.target.value)}
                    className="sv-input w-full"
                    placeholder="© suamarca.com · 2026"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>Handle default</Label>
                <input
                  type="text"
                  value={handleDefault}
                  readOnly
                  className="sv-input w-full"
                  style={{
                    background: "var(--sv-soft)",
                    color: "var(--sv-muted)",
                  }}
                />
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 12,
                    color: "var(--sv-muted)",
                  }}
                >
                  Edite em <strong>Perfil</strong> · puxa do handle do Twitter
                  ou Instagram.
                </p>
              </div>

              <div className="mt-6">
                <Label>Cor de destaque</Label>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_SWATCHES.map((sw) => {
                    const on = accentColor === sw.value;
                    return (
                      <button
                        key={sw.value}
                        type="button"
                        onClick={() => setAccentColor(sw.value)}
                        className="relative flex h-12 w-12 items-center justify-center transition-all"
                        title={sw.name}
                        style={{
                          background: sw.value,
                          border: "1.5px solid var(--sv-ink)",
                          boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                        }}
                      >
                        {on && (
                          <Check
                            size={16}
                            strokeWidth={3}
                            color={
                              sw.value === "#0A0A0A" ? "#F7F5EF" : "#0A0A0A"
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <Label>Fonte display padrão</Label>
                <div className="flex flex-wrap gap-3">
                  {FONT_OPTIONS.map((f) => {
                    const on = fontChoice === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFontChoice(f.value)}
                        className="px-5 py-3 transition-all"
                        style={{
                          border: "1.5px solid var(--sv-ink)",
                          background: on ? "var(--sv-green)" : "var(--sv-white)",
                          boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                          fontFamily: f.font,
                          fontStyle: f.italic ? "italic" : "normal",
                          fontSize: 20,
                          color: "var(--sv-ink)",
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="sv-divider my-8" />

              <Label>Estilo dos slides</Label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "white", label: "Claro" },
                    { value: "dark", label: "Escuro" },
                  ] as const
                ).map((opt) => {
                  const on = carouselStyle === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setCarouselStyle(opt.value)}
                      className="flex items-center justify-between px-4 py-4 text-left transition-all"
                      style={{
                        border: "1.5px solid var(--sv-ink)",
                        background: on
                          ? opt.value === "dark"
                            ? "var(--sv-ink)"
                            : "var(--sv-green)"
                          : "var(--sv-white)",
                        color:
                          on && opt.value === "dark"
                            ? "var(--sv-paper)"
                            : "var(--sv-ink)",
                        boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--sv-display)",
                          fontSize: 22,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {opt.label}
                      </span>
                      {on && <Check size={16} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ========== REDES ========== */}
          {activeTab === "social" && (
            <Section
              title="Redes conectadas"
              subtitle="Handles usados nos slides e nas exportações automáticas."
            >
              <div className="flex flex-col gap-3">
                {/* Instagram */}
                <div
                  className="flex items-center gap-4 p-4"
                  style={{
                    border: "1.5px solid var(--sv-ink)",
                    background: instagramHandle
                      ? "var(--sv-paper)"
                      : "transparent",
                    borderStyle: instagramHandle ? "solid" : "dashed",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #fd1d1d 0%, #e1306c 50%, #c13584 100%)",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  >
                    <Instagram size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: "var(--sv-sans)",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--sv-ink)",
                      }}
                    >
                      Instagram
                      {instagramHandle ? ` · @${instagramHandle}` : ""}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--sv-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--sv-muted)",
                        marginTop: 3,
                      }}
                    >
                      {instagramHandle
                        ? "Conectado · Publicar + agendar"
                        : "Não conectado — agendamento indisponível"}
                    </div>
                  </div>
                  {instagramHandle ? (
                    <button
                      type="button"
                      onClick={() => setInstagramHandle("")}
                      className="sv-btn-outline"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Conecte no campo de handle em Perfil por enquanto."
                        )
                      }
                      className="sv-btn-primary"
                    >
                      <Plug size={12} /> Conectar
                    </button>
                  )}
                </div>

                {/* Twitter / X */}
                <div
                  className="flex items-center gap-4 p-4"
                  style={{
                    border: "1.5px solid var(--sv-ink)",
                    background: twitterHandle
                      ? "var(--sv-paper)"
                      : "transparent",
                    borderStyle: twitterHandle ? "solid" : "dashed",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{
                      background: "var(--sv-ink)",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: "var(--sv-sans)",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--sv-ink)",
                      }}
                    >
                      Twitter / X
                      {twitterHandle ? ` · @${twitterHandle}` : ""}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--sv-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--sv-muted)",
                        marginTop: 3,
                      }}
                    >
                      {twitterHandle
                        ? "Conectado · Threads automáticas"
                        : "Não conectado — threads automáticas"}
                    </div>
                  </div>
                  {twitterHandle ? (
                    <button
                      type="button"
                      onClick={() => setTwitterHandle("")}
                      className="sv-btn-outline"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Conecte no campo de handle em Perfil por enquanto."
                        )
                      }
                      className="sv-btn-primary"
                    >
                      <Plug size={12} /> Conectar
                    </button>
                  )}
                </div>

                {/* LinkedIn */}
                <div
                  className="flex items-center gap-4 p-4"
                  style={{
                    border: "1.5px solid var(--sv-ink)",
                    background: linkedinUrl ? "var(--sv-paper)" : "transparent",
                    borderStyle: linkedinUrl ? "solid" : "dashed",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{
                      background: "#0A66C2",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  >
                    <Linkedin size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: "var(--sv-sans)",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--sv-ink)",
                      }}
                    >
                      LinkedIn
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--sv-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--sv-muted)",
                        marginTop: 3,
                      }}
                    >
                      {linkedinUrl
                        ? "Perfil salvo"
                        : "Não conectado — export manual"}
                    </div>
                  </div>
                  {linkedinUrl ? (
                    <button
                      type="button"
                      onClick={() => setLinkedinUrl("")}
                      className="sv-btn-outline"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Conecte no campo de URL do LinkedIn em Perfil por enquanto."
                        )
                      }
                      className="sv-btn-primary"
                    >
                      <Plug size={12} /> Conectar
                    </button>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* ========== VOZ IA ========== */}
          {activeTab === "voice" && (
            <Section
              title="Voz da IA"
              subtitle="Guia o tom que o modelo prioriza nos seus carrosséis. Veja o exemplo em cada opção."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {VOICE_OPTIONS.map((v) => {
                  const on = currentVoice === v.value;
                  return (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() =>
                        setTone(VOICE_TO_TONE[v.value] || "casual")
                      }
                      className="p-5 text-left transition-all"
                      style={{
                        border: "1.5px solid var(--sv-ink)",
                        background: on ? "var(--sv-green)" : "var(--sv-white)",
                        boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                      }}
                    >
                      <div
                        className="mb-2 flex items-center justify-between"
                        style={{
                          fontFamily: "var(--sv-mono)",
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--sv-ink)",
                          fontWeight: 700,
                        }}
                      >
                        <span>
                          <span style={{ marginRight: 6 }}>{v.glyph}</span>
                          {v.label}
                        </span>
                        {on && <Check size={14} strokeWidth={2.5} />}
                      </div>
                      <div
                        className="mb-3"
                        style={{
                          fontFamily: "var(--sv-sans)",
                          fontSize: 13,
                          color: "var(--sv-ink)",
                          fontWeight: 600,
                        }}
                      >
                        {v.desc}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--sv-display)",
                          fontStyle: "italic",
                          fontSize: 15,
                          lineHeight: 1.35,
                          color: on ? "var(--sv-ink)" : "var(--sv-muted)",
                          borderLeft: "2px solid var(--sv-ink)",
                          paddingLeft: 10,
                        }}
                      >
                        “{v.sample}”
                      </div>
                    </button>
                  );
                })}
              </div>

              <hr className="sv-divider my-8" />

              <Label>Nichos e temas</Label>
              <div className="flex flex-wrap gap-2">
                {NICHE_SUGGESTIONS.map((s) => {
                  const on = niche.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleNiche(s)}
                      className={`sv-chip ${on ? "sv-chip-on" : ""}`}
                    >
                      {on ? "✓ " : "+ "}
                      {s}
                    </button>
                  );
                })}
              </div>
              {niche.filter((n) => !NICHE_SUGGESTIONS.includes(n)).length >
                0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {niche
                    .filter((n) => !NICHE_SUGGESTIONS.includes(n))
                    .map((n) => (
                      <button
                        key={n}
                        onClick={() => toggleNiche(n)}
                        className="sv-chip sv-chip-on"
                      >
                        {n} <X size={10} />
                      </button>
                    ))}
                </div>
              )}
            </Section>
          )}

          {/* ========== NOTIFICAÇÕES ========== */}
          {activeTab === "notifications" && (
            <Section
              title="Notificações"
              subtitle="Decida o que cai no seu email. Nada de spam — só sinais que importam."
            >
              <div className="flex flex-col gap-3">
                {(
                  [
                    {
                      key: "carousel_ready" as const,
                      icon: <Sparkles size={14} />,
                      title: "Carrossel pronto",
                      desc: "Email quando um novo carrossel termina de gerar.",
                    },
                    {
                      key: "upgrade_available" as const,
                      icon: <CreditCard size={14} />,
                      title: "Upgrade disponível",
                      desc: "Avisos quando novos planos ou descontos aparecerem.",
                    },
                    {
                      key: "weekly_summary" as const,
                      icon: <Mail size={14} />,
                      title: "Resumo semanal",
                      desc: "Toda sexta: o que você criou + ideias pra semana.",
                    },
                    {
                      key: "limit_warnings" as const,
                      icon: <Bell size={14} />,
                      title: "Avisos de limite",
                      desc: "Alerta em 80% e 100% do limite mensal do plano.",
                    },
                  ]
                ).map((n) => {
                  const on = notifs[n.key];
                  return (
                    <div
                      key={n.key}
                      className="flex items-start gap-4 p-4"
                      style={{
                        border: "1.5px solid var(--sv-ink)",
                        background: "var(--sv-paper)",
                      }}
                    >
                      <div
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center"
                        style={{
                          border: "1.5px solid var(--sv-ink)",
                          background: on ? "var(--sv-green)" : "var(--sv-white)",
                          color: "var(--sv-ink)",
                        }}
                      >
                        {n.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          style={{
                            fontFamily: "var(--sv-sans)",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--sv-ink)",
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            fontFamily: "var(--sv-sans)",
                            fontSize: 13,
                            color: "var(--sv-muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {n.desc}
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        onClick={() =>
                          setNotifs((prev) => ({ ...prev, [n.key]: !prev[n.key] }))
                        }
                        className="relative mt-1 shrink-0"
                        style={{
                          width: 48,
                          height: 26,
                          border: "1.5px solid var(--sv-ink)",
                          background: on ? "var(--sv-green)" : "var(--sv-white)",
                          boxShadow: "2px 2px 0 0 var(--sv-ink)",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            top: 2,
                            left: on ? 23 : 2,
                            width: 18,
                            height: 18,
                            background: "var(--sv-ink)",
                            transition: "left 160ms ease",
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <p
                className="mt-6"
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--sv-muted)",
                  fontWeight: 700,
                }}
              >
                ● Envios para {profile?.email || "seu e-mail cadastrado"}
              </p>
            </Section>
          )}

          {/* ========== PLANO ========== */}
          {activeTab === "plan" && (
            <Section
              title="Plano e uso"
              subtitle="Seu plano atual e consumo mensal."
            >
              <div
                className="flex flex-col gap-4 p-6"
                style={{
                  background: "var(--sv-ink)",
                  color: "var(--sv-paper)",
                  border: "1.5px solid var(--sv-ink)",
                  boxShadow: "4px 4px 0 0 var(--sv-green)",
                }}
              >
                <span
                  className="sv-kicker"
                  style={{ color: "rgba(247,245,239,0.6)" }}
                >
                  ● Plano atual
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3
                    className="sv-display"
                    style={{
                      fontSize: 44,
                      lineHeight: 0.95,
                      color: "var(--sv-paper)",
                    }}
                  >
                    {planName}
                  </h3>
                  {plan === "pro" && (
                    <span
                      className="sv-kicker-sm"
                      style={{ color: "rgba(247,245,239,0.7)" }}
                    >
                      R$ 89/mês
                    </span>
                  )}
                  {plan === "business" && (
                    <span
                      className="sv-kicker-sm"
                      style={{ color: "rgba(247,245,239,0.7)" }}
                    >
                      R$ 249/mês
                    </span>
                  )}
                </div>

                <div>
                  <div
                    className="mb-2 flex items-center justify-between"
                    style={{
                      fontFamily: "var(--sv-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(247,245,239,0.7)",
                    }}
                  >
                    <span>{usageLabel}</span>
                  </div>
                  <div
                    className="relative h-[10px] w-full overflow-hidden"
                    style={{
                      background: "rgba(247,245,239,0.12)",
                      border: "1.5px solid rgba(247,245,239,0.3)",
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: isUnlimited ? "100%" : `${usageRatio * 100}%`,
                        background: "var(--sv-green)",
                      }}
                    />
                  </div>
                </div>

                <ul
                  className="mt-2 space-y-1.5"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 13,
                    color: "rgba(247,245,239,0.85)",
                  }}
                >
                  {plan === "free" && (
                    <>
                      <li>◆ 5 carrosséis/mês</li>
                      <li>◆ 1 template (Manifesto)</li>
                      <li>◆ Export PNG com marca d&apos;água</li>
                    </>
                  )}
                  {plan === "pro" && (
                    <>
                      <li>✦ Carrosséis ilimitados</li>
                      <li>✦ Todos os 4 templates</li>
                      <li>✦ Branding customizado</li>
                      <li>✦ Export PDF + .zip, sem marca d&apos;água</li>
                    </>
                  )}
                  {plan === "business" && (
                    <>
                      <li>✦ Tudo do Pro</li>
                      <li>✦ Múltiplas marcas · até 5 membros</li>
                      <li>✦ API + integrações · white-label opcional</li>
                    </>
                  )}
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  {plan === "free" ? (
                    <Link href="/app/plans" className="sv-btn-primary">
                      Ver planos <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <ManageBillingButton />
                  )}
                  <Link
                    href="/app/roadmap"
                    className="sv-btn-ghost"
                    style={{ color: "var(--sv-paper)" }}
                  >
                    Roadmap →
                  </Link>
                </div>
              </div>
            </Section>
          )}

          {/* ========== SEGURANÇA ========== */}
          {activeTab === "security" && (
            <Section
              title="Segurança"
              subtitle="Sessão, onboarding e remoção de conta."
            >
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem("sequencia-viral_onboarding");
                    } catch {
                      /* ignore */
                    }
                    if (profile && updateProfile) {
                      void updateProfile({ onboarding_completed: false });
                    }
                    router.push("/app/onboarding");
                  }}
                  className="sv-btn-outline self-start"
                >
                  <Sparkles size={13} /> Refazer onboarding
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="sv-btn-outline self-start"
                >
                  <LogOut size={13} /> Sair da conta
                </button>
              </div>

              <hr className="sv-divider my-8" />

              {/* === LGPD: Export / Import JSON === */}
              <div
                className="p-6"
                style={{
                  border: "1.5px solid var(--sv-ink)",
                  background: "var(--sv-soft)",
                }}
              >
                <div
                  className="mb-2 inline-flex items-center gap-2"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--sv-ink)",
                    fontWeight: 700,
                  }}
                >
                  <Upload size={13} /> Portabilidade de dados (LGPD)
                </div>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 14,
                    color: "var(--sv-ink)",
                  }}
                >
                  Baixe tudo que você tem aqui (perfil, carrosséis, histórico)
                  como JSON. Pode reimportar em outra conta sua.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="sv-btn-outline"
                    onClick={async () => {
                      if (!session) {
                        toast.error("Sessão expirada.");
                        return;
                      }
                      try {
                        const res = await fetch("/api/data-export", {
                          headers: {
                            Authorization: `Bearer ${session.access_token}`,
                          },
                        });
                        if (!res.ok) {
                          const data = (await res.json().catch(() => ({}))) as {
                            error?: string;
                          };
                          throw new Error(data.error || "Falha no export.");
                        }
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `sequencia-viral-export-${new Date()
                          .toISOString()
                          .slice(0, 10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success("Export baixado.");
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Falha no export."
                        );
                      }
                    }}
                  >
                    Baixar meus dados (JSON)
                  </button>
                  <label className="sv-btn-ghost cursor-pointer">
                    Importar JSON
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        if (!session) {
                          toast.error("Sessão expirada.");
                          return;
                        }
                        try {
                          const text = await file.text();
                          const parsed = JSON.parse(text);
                          const res = await fetch("/api/data-import", {
                            method: "POST",
                            headers: {
                              "content-type": "application/json",
                              Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify(parsed),
                          });
                          const data = (await res.json().catch(() => ({}))) as {
                            imported?: number;
                            error?: string;
                            skipped?: string[];
                          };
                          if (!res.ok) {
                            throw new Error(data.error || "Falha no import.");
                          }
                          toast.success(
                            `${data.imported ?? 0} carrosséis importados${
                              data.skipped?.length
                                ? ` (${data.skipped.length} pulados)`
                                : ""
                            }.`
                          );
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Falha no import."
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <hr className="sv-divider my-8" />

              <div
                className="p-6"
                style={{
                  border: "1.5px solid var(--sv-orange)",
                  background: "rgba(255,74,28,0.06)",
                }}
              >
                <div
                  className="mb-2 inline-flex items-center gap-2"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--sv-orange)",
                    fontWeight: 700,
                  }}
                >
                  <AlertTriangle size={13} /> Zona de perigo · Excluir conta
                </div>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 14,
                    color: "var(--sv-ink)",
                  }}
                >
                  Ação irreversível. Todos os seus carrosséis e dados serão
                  apagados permanentemente.
                </p>

                <AnimatePresence>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 transition-all"
                      style={{
                        border: "1.5px solid var(--sv-orange)",
                        background: "var(--sv-white)",
                        color: "var(--sv-orange)",
                        fontFamily: "var(--sv-mono)",
                        fontSize: 10.5,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      <Trash2 size={13} /> Excluir minha conta
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap items-center gap-3 overflow-hidden"
                    >
                      <button
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center gap-2 px-4 py-2.5"
                        style={{
                          border: "1.5px solid var(--sv-ink)",
                          background: "var(--sv-orange)",
                          color: "var(--sv-paper)",
                          fontFamily: "var(--sv-mono)",
                          fontSize: 10.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          boxShadow: "3px 3px 0 0 var(--sv-ink)",
                        }}
                      >
                        <Trash2 size={13} /> Sim, apagar minha conta
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="sv-btn-outline"
                      >
                        Cancelar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>
          )}

          {/* Save bar (sticky bottom) — visível em todas as abas editáveis */}
          {activeTab !== "security" && activeTab !== "plan" && (
            <div
              className="sticky bottom-4 z-20 flex items-center justify-end gap-3 px-4 py-3"
              style={{
                background: "var(--sv-white)",
                border: "1.5px solid var(--sv-ink)",
                boxShadow: "4px 4px 0 0 var(--sv-ink)",
              }}
            >
              <span
                className="sv-kicker-sm mr-auto"
                style={{ color: "var(--sv-muted)" }}
              >
                ● Suas mudanças não se salvam sozinhas
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="sv-btn-primary"
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Salvando
                  </>
                ) : saved ? (
                  <>
                    <Check size={13} /> Salvo
                  </>
                ) : (
                  <>
                    <Save size={13} /> Salvar alterações
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sv-card"
      style={{ padding: 28 }}
    >
      <div className="mb-6">
        <h2
          className="sv-display"
          style={{ fontSize: 28, lineHeight: 1, letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 14,
              color: "var(--sv-muted)",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-2 block"
      style={{
        fontFamily: "var(--sv-mono)",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--sv-muted)",
        fontWeight: 700,
      }}
    >
      {children}
    </label>
  );
}

function ManageBillingButton() {
  const { session } = useAuth();
  const [opening, setOpening] = useState(false);

  async function openPortal() {
    if (opening) return;
    setOpening(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: jsonWithAuth(session),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(
          data.error || "Não foi possível abrir o portal. Tente de novo."
        );
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir portal.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={opening}
      className="sv-btn-outline"
      style={{ opacity: opening ? 0.7 : 1 }}
    >
      {opening ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <CreditCard size={13} />
      )}
      Gerenciar assinatura
      <ExternalLink size={11} />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-3xl px-4 py-16"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
          }}
        >
          ● Carregando configurações
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
