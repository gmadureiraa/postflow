"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  AtSign,
  Palette,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Link as LinkIcon,
} from "lucide-react";

const NICHES = [
  { value: "Marketing", emoji: "📢", color: "#f59e0b" },
  { value: "Tech", emoji: "💻", color: "#3b82f6" },
  { value: "Crypto", emoji: "🪙", color: "#f97316" },
  { value: "Fitness", emoji: "💪", color: "#ef4444" },
  { value: "Business", emoji: "📊", color: "#8b5cf6" },
  { value: "Education", emoji: "📚", color: "#10b981" },
  { value: "Design", emoji: "🎨", color: "#ec4899" },
  { value: "Other", emoji: "✨", color: "#6b7280" },
];

const TONES = [
  { value: "professional", label: "Professional", emoji: "👔", desc: "Clean, authoritative, polished" },
  { value: "casual", label: "Casual", emoji: "😎", desc: "Friendly, conversational, approachable" },
  { value: "provocative", label: "Provocative", emoji: "🔥", desc: "Bold, attention-grabbing, edgy" },
  { value: "educational", label: "Educational", emoji: "🧠", desc: "Clear, informative, structured" },
];

const LANGUAGES = [
  { value: "pt-br", label: "Portugues (BR)", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Espanol", flag: "🇪🇸" },
];

const STYLES = [
  { value: "white", label: "White", bg: "bg-white", border: "border-zinc-200" },
  { value: "dark", label: "Dark", bg: "bg-zinc-900", border: "border-zinc-700" },
];

const STEP_ICONS = [User, AtSign, Palette, Sparkles];
const STEP_LABELS = ["Profile", "Social", "Preferences", "Create"];

interface OnboardingData {
  name: string;
  avatar_url: string;
  twitter_handle: string;
  instagram_handle: string;
  linkedin_url: string;
  niche: string[];
  tone: string;
  language: string;
  carousel_style: string;
}

function loadSavedData(): OnboardingData {
  if (typeof window === "undefined")
    return {
      name: "",
      avatar_url: "",
      twitter_handle: "",
      instagram_handle: "",
      linkedin_url: "",
      niche: [],
      tone: "professional",
      language: "pt-br",
      carousel_style: "white",
    };
  try {
    const saved = localStorage.getItem("postflow_onboarding");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    name: "",
    avatar_url: "",
    twitter_handle: "",
    instagram_handle: "",
    linkedin_url: "",
    niche: [],
    tone: "professional",
    language: "pt-br",
    carousel_style: "white",
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => {
    const saved = loadSavedData();
    if (profile) {
      if (!saved.name && profile.name) saved.name = profile.name;
      if (!saved.avatar_url && profile.avatar_url) saved.avatar_url = profile.avatar_url;
    }
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      if (!saved.name && meta.full_name) saved.name = meta.full_name;
      if (!saved.avatar_url && meta.avatar_url) saved.avatar_url = meta.avatar_url;
    }
    return saved;
  });

  const update = useCallback(
    (partial: Partial<OnboardingData>) => {
      setData((prev) => {
        const next = { ...prev, ...partial };
        localStorage.setItem("postflow_onboarding", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  function next() {
    if (step < 3) {
      setDirection(1);
      setStep(step + 1);
    }
  }

  function prev() {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  async function finish(mode: "ideas" | "link") {
    await updateProfile({
      ...data,
      onboarding_completed: true,
    });
    localStorage.removeItem("postflow_onboarding");

    if (mode === "link") {
      router.push("/app?action=create&source=link");
    } else {
      router.push("/app?action=create&source=ideas");
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/postflow-icon.png" alt="PostFlow" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-semibold text-zinc-900 tracking-tight">PostFlow</span>
      </div>

      {/* Progress bar */}
      <div className="mb-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const active = i <= step;
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: i === step ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    i < step
                      ? "bg-[#7C3AED] text-white shadow-md shadow-purple-500/20"
                      : i === step
                      ? "bg-[#7C3AED]/10 text-[#7C3AED] ring-2 ring-[#7C3AED] ring-offset-2"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {i < step ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <Icon size={16} />
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? "text-zinc-700" : "text-zinc-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]"
            initial={false}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step cards */}
      <div className="w-full max-w-lg overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              {step === 0 && <StepProfile data={data} update={update} />}
              {step === 1 && <StepSocial data={data} update={update} />}
              {step === 2 && <StepPreferences data={data} update={update} />}
              {step === 3 && <StepCreate onFinish={finish} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex w-full max-w-lg items-center justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-4">
          {step > 0 && step < 3 && (
            <button
              onClick={next}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wider"
            >
              Skip this step
            </button>
          )}
          {step < 3 && (
            <button
              onClick={next}
              className="btn-scale flex items-center gap-1 rounded-xl bg-[#7C3AED] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Step Components ----

function StepProfile({
  data,
  update,
}: {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-bold text-zinc-900 mb-1"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Your Profile
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Tell us a bit about yourself.
      </p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {data.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white">
              <User size={24} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Photo URL
          </label>
          <input
            type="url"
            value={data.avatar_url}
            onChange={(e) => update({ avatar_url: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
          placeholder="Your name"
        />
      </div>
    </div>
  );
}

function StepSocial({
  data,
  update,
}: {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-bold text-zinc-900 mb-1"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Your Social Accounts
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        We&apos;ll use these to build your carousel header.
      </p>

      <div className="space-y-4">
        {/* Twitter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
            Twitter / X
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <input
              type="text"
              value={data.twitter_handle}
              onChange={(e) =>
                update({ twitter_handle: e.target.value.replace(/^@/, "") })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="@yourhandle"
            />
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
            Instagram
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            <input
              type="text"
              value={data.instagram_handle}
              onChange={(e) =>
                update({ instagram_handle: e.target.value.replace(/^@/, "") })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="@yourhandle"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
            LinkedIn
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <input
              type="url"
              value={data.linkedin_url}
              onChange={(e) => update({ linkedin_url: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPreferences({
  data,
  update,
}: {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}) {
  function toggleNiche(n: string) {
    const current = data.niche;
    if (current.includes(n)) {
      update({ niche: current.filter((x) => x !== n) });
    } else {
      update({ niche: [...current, n] });
    }
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold text-zinc-900 mb-1"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Your Preferences
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Help us personalize your experience.
      </p>

      {/* Niche — colorful pills */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-2.5">
          Niche
        </label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => {
            const selected = data.niche.includes(n.value);
            return (
              <motion.button
                key={n.value}
                onClick={() => toggleNiche(n.value)}
                whileTap={{ scale: 0.95 }}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: selected ? n.color : "#f4f4f5",
                  color: selected ? "#fff" : "#52525b",
                  boxShadow: selected ? `0 2px 8px ${n.color}40` : "none",
                }}
              >
                <span>{n.emoji}</span>
                {n.value}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tone — cards with emoji */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-2.5">
          Tone
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {TONES.map((t) => (
            <motion.button
              key={t.value}
              onClick={() => update({ tone: t.value })}
              whileTap={{ scale: 0.97 }}
              className={`rounded-xl border px-4 py-3.5 text-left transition-all ${
                data.tone === t.value
                  ? "border-[#7C3AED] bg-[#7C3AED]/5 ring-1 ring-[#7C3AED] shadow-sm shadow-purple-500/10"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{t.emoji}</span>
                <p className="text-sm font-semibold text-zinc-900">{t.label}</p>
              </div>
              <p className="text-xs text-zinc-500 pl-7">{t.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-2.5">
          Language
        </label>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => update({ language: l.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
                data.language === l.value
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-500/20"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel style */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2.5">
          Carousel Style
        </label>
        <div className="flex gap-3">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ carousel_style: s.value })}
              className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 transition-all ${
                data.carousel_style === s.value
                  ? "border-[#7C3AED] ring-1 ring-[#7C3AED] shadow-sm"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg ${s.bg} ${s.border} border`}
              />
              <span className="text-sm font-medium text-zinc-700">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCreate({
  onFinish,
}: {
  onFinish: (mode: "ideas" | "link") => void;
}) {
  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-purple-500/25"
      >
        <Sparkles size={28} className="text-white" />
      </motion.div>
      <h2
        className="text-2xl font-bold text-zinc-900 mb-2"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Create Your First Carousel
      </h2>
      <p className="text-sm text-zinc-500 mb-8 max-w-xs mx-auto">
        You&apos;re all set! Let&apos;s make something beautiful.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => onFinish("ideas")}
          className="btn-scale btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
        >
          <Sparkles size={16} />
          Give me ideas
        </button>
        <button
          onClick={() => onFinish("link")}
          className="btn-scale flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
        >
          <LinkIcon size={16} />
          I have a link
        </button>
      </div>
    </div>
  );
}
