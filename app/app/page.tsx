"use client";

import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import {
  PlusCircle,
  FolderOpen,
  Layers,
  CalendarDays,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

interface SavedCarousel {
  id: string;
  title: string;
  slides: { heading: string; body: string }[];
  style: string;
  savedAt: string;
  status?: string;
}

function getSavedCarousels(): SavedCarousel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("postflow_carousels");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [carousels, setCarousels] = useState<SavedCarousel[]>([]);

  useEffect(() => {
    setCarousels(getSavedCarousels());
  }, []);

  const name = profile?.name?.split(" ")[0] || "there";
  const carouselCount = profile?.usage_count ?? carousels.length;
  const plan = profile?.plan ?? "free";
  const limit = profile?.usage_limit ?? 5;
  const greeting = getGreeting();

  const recentCarousels = carousels.slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-3xl font-bold text-zinc-900 mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {greeting}, {name}
        </h1>
        <p className="text-zinc-500 mb-8">
          Your carousel studio awaits.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <StatCard
          icon={<Layers size={20} />}
          label="Total Carousels"
          value={String(carouselCount)}
        />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="This Month"
          value={`${carouselCount} / ${limit}`}
        />
        <StatCard
          icon={<Crown size={20} />}
          label="Plan"
          value={plan.charAt(0).toUpperCase() + plan.slice(1)}
          accent
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
      >
        <Link
          href="/app/create"
          className="group relative flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] p-6 text-white transition-all hover:shadow-xl hover:shadow-purple-500/20 btn-glow overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <PlusCircle size={26} />
          </div>
          <div>
            <p className="text-lg font-bold">New Carousel</p>
            <p className="text-sm text-white/70">
              Create from text, link, or ideas
            </p>
          </div>
          <ArrowRight size={20} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href="/app/carousels"
          className="card-lift group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-[#7C3AED]/10 group-hover:text-[#7C3AED] transition-colors">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-900">My Carousels</p>
            <p className="text-sm text-zinc-500">
              View and edit your creations
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Recent carousels */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Recent Carousels
        </h2>
        {recentCarousels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentCarousels.map((c) => (
              <RecentCarouselCard key={c.id} carousel={c} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </div>
  );
}

function RecentCarouselCard({ carousel }: { carousel: SavedCarousel }) {
  const date = new Date(carousel.savedAt);
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <Link
      href={`/app/create?draft=${carousel.id}`}
      className="card-lift flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300"
    >
      {/* Thumbnail preview */}
      <div
        className={`flex-shrink-0 w-14 h-18 rounded-lg flex items-center justify-center text-xs font-bold ${
          carousel.style === "dark"
            ? "bg-zinc-900 text-white border border-zinc-700"
            : "bg-zinc-50 text-zinc-600 border border-zinc-200"
        }`}
        style={{ height: 72 }}
      >
        {carousel.slides.length}
        <br />
        slides
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">
          {carousel.title || carousel.slides[0]?.heading || "Untitled"}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {formatted} &middot; {carousel.slides.length} slides
        </p>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
          {carousel.slides[0]?.body || ""}
        </p>
      </div>
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="card-lift flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          accent
            ? "bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/10 text-[#7C3AED]"
            : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/postflow-empty.png"
        alt="No carousels yet"
        className="w-32 h-32 mb-4 opacity-80"
        onError={(e) => {
          // Fallback to icon if image doesn't load
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/10">
        <Sparkles size={24} className="text-[#7C3AED]" />
      </div>
      <p className="text-base font-medium text-zinc-700 mb-1">
        No carousels yet
      </p>
      <p className="text-sm text-zinc-500 mb-6 text-center max-w-xs">
        Create your first carousel and it will appear here.
      </p>
      <Link
        href="/app/create"
        className="btn-scale btn-glow inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
      >
        <PlusCircle size={16} />
        Create Your First
      </Link>
    </div>
  );
}
