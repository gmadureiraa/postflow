"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Search,
  Trash2,
  Copy,
  Pencil,
  Download,
  Sparkles,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface SavedCarousel {
  id: string;
  title: string;
  slides: { heading: string; body: string; imageQuery: string; imageUrl?: string }[];
  style: string;
  savedAt: string;
  status?: string;
  variation?: { title: string; style: string };
}

function getCarousels(): SavedCarousel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("postflow_carousels");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveCarousels(carousels: SavedCarousel[]) {
  localStorage.setItem("postflow_carousels", JSON.stringify(carousels));
}

export default function CarouselsPage() {
  const [carousels, setCarousels] = useState<SavedCarousel[]>([]);
  const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setCarousels(getCarousels());
  }, []);

  const filtered = carousels.filter((c) => {
    if (filter === "drafts" && c.status !== "draft") return false;
    if (filter === "published" && c.status !== "published") return false;
    if (search) {
      const q = search.toLowerCase();
      const title = (c.title || c.slides[0]?.heading || "").toLowerCase();
      if (!title.includes(q)) return false;
    }
    return true;
  });

  function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    const updated = carousels.filter((c) => c.id !== id);
    setCarousels(updated);
    saveCarousels(updated);
    setDeleteConfirm(null);
  }

  function handleDuplicate(carousel: SavedCarousel) {
    const copy: SavedCarousel = {
      ...carousel,
      id: `carousel-${Date.now()}`,
      title: `${carousel.title || "Untitled"} (copy)`,
      savedAt: new Date().toISOString(),
      status: "draft",
    };
    const updated = [copy, ...carousels];
    setCarousels(updated);
    saveCarousels(updated);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-zinc-900 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              My Carousels
            </h1>
            <p className="text-zinc-500">
              {carousels.length} carousel{carousels.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Link
            href="/app/create"
            className="btn-scale btn-glow inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
          >
            <PlusCircle size={16} />
            New Carousel
          </Link>
        </div>
      </motion.div>

      {/* Search and Filters */}
      {carousels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search carousels..."
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
            <Filter size={14} className="text-zinc-400 ml-2 mr-1" />
            {(["all", "drafts", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Carousel Grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {filtered.map((carousel, i) => (
              <CarouselCard
                key={carousel.id}
                carousel={carousel}
                index={i}
                deleteConfirm={deleteConfirm === carousel.id}
                onDelete={() => handleDelete(carousel.id)}
                onDuplicate={() => handleDuplicate(carousel)}
              />
            ))}
          </motion.div>
        ) : carousels.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <p className="text-zinc-500">No carousels match your filters.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CarouselCard({
  carousel,
  index,
  deleteConfirm,
  onDelete,
  onDuplicate,
}: {
  carousel: SavedCarousel;
  index: number;
  deleteConfirm: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const date = new Date(carousel.savedAt);
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const title = carousel.title || carousel.slides[0]?.heading || "Untitled";
  const slideCount = carousel.slides.length;
  const status = carousel.status || "draft";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-lift rounded-2xl border border-zinc-200 bg-white overflow-hidden group"
    >
      {/* Thumbnail preview area */}
      <div
        className={`relative h-36 flex items-center justify-center ${
          carousel.style === "dark" ? "bg-zinc-900" : "bg-zinc-50"
        }`}
      >
        {/* Mini slide previews */}
        <div className="flex gap-2 px-4">
          {carousel.slides.slice(0, 3).map((slide, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-[8px] leading-tight w-20 ${
                carousel.style === "dark"
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  : "bg-white text-zinc-600 border border-zinc-200"
              }`}
              style={{ height: 80 }}
            >
              <div className="font-bold truncate text-[9px] mb-1">
                {slide.heading}
              </div>
              <div className="line-clamp-3 opacity-60">
                {slide.body}
              </div>
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            status === "published"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-semibold text-zinc-900 text-sm truncate mb-1">
          {title}
        </h3>
        <p className="text-xs text-zinc-500">
          {formatted} &middot; {slideCount} slides
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
          <Link
            href={`/app/create?draft=${carousel.id}`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#7C3AED] bg-[#7C3AED]/5 hover:bg-[#7C3AED]/10 transition-colors"
          >
            <Pencil size={12} />
            Edit
          </Link>
          <button
            onClick={onDuplicate}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <Copy size={12} />
            Duplicate
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            onClick={() => {
              alert("Export coming soon for saved carousels!");
            }}
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={onDelete}
            className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              deleteConfirm
                ? "bg-red-100 text-red-600"
                : "text-zinc-400 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            <Trash2 size={12} />
            {deleteConfirm ? "Confirm?" : ""}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-20 px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/postflow-empty.png"
        alt="No carousels"
        className="w-36 h-36 mb-6 opacity-80"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/10">
        <Sparkles size={24} className="text-[#7C3AED]" />
      </div>
      <p className="text-lg font-semibold text-zinc-700 mb-1">
        No carousels yet
      </p>
      <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
        Create your first carousel and it will appear here. You can save, edit, duplicate, and export your creations.
      </p>
      <Link
        href="/app/create"
        className="btn-scale btn-glow inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
      >
        <PlusCircle size={16} />
        Create Your First Carousel
      </Link>
    </div>
  );
}
