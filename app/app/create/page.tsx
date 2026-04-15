"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CarouselPreview from "@/components/app/carousel-preview";
import { toPng } from "html-to-image";

// ─── Types ──────────────────────────────────────────────────────────
type SourceType = "ai" | "link" | "video" | "idea";
type Step = "input" | "generating" | "pick" | "edit" | "export";

interface Slide {
  heading: string;
  body: string;
  imageQuery: string;
  imageUrl?: string;
}

interface Variation {
  title: string;
  style: "data" | "story" | "provocative";
  slides: Slide[];
}

// ─── Constants ──────────────────────────────────────────────────────
const SOURCE_OPTIONS: {
  type: SourceType;
  icon: string;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  {
    type: "ai",
    icon: "sparkles",
    label: "AI Suggestions",
    desc: "Let AI suggest trending topics for you",
    emoji: "✨",
  },
  {
    type: "link",
    icon: "link",
    label: "From a Link",
    desc: "Paste any article or blog URL",
    emoji: "🔗",
  },
  {
    type: "video",
    icon: "play",
    label: "From a Video",
    desc: "Paste a YouTube video URL",
    emoji: "🎬",
  },
  {
    type: "idea",
    icon: "lightbulb",
    label: "My Idea",
    desc: "Write your own topic or idea",
    emoji: "💡",
  },
];

const STYLE_BADGES: Record<string, { label: string; color: string; emoji: string }> = {
  data: { label: "Data-Driven", color: "#2563eb", emoji: "📊" },
  story: { label: "Story-Driven", color: "#16a34a", emoji: "📖" },
  provocative: { label: "Provocative", color: "#dc2626", emoji: "🔥" },
};

const DEFAULT_PROFILE = {
  name: "Your Name",
  handle: "@yourhandle",
  photoUrl: "",
};

