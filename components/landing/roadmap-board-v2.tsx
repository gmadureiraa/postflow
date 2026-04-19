"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  ROADMAP_ITEMS,
  ROADMAP_STATUS_LABEL,
  type RoadmapItem,
  type RoadmapStatus,
} from "@/lib/roadmap-data";

/**
 * Board brutalist editorial do roadmap. Usado em /roadmap (landing pública)
 * e /app/roadmap (interno do app). Design tokens sv-* — paleta ink/paper/
 * green/pink, shadows 3-4px, hover subtle. Dados vêm de lib/roadmap-data.ts.
 */

const STATUS_STYLE: Record<
  RoadmapStatus,
  { bg: string; text: string; dot: string }
> = {
  now: {
    bg: "var(--sv-green)",
    text: "var(--sv-ink)",
    dot: "var(--sv-ink)",
  },
  next: {
    bg: "var(--sv-pink)",
    text: "var(--sv-ink)",
    dot: "var(--sv-ink)",
  },
  later: {
    bg: "var(--sv-paper)",
    text: "var(--sv-ink)",
    dot: "var(--sv-muted)",
  },
};

export function RoadmapBoardBrutalist() {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}
    >
      {ROADMAP_ITEMS.map((item, i) => (
        <RoadmapCard key={item.n} item={item} index={i} />
      ))}
    </div>
  );
}

export function RoadmapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["now", "next", "later"] as const).map((s) => {
        const st = STATUS_STYLE[s];
        return (
          <span
            key={s}
            className="uppercase"
            style={{
              padding: "6px 12px",
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              fontWeight: 700,
              background: st.bg,
              color: st.text,
              border: "1.5px solid var(--sv-ink)",
              boxShadow: "2px 2px 0 0 var(--sv-ink)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: st.dot,
                border: "1px solid var(--sv-ink)",
              }}
            />
            {ROADMAP_STATUS_LABEL[s]}
          </span>
        );
      })}
    </div>
  );
}

function RoadmapCard({ item, index }: { item: RoadmapItem; index: number }) {
  const st = STATUS_STYLE[item.status];
  const isNow = item.status === "now";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      style={{
        position: "relative",
        padding: 22,
        background: isNow ? "var(--sv-green)" : "var(--sv-white)",
        border: "1.5px solid var(--sv-ink)",
        boxShadow: isNow
          ? "4px 4px 0 0 var(--sv-ink)"
          : "3px 3px 0 0 var(--sv-ink)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 360,
        transition: "box-shadow 0.2s ease-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isNow
          ? "6px 6px 0 0 var(--sv-ink)"
          : "5px 5px 0 0 var(--sv-ink)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isNow
          ? "4px 4px 0 0 var(--sv-ink)"
          : "3px 3px 0 0 var(--sv-ink)";
      }}
    >
      {/* Header: número + status badge */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="italic"
          style={{
            fontFamily: "var(--sv-display)",
            fontSize: 44,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "var(--sv-ink)",
            fontWeight: 400,
          }}
        >
          {item.n}
        </span>
        <span
          className="uppercase shrink-0"
          style={{
            padding: "4px 9px",
            fontFamily: "var(--sv-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            fontWeight: 700,
            background: isNow ? "var(--sv-ink)" : st.bg,
            color: isNow ? "var(--sv-paper)" : st.text,
            border: "1px solid var(--sv-ink)",
          }}
        >
          {ROADMAP_STATUS_LABEL[item.status]}
        </span>
      </div>

      <h3
        className="sv-display"
        style={{
          fontSize: 22,
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          color: "var(--sv-ink)",
          fontWeight: 400,
        }}
      >
        {item.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--sv-sans)",
          fontSize: 13,
          lineHeight: 1.55,
          color: isNow ? "var(--sv-ink)" : "var(--sv-muted)",
        }}
      >
        {item.body}
      </p>

      <ul className="flex flex-col gap-1.5">
        {item.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2"
            style={{
              fontFamily: "var(--sv-sans)",
              fontSize: 12,
              lineHeight: 1.45,
              color: "var(--sv-ink)",
            }}
          >
            <ArrowRight
              size={11}
              strokeWidth={2}
              className="shrink-0 mt-[3px]"
              style={{ color: isNow ? "var(--sv-ink)" : "var(--sv-green)" }}
            />
            {b}
          </li>
        ))}
      </ul>

      <div
        className="mt-auto pt-3 uppercase"
        style={{
          borderTop: "1px dashed var(--sv-ink)",
          fontFamily: "var(--sv-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "var(--sv-muted)",
          fontWeight: 700,
        }}
      >
        {item.tag}
      </div>
    </motion.article>
  );
}
