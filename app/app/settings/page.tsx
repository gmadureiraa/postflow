"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
  | "plan"
  | "security";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Perfil" },
  { id: "branding", label: "Branding padrão" },
  { id: "social", label: "Redes" },
  { id: "voice", label: "Voz IA" },
  { id: "plan", label: "Plano" },
  { id: "security", label: "Segurança" },
];

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

  const [name, setName] = useState(profile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [twitterHandle, setTwitterHandle] = useState(profile?.twitter_handle || "");
  const [instagramHandle, setInstagramHandle] = useState(profile?.instagram_handle || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [niche, setNiche] = useState<string[]>(profile?.niche || []);
  const [tone, setTone] = useState(profile?.tone || "casual");
  const [language, setLanguage] = useState(profile?.language || "pt-br");
  const [carouselStyle, setCarouselStyle] = useState(profile?.carousel_style || "white");

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

  const TONES = [
    { value: "professional", label: "Profissional" },
    { value: "casual", label: "Casual" },
    { value: "provocative", label: "Provocativo" },
    { value: "educational", label: "Educacional" },
  ];

  const NICHE_SUGGESTIONS = [
    "Marketing", "IA & Automação", "Cripto", "Finanças",
    "Educação", "Produtividade", "Saúde", "Design", "Tech", "Negócios",
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
      });
      posthog.capture("settings_saved", {
        has_twitter: !!twitterHandle,
        has_instagram: !!instagramHandle,
        has_linkedin: !!linkedinUrl,
        niche_count: niche.length,
        tone,
        language,
        carousel_style: carouselStyle,
      });
      setSaved(true);
      toast.success("Alterações salvas.");
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível salvar. Tente de novo."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: jsonWithAuth(session),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
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
        err instanceof Error ? err.message : "Erro inesperado ao excluir conta."
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
          Perfil, voz da marca e preferências. Tudo que torna o Sequência Viral seu.
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
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
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
                  className="whitespace-nowrap px-3 py-2.5 text-left transition-all"
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
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {activeTab === "profile" && (
            <Section title="Seu perfil" subtitle="Como você aparece nas exportações e nos slides.">
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
                  <Label>URL da foto</Label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="sv-input w-full"
                    placeholder="https://..."
                  />
                </div>
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

          {activeTab === "branding" && (
            <Section
              title="Branding padrão"
              subtitle="Aplicado em todo novo carrossel. Dá pra sobrescrever por projeto."
            >
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
                        color: on && opt.value === "dark" ? "var(--sv-paper)" : "var(--sv-ink)",
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

          {activeTab === "social" && (
            <Section
              title="Redes conectadas"
              subtitle="Handles usados nos slides e nas exportações automáticas."
            >
              <div className="space-y-4">
                <div>
                  <Label>Twitter / X</Label>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ""))}
                    className="sv-input w-full"
                    placeholder="seu_handle"
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                    className="sv-input w-full"
                    placeholder="seu_handle"
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="sv-input w-full"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </Section>
          )}

          {activeTab === "voice" && (
            <Section
              title="Voz da IA"
              subtitle="Guia o tom e os temas que o modelo prioriza nos seus carrosséis."
            >
              <Label>Nichos e temas</Label>
              <div className="mb-5 flex flex-wrap gap-2">
                {NICHE_SUGGESTIONS.map((s) => {
                  const on = niche.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleNiche(s)}
                      className={`sv-chip ${on ? "sv-chip-on" : ""}`}
                    >
                      {on ? "✓ " : "+ "}{s}
                    </button>
                  );
                })}
              </div>

              {niche.filter((n) => !NICHE_SUGGESTIONS.includes(n)).length > 0 && (
                <>
                  <Label>Nichos personalizados</Label>
                  <div className="mb-5 flex flex-wrap gap-2">
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
                </>
              )}

              <Label>Tom de voz</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TONES.map((t) => {
                  const on = tone === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className="px-4 py-4 text-left transition-all"
                      style={{
                        border: "1.5px solid var(--sv-ink)",
                        background: on ? "var(--sv-green)" : "var(--sv-white)",
                        color: "var(--sv-ink)",
                        boxShadow: on ? "4px 4px 0 0 var(--sv-ink)" : "none",
                        fontFamily: "var(--sv-sans)",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {activeTab === "plan" && (
            <Section title="Plano e uso" subtitle="Seu plano atual e consumo mensal.">
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
                    style={{ fontSize: 44, lineHeight: 0.95, color: "var(--sv-paper)" }}
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

          {activeTab === "security" && (
            <Section title="Segurança" subtitle="Sessão, onboarding e remoção de conta.">
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
                  <AlertTriangle size={13} /> Zona de perigo
                </div>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "var(--sv-sans)",
                    fontSize: 14,
                    color: "var(--sv-ink)",
                  }}
                >
                  Ação irreversível. Todos os seus carrosséis e dados serão apagados
                  permanentemente.
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

          {/* Save bar (sticky on mobile, shown for editable tabs only) */}
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
        toast.error(data.error || "Não foi possível abrir o portal. Tente de novo.");
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