// ─── Icon Components ────────────────────────────────────────────────
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...props}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...props}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...props}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "grip":
      return (
        <svg {...props}>
          <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Main Component ─────────────────────────────────────────────────
export default function CreatePage() {
  const [step, setStep] = useState<Step>("input");
  const [sourceType, setSourceType] = useState<SourceType>("idea");
  const [topic, setTopic] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [niche, setNiche] = useState("marketing");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [editSlides, setEditSlides] = useState<Slide[]>([]);
  const [slideStyle, setSlideStyle] = useState<"white" | "dark">("white");
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setError("");
    setStep("generating");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sourceType === "ai" ? "trending topics in " + niche : topic,
          sourceType,
          sourceUrl: sourceUrl || undefined,
          niche,
          tone,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setVariations(data.variations);
      setStep("pick");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("input");
    }
  }, [sourceType, topic, sourceUrl, niche, tone, language]);

  const handleSelectVariation = (index: number) => {
    setSelectedVariation(index);
    setEditSlides([...variations[index].slides]);
    setStep("edit");
  };

  const handleUpdateSlide = (
    index: number,
    field: keyof Slide,
    value: string
  ) => {
    setEditSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSlide = (afterIndex: number) => {
    setEditSlides((prev) => {
      const updated = [...prev];
      updated.splice(afterIndex + 1, 0, {
        heading: "New Slide",
        body: "Add your content here.",
        imageQuery: "placeholder",
      });
      return updated;
    });
  };

  const handleRemoveSlide = (index: number) => {
    if (editSlides.length <= 2) return;
    if (deleteConfirm !== index) {
      setDeleteConfirm(index);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    setEditSlides((prev) => prev.filter((_, i) => i !== index));
    setDeleteConfirm(null);
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editSlides.length) return;
    setEditSlides((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      for (let i = 0; i < editSlides.length; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;

        const dataUrl = await toPng(el, {
          width: 1080,
          height: 1350,
          style: {
            transform: "scale(3)",
            transformOrigin: "top left",
          },
        });

        const link = document.createElement("a");
        link.download = `slide-${i + 1}.png`;
        link.href = dataUrl;
        link.click();

        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export slides. Try again.");
    }
    setIsExporting(false);
  };

  const handleSaveDraft = () => {
    const id = `carousel-${Date.now()}`;
    const draft = {
      id,
      title: variations[selectedVariation]?.title || editSlides[0]?.heading || "Untitled",
      slides: editSlides,
      style: slideStyle,
      variation: variations[selectedVariation],
      savedAt: new Date().toISOString(),
      status: "draft",
    };
    const existing = JSON.parse(localStorage.getItem("postflow_carousels") || "[]");
    existing.unshift(draft);
    localStorage.setItem("postflow_carousels", JSON.stringify(existing));
    localStorage.setItem("postflow-draft", JSON.stringify(draft));
  };

  // ─── Render ──────────────────────────────────────────────────────
  const stepNumber =
    step === "input"
      ? 1
      : step === "generating"
        ? 2
        : step === "pick"
          ? 3
          : step === "edit"
            ? 4
            : 5;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step !== "input" && (
              <button
                onClick={() => {
                  if (step === "generating") return;
                  if (step === "pick") setStep("input");
                  if (step === "edit") setStep("pick");
                  if (step === "export") setStep("edit");
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="arrow-left" size={18} />
              </button>
            )}
            <h1
              className="text-lg font-semibold"
              style={{
                fontFamily:
                  "var(--font-serif), 'DM Serif Display', Georgia, serif",
              }}
            >
              Create Carousel
            </h1>
          </div>
          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="flex items-center gap-2"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    background:
                      n < stepNumber
                        ? "var(--accent)"
                        : n === stepNumber
                          ? "var(--accent)"
                          : "var(--card)",
                    color:
                      n <= stepNumber ? "#fff" : "var(--muted)",
                    border:
                      n > stepNumber
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  {n < stepNumber ? (
                    <Icon name="check" size={14} />
                  ) : (
                    n
                  )}
                </div>
                {n < 5 && (
                  <div
                    className="w-8 h-0.5 rounded"
                    style={{
                      background:
                        n < stepNumber
                          ? "var(--accent)"
                          : "var(--border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600 ml-4"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── STEP 1: INPUT ──────────────────────────────────────── */}
        {step === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2
                className="text-3xl font-bold mb-3"
                style={{
                  fontFamily:
                    "var(--font-serif), 'DM Serif Display', Georgia, serif",
                }}
              >
                What do you want to create?
              </h2>
              <p className="text-[var(--muted)]">
                Choose your starting point and we&apos;ll generate 3 carousel
                variations.
              </p>
            </div>

            {/* Source type cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {SOURCE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.type}
                  onClick={() => setSourceType(opt.type)}
                  whileTap={{ scale: 0.97 }}
                  className={`card-lift p-5 rounded-xl border-2 text-left transition-all ${
                    sourceType === opt.type
                      ? "border-[var(--accent)] bg-[var(--accent)]/[0.04] shadow-md shadow-purple-500/5"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-zinc-300"
                  }`}
                >
                  <div className="text-2xl mb-3">{opt.emoji}</div>
                  <div className="font-semibold text-sm mb-1">{opt.label}</div>
                  <div className="text-xs text-[var(--muted)] leading-relaxed">{opt.desc}</div>
                </motion.button>
              ))}
            </div>

            {/* Input fields based on source type */}
            <div className="max-w-2xl mx-auto space-y-5">
              {sourceType === "link" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/article..."
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                  />
                </div>
              )}

              {sourceType === "video" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                  />
                </div>
              )}

              {(sourceType === "idea" || sourceType === "link" || sourceType === "video") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {sourceType === "idea" ? "Your Idea" : "Topic / Focus"}
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={
                      sourceType === "idea"
                        ? "e.g., 5 AI tools that replaced my marketing team..."
                        : "e.g., Focus on the key takeaways about growth hacking..."
                    }
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all resize-none"
                  />
                </div>
              )}

              {/* Settings row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--muted)]">
                    Niche
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="marketing">Marketing</option>
                    <option value="tech">Tech</option>
                    <option value="crypto">Crypto / Web3</option>
                    <option value="finance">Finance</option>
                    <option value="ai">AI / Automation</option>
                    <option value="business">Business</option>
                    <option value="health">Health & Wellness</option>
                    <option value="education">Education</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--muted)]">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="bold">Bold & Direct</option>
                    <option value="educational">Educational</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--muted)]">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="English">English</option>
                    <option value="Portuguese">Portugues</option>
                    <option value="Spanish">Espanol</option>
                    <option value="French">Francais</option>
                    <option value="German">Deutsch</option>
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={
                  sourceType === "idea" && !topic.trim()
                    ? true
                    : (sourceType === "link" || sourceType === "video") &&
                        !sourceUrl.trim()
                      ? true
                      : false
                }
                className="btn-scale btn-glow w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Generate 3 Variations
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: GENERATING ─────────────────────────────────── */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-32">
            {/* Animated orbiting circles */}
            <div className="relative mb-8" style={{ width: 80, height: 80 }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "var(--accent)",
                  opacity: 0.15,
                  animation: "pulse-ring 2s ease-out infinite",
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "var(--accent)",
                  opacity: 0.1,
                  animation: "pulse-ring 2s ease-out infinite 0.5s",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: "var(--accent)",
                  animation: "orbit-1 1.8s linear infinite",
                  top: "50%",
                  left: "50%",
                  marginTop: -6,
                  marginLeft: -6,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--accent-light)",
                  animation: "orbit-2 1.8s linear infinite",
                  top: "50%",
                  left: "50%",
                  marginTop: -5,
                  marginLeft: -5,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--accent-dark)",
                  animation: "orbit-3 1.8s linear infinite",
                  top: "50%",
                  left: "50%",
                  marginTop: -4,
                  marginLeft: -4,
                }}
              />
            </div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold mb-2"
              style={{
                fontFamily:
                  "var(--font-serif), 'DM Serif Display', Georgia, serif",
              }}
            >
              Creating 3 variations...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[var(--muted)] text-sm"
            >
              Analyzing content and crafting carousel slides
            </motion.p>
          </div>
        )}

        {/* ─── STEP 3: PICK VARIATION ─────────────────────────────── */}
        {step === "pick" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2
                className="text-3xl font-bold mb-3"
                style={{
                  fontFamily:
                    "var(--font-serif), 'DM Serif Display', Georgia, serif",
                }}
              >
                Pick your favorite
              </h2>
              <p className="text-[var(--muted)]">
                We created 3 different styles. Choose one to customize.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {variations.map((variation, index) => {
                const badge = STYLE_BADGES[variation.style] || {
                  label: variation.style,
                  color: "#7C3AED",
                  emoji: "✨",
                };
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-lift border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)] cursor-pointer group"
                    onClick={() => handleSelectVariation(index)}
                  >
                    {/* Badge */}
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                      style={{
                        background: badge.color + "14",
                        color: badge.color,
                      }}
                    >
                      <span>{badge.emoji}</span>
                      {badge.label}
                    </span>

                    {/* Title */}
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{
                        fontFamily:
                          "var(--font-serif), 'DM Serif Display', Georgia, serif",
                      }}
                    >
                      {variation.title}
                    </h3>

                    {/* Preview -- first 3 slide headings */}
                    <div className="space-y-2 mb-6">
                      {variation.slides.slice(0, 3).map((slide, si) => (
                        <div
                          key={si}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5"
                            style={{
                              background: "var(--card)",
                              color: "var(--muted)",
                            }}
                          >
                            {si + 1}
                          </span>
                          <span className="text-[var(--foreground)] leading-snug">
                            {slide.heading}
                          </span>
                        </div>
                      ))}
                      {variation.slides.length > 3 && (
                        <div className="text-xs text-[var(--muted)] pl-7">
                          +{variation.slides.length - 3} more slides
                        </div>
                      )}
                    </div>

                    {/* Select button */}
                    <button
                      className="btn-scale w-full py-2.5 rounded-xl text-sm font-semibold transition-all border-2 border-[var(--accent)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white"
                    >
                      Select This Style
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── STEP 4: EDIT SLIDES ────────────────────────────────── */}
        {step === "edit" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-serif), 'DM Serif Display', Georgia, serif",
                  }}
                >
                  Edit Your Slides
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {editSlides.length} slides &middot;{" "}
                  {STYLE_BADGES[variations[selectedVariation]?.style]?.label ||
                    "Custom"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Style toggle */}
                <div className="flex items-center gap-1 bg-[var(--card)] rounded-lg p-1">
                  <button
                    onClick={() => setSlideStyle("white")}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background:
                        slideStyle === "white" ? "#fff" : "transparent",
                      boxShadow:
                        slideStyle === "white"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                    }}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setSlideStyle("dark")}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background:
                        slideStyle === "dark" ? "#111" : "transparent",
                      color: slideStyle === "dark" ? "#fff" : "inherit",
                      boxShadow:
                        slideStyle === "dark"
                          ? "0 1px 3px rgba(0,0,0,0.2)"
                          : "none",
                    }}
                  >
                    Dark
                  </button>
                </div>
                <button
                  onClick={() => setStep("export")}
                  className="btn-scale px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  Continue to Export
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_420px] gap-8">
              {/* Slide editor list */}
              <div className="space-y-4">
                {editSlides.map((slide, index) => (
                  <motion.div
                    key={index}
                    layout
                    className="border border-[var(--border)] rounded-xl p-5 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-zinc-300 cursor-grab">
                          <Icon name="grip" size={16} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                          Slide {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSlide(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          <Icon name="arrow-up" size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(index, "down")}
                          disabled={index === editSlides.length - 1}
                          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          <Icon name="arrow-down" size={14} />
                        </button>
                        <button
                          onClick={() => handleAddSlide(index)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors text-[var(--accent)]"
                          title="Add slide after"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveSlide(index)}
                          disabled={editSlides.length <= 2}
                          className={`p-1.5 rounded-lg disabled:opacity-30 transition-all ${
                            deleteConfirm === index
                              ? "bg-red-100 text-red-600"
                              : "hover:bg-red-50 text-red-400"
                          }`}
                          title={deleteConfirm === index ? "Click again to confirm" : "Remove slide"}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={slide.heading}
                      onChange={(e) =>
                        handleUpdateSlide(index, "heading", e.target.value)
                      }
                      className="w-full font-semibold text-base mb-2 px-3 py-2 rounded-lg border border-transparent focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus:outline-none bg-transparent hover:bg-zinc-50 transition-colors"
                      placeholder="Slide heading..."
                    />
                    <textarea
                      value={slide.body}
                      onChange={(e) =>
                        handleUpdateSlide(index, "body", e.target.value)
                      }
                      rows={2}
                      className="w-full text-sm text-gray-600 px-3 py-2 rounded-lg border border-transparent focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus:outline-none bg-transparent resize-none hover:bg-zinc-50 transition-colors"
                      placeholder="Slide body text..."
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)]">
                        Image:
                      </span>
                      <input
                        type="text"
                        value={slide.imageQuery}
                        onChange={(e) =>
                          handleUpdateSlide(
                            index,
                            "imageQuery",
                            e.target.value
                          )
                        }
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent hover:bg-zinc-50 transition-colors"
                        placeholder="Search term for image..."
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Preview panel */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                  Preview
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <CarouselPreview
                    slides={editSlides}
                    profile={DEFAULT_PROFILE}
                    style={slideStyle}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 5: EXPORT ─────────────────────────────────────── */}
        {step === "export" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2
                className="text-3xl font-bold mb-3"
                style={{
                  fontFamily:
                    "var(--font-serif), 'DM Serif Display', Georgia, serif",
                }}
              >
                Your Carousel is Ready
              </h2>
              <p className="text-[var(--muted)]">
                Preview, download, or publish your carousel.
              </p>
            </div>

            {/* Full preview */}
            <div className="mb-10">
              <CarouselPreview
                slides={editSlides}
                profile={DEFAULT_PROFILE}
                style={slideStyle}
                slideRefs={slideRefs}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="btn-scale flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                <Icon name="download" size={16} />
                {isExporting ? "Exporting..." : "Download PNG"}
              </button>

              <button
                className="btn-scale flex items-center gap-2 px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all hover:bg-gray-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                onClick={() => {
                  alert(
                    "PDF export coming soon! Use PNG for now."
                  );
                }}
              >
                <Icon name="download" size={16} />
                Download PDF
              </button>

              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all relative"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                  cursor: "not-allowed",
                }}
                disabled
              >
                Publish
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                  }}
                >
                  SOON
                </span>
              </button>

              <button
                className="btn-scale flex items-center gap-2 px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all hover:bg-gray-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                onClick={() => {
                  handleSaveDraft();
                  alert("Draft saved!");
                }}
              >
                Save as Draft
              </button>
            </div>

            {/* Back to edit */}
            <div className="text-center mt-6">
              <button
                onClick={() => setStep("edit")}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Back to editing
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
