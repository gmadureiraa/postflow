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
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  const name = profile?.name?.split(" ")[0] || "there";
  const carouselCount = profile?.usage_count ?? 0;
  const plan = profile?.plan ?? "free";
  const limit = profile?.usage_limit ?? 5;

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
          Hey {name}, ready to create?
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
          className="group flex items-center gap-4 rounded-2xl bg-[#7C3AED] p-6 text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <PlusCircle size={24} />
          </div>
          <div>
            <p className="text-lg font-semibold">New Carousel</p>
            <p className="text-sm text-white/70">
              Create from text, link, or ideas
            </p>
          </div>
        </Link>
        <Link
          href="/app/carousels"
          className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-[#7C3AED]/10 group-hover:text-[#7C3AED] transition-colors">
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

      {/* Recent carousels — empty state */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Recent Carousels
        </h2>
        <EmptyState />
      </motion.div>
    </div>
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
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          accent
            ? "bg-[#7C3AED]/10 text-[#7C3AED]"
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
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED]/10">
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
        className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md"
      >
        <PlusCircle size={16} />
        Create Your First
      </Link>
    </div>
  );
}
