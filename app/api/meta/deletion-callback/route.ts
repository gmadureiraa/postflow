/**
 * POST /api/meta/deletion-callback
 *
 * Endpoint que Meta chama quando o user revoga o app (Settings → Apps and
 * Websites → Remove). Meta manda um signed_request HMAC-SHA256 assinado
 * com APP_SECRET; precisamos validar, soft-deletar as conexões do user no
 * nosso DB e responder com { url, confirmation_code } pro user conseguir
 * auditar o progresso.
 *
 * Docs: https://developers.facebook.com/docs/development/create-an-app/
 *         app-dashboard/data-deletion-callback/
 */

import crypto from "node:crypto";
import { createServiceRoleSupabaseClient } from "@/lib/server/auth";

export const runtime = "nodejs";
export const maxDuration = 10;

interface SignedRequestPayload {
  user_id?: string;
  algorithm?: string;
  issued_at?: number;
  expires?: number;
}

function base64UrlDecode(input: string): Buffer {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const normalized = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function parseSignedRequest(
  signedRequest: string,
  appSecret: string
): SignedRequestPayload | null {
  const parts = signedRequest.split(".");
  if (parts.length !== 2) return null;
  const [encodedSig, encodedPayload] = parts;

  const sig = base64UrlDecode(encodedSig);
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(encodedPayload)
    .digest();

  // Timing-safe comparison.
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(sig, expected)) return null;

  try {
    const json = base64UrlDecode(encodedPayload).toString("utf-8");
    return JSON.parse(json) as SignedRequestPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) {
    console.error("[meta/deletion] FACEBOOK_APP_SECRET missing");
    return Response.json({ error: "not configured" }, { status: 503 });
  }

  let signedRequest: string | null = null;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    signedRequest = form.get("signed_request")?.toString() ?? null;
  } else {
    try {
      const body = await request.json();
      signedRequest = body?.signed_request ?? null;
    } catch {
      /* ignore */
    }
  }

  if (!signedRequest) {
    return Response.json(
      { error: "signed_request required" },
      { status: 400 }
    );
  }

  const payload = parseSignedRequest(signedRequest, appSecret);
  if (!payload || !payload.user_id) {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  const metaUserId = payload.user_id;
  const confirmationCode = crypto
    .randomBytes(16)
    .toString("hex")
    .toUpperCase();

  const sb = createServiceRoleSupabaseClient();
  if (sb) {
    // Soft-delete (marca revoked_at) + log do request. Não deletamos hard
    // porque user pode reconectar; usamos revoked_at como sinal.
    await sb
      .from("meta_connections")
      .update({
        revoked_at: new Date().toISOString(),
        access_token: "revoked",
        updated_at: new Date().toISOString(),
      })
      .eq("meta_user_id", metaUserId);

    await sb.from("meta_deletion_requests").insert({
      meta_user_id: metaUserId,
      confirmation_code: confirmationCode,
    });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://viral.kaleidos.com.br";
  return Response.json({
    url: `${base}/account/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
