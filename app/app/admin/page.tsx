"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Users, Zap, DollarSign, Image } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { jsonWithAuth } from "@/lib/api-auth-headers";

/**
 * Painel admin. Acessível apenas pra emails em ADMIN_EMAILS (lib/server/auth.ts).
 * Mostra totais, breakdown por provider, tabela de usuários e últimas gerações.
 */

interface UserStats {
  carousels: number;
  generations: number;
  cost: number;
  tokens: number;
}

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  plan: string | null;
  usage_count: number | null;
  usage_limit: number | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  stats: UserStats;
}

interface GenerationRow {
  id: string;
  user_id: string | null;
  model: string | null;
  provider: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | string | null;
  prompt_type: string | null;
  created_at: string | null;
}

interface AdminStats {
  summary: {
    totalUsers: number;
    completedOnboarding: number;
    planCounts: Record<string, number>;
    totalGenerations: number;
    totalCostUsd: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCarousels: number;
    carouselStatus: Record<string, number>;
  };
  providerBreakdown: Record<
    string,
    { count: number; cost: number; tokens: number }
  >;
  users: UserRow[];
  recentGenerations: GenerationRow[];
  generatedAt: string;
}

const ADMIN_EMAILS = ["gf.madureiraa@gmail.com", "gf.madureira@hotmail.com"];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { profile, session, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");

  const isAdmin = useMemo(() => {
    const email = profile?.email?.toLowerCase().trim();
    return email ? ADMIN_EMAILS.includes(email) : false;
  }, [profile]);

  // Redirect não-admin pro dashboard regular
  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    if (!isAdmin) router.replace("/app");
  }, [loading, profile, isAdmin, router]);

  const load = useCallback(async () => {
    if (!session) return;
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "GET",
        headers: jsonWithAuth(session),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar");
      setStats(data as AdminStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setFetching(false);
    }
  }, [session]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const filteredUsers = useMemo(() => {
    if (!stats) return [];
    const q = userQuery.trim().toLowerCase();
    if (!q) return stats.users;
    return stats.users.filter((u) => {
      return (
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.instagram_handle ?? "").toLowerCase().includes(q) ||
        (u.twitter_handle ?? "").toLowerCase().includes(q)
      );
    });
  }, [stats, userQuery]);

  if (!isAdmin && !loading) {
    return (
      <div className="mx-auto max-w-[600px] py-12">
        <p style={{ fontFamily: "var(--sv-mono)", color: "var(--sv-muted)" }}>
          Sem acesso.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full"
      style={{ maxWidth: 1200 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="sv-eyebrow">
            <span className="sv-dot" /> Nº 00 · Admin · Controle
          </span>
          <h1
            className="sv-display mt-3"
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
            }}
          >
            Painel <em>admin</em>.
          </h1>
          <p
            className="mt-2"
            style={{ color: "var(--sv-muted)", fontSize: 13.5 }}
          >
            Usuários, gerações, gastos de API. Atualizado em tempo real.
            {stats?.generatedAt && (
              <>
                {" "}
                Última leitura:{" "}
                <span style={{ color: "var(--sv-ink)" }}>
                  {fmtDate(stats.generatedAt)}
                </span>
                .
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={fetching}
          className="sv-btn sv-btn-outline"
          style={{
            padding: "10px 14px",
            fontSize: 10.5,
            opacity: fetching ? 0.5 : 1,
          }}
        >
          {fetching ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          Atualizar
        </button>
      </div>

      {error && (
        <div
          className="mt-4 p-3"
          style={{
            border: "1.5px solid #c94f3b",
            background: "#fdf0ed",
            color: "#7a2a1a",
            fontFamily: "var(--sv-sans)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!stats && fetching && (
        <div className="mt-10 text-center">
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--sv-ink)" }}
          />
        </div>
      )}

      {stats && (
        <>
          {/* ── CARDS DE TOTAIS ──────────────────────────────────── */}
          <div
            className="mt-6 grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            }}
          >
            <StatCard
              icon={<Users size={14} />}
              label="Usuários"
              value={fmtNum(stats.summary.totalUsers)}
              sub={`${stats.summary.completedOnboarding} completaram onboarding`}
            />
            <StatCard
              icon={<Zap size={14} />}
              label="Gerações (últimas 200)"
              value={fmtNum(stats.summary.totalGenerations)}
              sub={`${fmtNum(stats.summary.totalInputTokens + stats.summary.totalOutputTokens)} tokens`}
            />
            <StatCard
              icon={<DollarSign size={14} />}
              label="Gasto API"
              value={fmtUsd(stats.summary.totalCostUsd)}
              sub="Últimas 200 gerações"
            />
            <StatCard
              icon={<Image size={14} strokeWidth={1.8} aria-hidden />}
              label="Carrosséis"
              value={fmtNum(stats.summary.totalCarousels)}
              sub={
                Object.entries(stats.summary.carouselStatus)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ") || "—"
              }
            />
          </div>

          {/* ── BREAKDOWN POR PROVIDER ───────────────────────────── */}
          <section className="mt-8">
            <div
              className="uppercase mb-3"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                color: "var(--sv-muted)",
                fontWeight: 700,
              }}
            >
              Por provider
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(stats.providerBreakdown).map(([p, data]) => (
                <div
                  key={p}
                  style={{
                    padding: 18,
                    background: "var(--sv-white)",
                    border: "1.5px solid var(--sv-ink)",
                    boxShadow: "3px 3px 0 0 var(--sv-ink)",
                  }}
                >
                  <div
                    className="uppercase"
                    style={{
                      fontFamily: "var(--sv-mono)",
                      fontSize: 9.5,
                      letterSpacing: "0.2em",
                      color: "var(--sv-muted)",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    {p}
                  </div>
                  <div
                    className="italic"
                    style={{
                      fontFamily: "var(--sv-display)",
                      fontSize: 28,
                      lineHeight: 1,
                      color: "var(--sv-ink)",
                    }}
                  >
                    {data.count}
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontFamily: "var(--sv-sans)",
                      fontSize: 12,
                      color: "var(--sv-ink)",
                    }}
                  >
                    {fmtUsd(data.cost)} · {fmtNum(data.tokens)} tokens
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── PLANOS ──────────────────────────────────────────── */}
          <section className="mt-8">
            <div
              className="uppercase mb-3"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                color: "var(--sv-muted)",
                fontWeight: 700,
              }}
            >
              Distribuição de planos
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.summary.planCounts).map(([plan, count]) => (
                <span
                  key={plan}
                  className="uppercase"
                  style={{
                    padding: "8px 14px",
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                    border: "1.5px solid var(--sv-ink)",
                    background:
                      plan === "free"
                        ? "var(--sv-paper)"
                        : plan === "pro"
                          ? "var(--sv-green)"
                          : "var(--sv-pink)",
                    color: "var(--sv-ink)",
                  }}
                >
                  {plan} · {count}
                </span>
              ))}
            </div>
          </section>

          {/* ── TABELA DE USUÁRIOS ──────────────────────────────── */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <div
                className="uppercase"
                style={{
                  fontFamily: "var(--sv-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  color: "var(--sv-muted)",
                  fontWeight: 700,
                }}
              >
                Usuários ({filteredUsers.length})
              </div>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Buscar por email, nome, handle..."
                className="sv-input"
                style={{
                  padding: "7px 10px",
                  fontSize: 12,
                  minWidth: 260,
                }}
              />
            </div>
            <div
              style={{
                background: "var(--sv-white)",
                border: "1.5px solid var(--sv-ink)",
                boxShadow: "3px 3px 0 0 var(--sv-ink)",
                overflow: "auto",
                maxHeight: 500,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--sv-sans)",
                  fontSize: 12,
                }}
              >
                <thead
                  style={{
                    background: "var(--sv-paper)",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <tr>
                    <Th>Usuário</Th>
                    <Th>Email</Th>
                    <Th>Plano</Th>
                    <Th align="right">Uso</Th>
                    <Th align="right">Carrosséis</Th>
                    <Th align="right">Gerações</Th>
                    <Th align="right">Custo</Th>
                    <Th>Criado</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderTop: "1px solid rgba(10,10,10,0.08)",
                      }}
                    >
                      <Td>
                        <div style={{ fontWeight: 700 }}>{u.name || "—"}</div>
                        <div
                          className="uppercase"
                          style={{
                            fontFamily: "var(--sv-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "var(--sv-muted)",
                          }}
                        >
                          {u.instagram_handle
                            ? `@${u.instagram_handle}`
                            : u.twitter_handle
                              ? `@${u.twitter_handle}`
                              : "sem handle"}
                        </div>
                      </Td>
                      <Td>{u.email || "—"}</Td>
                      <Td>
                        <span
                          className="uppercase"
                          style={{
                            fontFamily: "var(--sv-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            fontWeight: 700,
                            padding: "2px 6px",
                            background:
                              u.plan === "pro"
                                ? "var(--sv-green)"
                                : u.plan === "business"
                                  ? "var(--sv-pink)"
                                  : "var(--sv-soft)",
                            color: "var(--sv-ink)",
                          }}
                        >
                          {u.plan || "free"}
                        </span>
                      </Td>
                      <Td align="right">
                        {u.usage_count ?? 0}/{u.usage_limit ?? "?"}
                      </Td>
                      <Td align="right">{u.stats.carousels}</Td>
                      <Td align="right">{u.stats.generations}</Td>
                      <Td align="right">{fmtUsd(u.stats.cost)}</Td>
                      <Td>{fmtDate(u.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── GERAÇÕES RECENTES ──────────────────────────────── */}
          <section className="mt-10 mb-16">
            <div
              className="uppercase mb-3"
              style={{
                fontFamily: "var(--sv-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                color: "var(--sv-muted)",
                fontWeight: 700,
              }}
            >
              Gerações recentes (últimas 100)
            </div>
            <div
              style={{
                background: "var(--sv-white)",
                border: "1.5px solid var(--sv-ink)",
                boxShadow: "3px 3px 0 0 var(--sv-ink)",
                overflow: "auto",
                maxHeight: 500,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--sv-sans)",
                  fontSize: 12,
                }}
              >
                <thead
                  style={{
                    background: "var(--sv-paper)",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <tr>
                    <Th>Quando</Th>
                    <Th>Usuário ID</Th>
                    <Th>Provider</Th>
                    <Th>Modelo</Th>
                    <Th>Tipo</Th>
                    <Th align="right">In</Th>
                    <Th align="right">Out</Th>
                    <Th align="right">Custo</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentGenerations.map((g) => {
                    const cost =
                      typeof g.cost_usd === "string"
                        ? parseFloat(g.cost_usd)
                        : g.cost_usd ?? 0;
                    return (
                      <tr
                        key={g.id}
                        style={{
                          borderTop: "1px solid rgba(10,10,10,0.08)",
                        }}
                      >
                        <Td>{fmtDate(g.created_at)}</Td>
                        <Td>
                          <span
                            style={{
                              fontFamily: "var(--sv-mono)",
                              fontSize: 10,
                              color: "var(--sv-muted)",
                            }}
                          >
                            {g.user_id?.slice(0, 8) ?? "—"}
                          </span>
                        </Td>
                        <Td>{g.provider ?? "—"}</Td>
                        <Td>{g.model ?? "—"}</Td>
                        <Td>{g.prompt_type ?? "—"}</Td>
                        <Td align="right">{g.input_tokens ?? 0}</Td>
                        <Td align="right">{g.output_tokens ?? 0}</Td>
                        <Td align="right">{fmtUsd(cost)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--sv-white)",
        border: "1.5px solid var(--sv-ink)",
        boxShadow: "3px 3px 0 0 var(--sv-ink)",
      }}
    >
      <div
        className="flex items-center gap-1.5 uppercase"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          color: "var(--sv-muted)",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        className="italic"
        style={{
          fontFamily: "var(--sv-display)",
          fontSize: 30,
          lineHeight: 1,
          color: "var(--sv-ink)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: "var(--sv-mono)",
          fontSize: 9,
          letterSpacing: "0.12em",
          color: "var(--sv-muted)",
          textTransform: "uppercase",
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right" | "left";
}) {
  return (
    <th
      style={{
        padding: "10px 12px",
        textAlign: align ?? "left",
        fontFamily: "var(--sv-mono)",
        fontSize: 9.5,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--sv-muted)",
        fontWeight: 700,
        borderBottom: "1.5px solid var(--sv-ink)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right" | "left";
}) {
  return (
    <td
      style={{
        padding: "10px 12px",
        textAlign: align ?? "left",
        color: "var(--sv-ink)",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}
