import {
  requireAdmin,
  createServiceRoleSupabaseClient,
} from "@/lib/server/auth";

export const maxDuration = 30;

/**
 * Retorna perfil COMPLETO + carrosséis + gerações + payments de um único
 * usuário. Usado em /app/admin/users/[id] pra visão 360 por cliente.
 *
 * Gate: requireAdmin. Retorno sanitizado (sem stripe_customer_id exposto
 * em texto puro — só 4 últimos chars).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return Response.json({ error: "id inválido" }, { status: 400 });
    }

    const sb = createServiceRoleSupabaseClient();
    if (!sb) {
      return Response.json(
        { error: "Service role key ausente." },
        { status: 503 }
      );
    }

    const [profileRes, carouselsRes, generationsRes, paymentsRes] =
      await Promise.all([
        sb.from("profiles").select("*").eq("id", id).single(),
        sb
          .from("carousels")
          .select(
            "id,title,status,thumbnail_url,created_at,updated_at,slides"
          )
          .eq("user_id", id)
          .order("updated_at", { ascending: false })
          .limit(50),
        sb
          .from("generations")
          .select(
            "id,model,provider,input_tokens,output_tokens,cost_usd,prompt_type,created_at"
          )
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(200),
        sb
          .from("payments")
          .select(
            "id,amount_usd,currency,method,status,plan,period_start,period_end,created_at,tx_hash"
          )
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
      ]);

    if (profileRes.error || !profileRes.data) {
      return Response.json(
        { error: profileRes.error?.message || "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const profile = profileRes.data;
    const carousels = carouselsRes.data ?? [];
    const generations = generationsRes.data ?? [];
    const payments = paymentsRes.data ?? [];

    // Totais
    const parseCost = (c: number | string | null | undefined): number => {
      const n = typeof c === "string" ? parseFloat(c) : c ?? 0;
      return Number.isFinite(n) ? n : 0;
    };
    const totalCostUsd = generations.reduce(
      (a, g) => a + parseCost(g.cost_usd),
      0
    );
    const totalInputTokens = generations.reduce(
      (a, g) => a + (g.input_tokens ?? 0),
      0
    );
    const totalOutputTokens = generations.reduce(
      (a, g) => a + (g.output_tokens ?? 0),
      0
    );
    const ltv = payments
      .filter((p) => p.status === "confirmed")
      .reduce((a, p) => a + parseCost(p.amount_usd), 0);

    // Slim profile — oculta chaves de parceiros.
    const safeProfile = {
      ...profile,
      stripe_customer_id: profile.stripe_customer_id
        ? `••••${String(profile.stripe_customer_id).slice(-4)}`
        : null,
      stripe_subscription_id: profile.stripe_subscription_id
        ? `••••${String(profile.stripe_subscription_id).slice(-4)}`
        : null,
    };

    // Slim slides — só primeiro slide pra preview, economia de payload.
    const carouselsSlim = carousels.map((c) => {
      const slides = Array.isArray(c.slides) ? c.slides : [];
      return {
        id: c.id,
        title: c.title,
        status: c.status,
        thumbnail_url: c.thumbnail_url,
        created_at: c.created_at,
        updated_at: c.updated_at,
        slide_count: slides.length,
        first_slide:
          slides[0] && typeof slides[0] === "object"
            ? {
                heading: (slides[0] as { heading?: string }).heading ?? null,
                body: (slides[0] as { body?: string }).body ?? null,
              }
            : null,
      };
    });

    return Response.json({
      profile: safeProfile,
      carousels: carouselsSlim,
      generations,
      payments,
      totals: {
        totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
        totalInputTokens,
        totalOutputTokens,
        totalGenerations: generations.length,
        totalCarousels: carousels.length,
        ltv: Math.round(ltv * 100) / 100,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/users/:id] error:", msg);
    return Response.json({ error: msg.slice(0, 200) }, { status: 500 });
  }
}
