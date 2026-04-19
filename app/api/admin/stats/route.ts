import {
  requireAdmin,
  createServiceRoleSupabaseClient,
} from "@/lib/server/auth";

export const maxDuration = 30;

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

interface CarouselRow {
  user_id: string | null;
  status: string | null;
}

/**
 * Dashboard admin — retorna agregados globais + listas recentes pra UI.
 * Acesso restrito a ADMIN_EMAILS (lib/server/auth.ts).
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) return admin.response;

    const sb = createServiceRoleSupabaseClient();
    if (!sb) {
      return Response.json(
        { error: "Service role key ausente — admin indisponível." },
        { status: 503 }
      );
    }

    // Busca paralela: usuários + gerações recentes + carrosséis.
    const [profilesRes, generationsRes, carouselsRes] = await Promise.all([
      sb
        .from("profiles")
        .select(
          "id,email,name,plan,usage_count,usage_limit,onboarding_completed,created_at,instagram_handle,twitter_handle"
        )
        .order("created_at", { ascending: false })
        .limit(500),
      sb
        .from("generations")
        .select(
          "id,user_id,model,provider,input_tokens,output_tokens,cost_usd,prompt_type,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(200),
      sb.from("carousels").select("user_id,status").limit(5000),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (generationsRes.error) throw generationsRes.error;
    if (carouselsRes.error) throw carouselsRes.error;

    const profiles = (profilesRes.data ?? []) as UserRow[];
    const generations = (generationsRes.data ?? []) as GenerationRow[];
    const carousels = (carouselsRes.data ?? []) as CarouselRow[];

    // Totais globais
    const totalUsers = profiles.length;
    const completedOnboarding = profiles.filter(
      (p) => p.onboarding_completed
    ).length;
    const planCounts: Record<string, number> = {};
    for (const p of profiles) {
      const plan = p.plan || "free";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    }

    const totalGenerations = generations.length;
    const totalCostUsd = generations.reduce((acc, g) => {
      const n = typeof g.cost_usd === "string"
        ? parseFloat(g.cost_usd)
        : g.cost_usd ?? 0;
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    const totalInputTokens = generations.reduce(
      (acc, g) => acc + (g.input_tokens ?? 0),
      0
    );
    const totalOutputTokens = generations.reduce(
      (acc, g) => acc + (g.output_tokens ?? 0),
      0
    );

    const providerBreakdown: Record<
      string,
      { count: number; cost: number; tokens: number }
    > = {};
    for (const g of generations) {
      const p = g.provider || "unknown";
      const cost = typeof g.cost_usd === "string"
        ? parseFloat(g.cost_usd)
        : g.cost_usd ?? 0;
      const tokens = (g.input_tokens ?? 0) + (g.output_tokens ?? 0);
      if (!providerBreakdown[p]) {
        providerBreakdown[p] = { count: 0, cost: 0, tokens: 0 };
      }
      providerBreakdown[p].count += 1;
      providerBreakdown[p].cost += Number.isFinite(cost) ? cost : 0;
      providerBreakdown[p].tokens += tokens;
    }

    // Carrosséis por usuário + por status
    const totalCarousels = carousels.length;
    const carouselStatus: Record<string, number> = {};
    for (const c of carousels) {
      const s = c.status || "draft";
      carouselStatus[s] = (carouselStatus[s] || 0) + 1;
    }

    // Por-usuário aggregates (top 50 mais ativos)
    const perUser: Record<
      string,
      { carousels: number; generations: number; cost: number; tokens: number }
    > = {};
    for (const c of carousels) {
      if (!c.user_id) continue;
      perUser[c.user_id] ??= {
        carousels: 0,
        generations: 0,
        cost: 0,
        tokens: 0,
      };
      perUser[c.user_id].carousels += 1;
    }
    for (const g of generations) {
      if (!g.user_id) continue;
      perUser[g.user_id] ??= {
        carousels: 0,
        generations: 0,
        cost: 0,
        tokens: 0,
      };
      const cost = typeof g.cost_usd === "string"
        ? parseFloat(g.cost_usd)
        : g.cost_usd ?? 0;
      perUser[g.user_id].generations += 1;
      perUser[g.user_id].cost += Number.isFinite(cost) ? cost : 0;
      perUser[g.user_id].tokens +=
        (g.input_tokens ?? 0) + (g.output_tokens ?? 0);
    }

    const userRows = profiles.map((p) => ({
      ...p,
      stats: perUser[p.id] ?? {
        carousels: 0,
        generations: 0,
        cost: 0,
        tokens: 0,
      },
    }));

    return Response.json({
      summary: {
        totalUsers,
        completedOnboarding,
        planCounts,
        totalGenerations,
        totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
        totalInputTokens,
        totalOutputTokens,
        totalCarousels,
        carouselStatus,
      },
      providerBreakdown,
      users: userRows,
      recentGenerations: generations.slice(0, 100),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/stats] error:", msg);
    return Response.json({ error: msg.slice(0, 200) }, { status: 500 });
  }
}
