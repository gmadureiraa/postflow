"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { REVEAL, SectionHead } from "./shared";

type Interval = "month" | "year";

function PlanCard({
  ribbon,
  ribbonVariant,
  tag,
  title,
  price,
  unit,
  anchor,
  features,
  cta,
  ctaHref,
  ctaVariant,
  featured = false,
  annualSaving,
}: {
  ribbon: string;
  ribbonVariant: "free" | "pro" | "biz";
  tag?: string;
  title: string;
  price: string;
  unit: string;
  anchor?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  ctaVariant: "primary" | "outline";
  featured?: boolean;
  annualSaving?: string;
}) {
  const ribbonBg =
    ribbonVariant === "free"
      ? "transparent"
      : ribbonVariant === "pro"
        ? "var(--sv-green)"
        : "var(--sv-pink)";
  const ribbonBorder =
    ribbonVariant === "free"
      ? "var(--sv-line)"
      : featured
        ? "var(--sv-green)"
        : "var(--sv-ink)";
  const ribbonColor =
    ribbonVariant === "free"
      ? "var(--sv-muted)"
      : featured && ribbonVariant === "pro"
        ? "var(--sv-green)"
        : "var(--sv-ink)";

  return (
    <motion.article
      {...REVEAL}
      className="relative flex flex-col gap-[14px]"
      style={{
        background: featured ? "var(--sv-ink)" : "var(--sv-white)",
        color: featured ? "var(--sv-paper)" : "var(--sv-ink)",
        border: "1.5px solid var(--sv-ink)",
        padding: 28,
        boxShadow: featured ? "5px 5px 0 0 var(--sv-green)" : "5px 5px 0 0 var(--sv-ink)",
        transform: featured ? "translateY(-8px)" : undefined,
        transition: "transform .25s, box-shadow .25s",
      }}
    >
      <span
        className="self-start"
        style={{
          padding: "4px 10px",
          border: `1px solid ${ribbonBorder}`,
          background: featured && ribbonVariant === "pro" ? "transparent" : ribbonBg,
          color: ribbonColor,
          fontFamily: "var(--sv-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {ribbon}
      </span>
      {tag && (
        <span
          className="self-start"
          style={{
            padding: "3px 9px",
            background: featured ? "var(--sv-green)" : "var(--sv-pink)",
            color: "var(--sv-ink)",
            border: featured ? "1px solid var(--sv-green)" : "1px solid var(--sv-ink)",
            fontFamily: "var(--sv-mono)",
            fontSize: 8.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            boxShadow: featured ? "2px 2px 0 0 var(--sv-paper)" : "2px 2px 0 0 var(--sv-ink)",
          }}
        >
          {tag}
        </span>
      )}
      <h3
        className="sv-display"
        style={{
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 0.95,
          fontStyle: "italic",
        }}
      >
        {title}
      </h3>
      <div>
        {anchor && (
          <span
            className="block"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 10,
              textDecoration: "line-through",
              color: "var(--sv-muted)",
            }}
          >
            {anchor}
          </span>
        )}
        <div className="flex items-baseline gap-[6px]">
          <span
            className="sv-display"
            style={{ fontSize: 44, letterSpacing: "-0.025em", lineHeight: 1 }}
          >
            {price}
          </span>
          {unit && (
            <span
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: featured ? "rgba(255,255,255,.6)" : "var(--sv-muted)",
              }}
            >
              {unit}
            </span>
          )}
        </div>
        {annualSaving && (
          <div
            className="mt-1"
            style={{
              fontFamily: "var(--sv-mono)",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--sv-green)",
              fontWeight: 700,
            }}
          >
            {annualSaving}
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2" style={{ fontSize: 13 }}>
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span style={{ color: "var(--sv-green)", flexShrink: 0 }}>✦</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`sv-btn sv-btn-${ctaVariant === "primary" ? "primary" : "outline"} mt-auto`}
      >
        {cta}
      </Link>
    </motion.article>
  );
}

function IntervalToggle({
  interval,
  onChange,
}: {
  interval: Interval;
  onChange: (i: Interval) => void;
}) {
  return (
    <motion.div
      {...REVEAL}
      className="mb-8 inline-flex items-center gap-[2px]"
      style={{
        padding: 3,
        border: "1.5px solid var(--sv-ink)",
        background: "var(--sv-white)",
        boxShadow: "3px 3px 0 0 var(--sv-ink)",
      }}
    >
      {(["month", "year"] as const).map((v) => {
        const on = interval === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="uppercase"
            style={{
              padding: "8px 16px",
              fontFamily: "var(--sv-mono)",
              fontSize: 10.5,
              letterSpacing: "0.18em",
              fontWeight: 700,
              background: on ? "var(--sv-ink)" : "transparent",
              color: on ? "var(--sv-paper)" : "var(--sv-ink)",
              border: "none",
              cursor: "pointer",
              transition: "background .15s, color .15s",
              position: "relative",
            }}
          >
            {v === "month" ? "Mensal" : "Anual"}
            {v === "year" && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  background: on ? "var(--sv-green)" : "var(--sv-green)",
                  color: "var(--sv-ink)",
                  fontSize: 8.5,
                  letterSpacing: "0.12em",
                }}
              >
                −20%
              </span>
            )}
          </button>
        );
      })}
    </motion.div>
  );
}

export function PricingSection() {
  const [interval, setInterval] = useState<Interval>("month");
  const isAnnual = interval === "year";

  // Preços calculados em BRL a partir da config.
  const proMonth = "R$ 89";
  const proAnnualMonthlyEq = "R$ 71,20"; // R$ 854,40/12
  const proYearTotal = "R$ 854,40/ano";

  const agencyMonth = "R$ 249";
  const agencyAnnualMonthlyEq = "R$ 199,20"; // R$ 2.390,40/12
  const agencyYearTotal = "R$ 2.390,40/ano";

  return (
    <section id="pricing" style={{ padding: "0 0 96px" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <SectionHead num="08" sub="Pricing" tag="Preço em Real">
          Preço <em>honesto</em>.{" "}
          <span style={{ color: "var(--sv-muted)" }}>Cancele quando quiser.</span>
        </SectionHead>

        <IntervalToggle interval={interval} onChange={setInterval} />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          <PlanCard
            ribbon="Pra experimentar"
            ribbonVariant="free"
            title="Grátis"
            price="R$ 0"
            unit=""
            features={[
              "5 carrosséis/mês",
              "Export PNG em alta",
              "Modo rápido + avançado",
              "4 templates editoriais",
              "1 perfil de marca",
            ]}
            cta="Começar agora"
            ctaHref="/app/login"
            ctaVariant="outline"
          />
          <PlanCard
            featured
            ribbon="Mais popular"
            ribbonVariant="pro"
            tag="Pra criador solo"
            title="Pro"
            price={isAnnual ? proAnnualMonthlyEq : proMonth}
            unit="/mês"
            anchor={isAnnual ? "R$ 89/mês no mensal" : "R$ 149"}
            annualSaving={isAnnual ? `Cobrado ${proYearTotal}` : undefined}
            features={[
              "30 carrosséis/mês",
              "Voz da IA configurável",
              "3 referências visuais por marca",
              "Export PNG + PDF",
              "3 perfis de marca",
              "Transcrição de vídeos",
              "Histórico completo",
            ]}
            cta={isAnnual ? "Assinar Pro anual →" : "Assinar Pro →"}
            ctaHref={`/app/checkout?plan=pro${isAnnual ? "&interval=year" : ""}`}
            ctaVariant="primary"
          />
          <PlanCard
            ribbon="Pra agências e times"
            ribbonVariant="biz"
            title="Agência"
            price={isAnnual ? agencyAnnualMonthlyEq : agencyMonth}
            unit="/mês"
            anchor={isAnnual ? "R$ 249/mês no mensal" : undefined}
            annualSaving={isAnnual ? `Cobrado ${agencyYearTotal}` : undefined}
            features={[
              "Carrosséis ilimitados",
              "10 perfis de marca",
              "Workspace compartilhado",
              "Templates customizados",
              "Referências visuais por cliente",
              "Suporte prioritário",
              "API (em breve)",
            ]}
            cta={isAnnual ? "Assinar Agência anual" : "Assinar Agência"}
            ctaHref={`/app/checkout?plan=agency${isAnnual ? "&interval=year" : ""}`}
            ctaVariant="outline"
          />
        </div>
      </div>
    </section>
  );
}
