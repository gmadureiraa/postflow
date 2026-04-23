/**
 * Adapter ScrapeCreators (https://scrapecreators.com). Fallback do Apify —
 * 1 credito por chamada (profile + posts) e payload espelha a API interna
 * do Instagram (`edge_followed_by`, `carousel_media`, `image_versions2`).
 *
 * Dois endpoints:
 *  - GET /v1/instagram/profile?handle=xxx           -> dados do perfil
 *  - GET /v2/instagram/user/posts?handle=xxx        -> ultimos ~12 posts
 *
 * Nao ha endpoint combinado, entao chamamos em paralelo via Promise.all.
 * Se NENHUMA chave (`SCRAPECREATORS_API_KEY` nem `SCRAPECREATORS_API_KEY_BACKUP`)
 * estiver setada, o adapter nao deve ser instanciado (ver `index.ts`) — mas
 * por precaucao ele throw `ScraperError("key missing", ..., false)`
 * nao-retryable se alguem pular a checagem.
 *
 * Fallback de keys: quando a primary retorna 429 (rate limit) ou 401 (auth
 * invalida), a helper tenta a backup key. Mesmo padrao do Supadata
 * (ver `lib/supadata.ts`).
 */

import {
  InstagramScraper,
  ProfileData,
  RecentPost,
  ScraperError,
} from "./types";
import { inferNiche } from "./common";

const BASE = "https://api.scrapecreators.com";
const TIMEOUT_MS = 20_000;

type Json = Record<string, unknown>;

/** Retorna as keys ordenadas: primary antes, backup depois. Skip nulls. */
function getScrapeCreatorsKeys(): string[] {
  const primary = process.env.SCRAPECREATORS_API_KEY;
  const backup = process.env.SCRAPECREATORS_API_KEY_BACKUP;
  return [primary, backup].filter(
    (k): k is string => typeof k === "string" && k.length > 0
  );
}

/** True se pelo menos uma das 2 keys estiver configurada. */
export function isScrapeCreatorsConfigured(): boolean {
  return getScrapeCreatorsKeys().length > 0;
}

/**
 * Helper com loop primary → backup. Em 429 (rate limit) ou 401 (auth),
 * tenta a proxima key automaticamente. Outros erros lancam normalmente.
 */
async function callEndpoint(path: string, handle: string): Promise<Json> {
  const keys = getScrapeCreatorsKeys();
  if (keys.length === 0) {
    throw new ScraperError(
      "SCRAPECREATORS_API_KEY missing",
      "scrapecreators",
      false
    );
  }

  const url = `${BASE}${path}?handle=${encodeURIComponent(handle.replace(/^@/, ""))}`;
  let lastErr: ScraperError | null = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLastKey = i === keys.length - 1;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": key,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      lastErr = new ScraperError(
        `scrapecreators network error on ${path}: ${msg}`,
        "scrapecreators",
        true
      );
      if (!isLastKey) {
        console.warn(
          `[scrapecreators] key #${i + 1} erro de rede (${msg}), tentando fallback #${i + 2}`
        );
        continue;
      }
      throw lastErr;
    }

    if ((res.status === 429 || res.status === 401) && !isLastKey) {
      console.warn(
        `[scrapecreators] key #${i + 1} retornou ${res.status} em ${path}, tentando fallback #${i + 2}`
      );
      continue;
    }

    if (res.status === 429) {
      throw new ScraperError(
        `scrapecreators 429 on ${path} (rate limited — todas as keys)`,
        "scrapecreators",
        true
      );
    }

    if (res.status === 401) {
      throw new ScraperError(
        `scrapecreators 401 on ${path} (auth — todas as keys rejeitadas)`,
        "scrapecreators",
        false
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const retryable = res.status >= 500;
      throw new ScraperError(
        `scrapecreators ${res.status} on ${path}: ${text.slice(0, 120)}`,
        "scrapecreators",
        retryable
      );
    }

    const json = (await res.json().catch(() => null)) as Json | null;
    if (!json) {
      throw new ScraperError(
        `scrapecreators returned invalid JSON on ${path}`,
        "scrapecreators",
        true
      );
    }
    return json;
  }

  throw (
    lastErr ??
    new ScraperError(
      `scrapecreators: todas as keys falharam em ${path}`,
      "scrapecreators",
      true
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickBestImage(candidates: any[]): string | null {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  // Candidates normalmente vem ordenados por resolucao desc. Pegamos o
  // primeiro que for uma URL valida.
  for (const c of candidates) {
    const url = c?.url;
    if (typeof url === "string" && url.startsWith("http")) return url;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPrimaryImage(post: any): string | null {
  // image_versions2.candidates -> shape novo IG
  const fromCandidates = pickBestImage(post?.image_versions2?.candidates ?? []);
  if (fromCandidates) return fromCandidates;
  return (
    post?.display_uri ??
    post?.display_url ??
    post?.thumbnail_url ??
    null
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCarouselUrls(post: any): string[] {
  const children: unknown[] =
    post?.carousel_media ?? post?.carousel_media_v2 ?? [];
  if (!Array.isArray(children) || children.length === 0) return [];
  const urls: string[] = [];
  for (const c of children) {
    const img = extractPrimaryImage(c);
    if (img) urls.push(img);
  }
  return urls;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(post: any): RecentPost {
  const slideUrls = extractCarouselUrls(post);
  // media_type: 1 = image, 2 = video, 8 = carousel
  const mediaType = post?.media_type;
  const isCarousel = mediaType === 8 || slideUrls.length > 1;

  const primary =
    extractPrimaryImage(post) ??
    slideUrls[0] ??
    null;

  const code: string | undefined = post?.code ?? post?.shortcode;
  const permalink = code ? `https://www.instagram.com/p/${code}/` : null;

  const takenAt: number | undefined = post?.taken_at;
  const timestamp = takenAt ? new Date(takenAt * 1000).toISOString() : null;

  return {
    text: post?.caption?.text ?? post?.caption ?? "",
    likes: post?.like_count ?? 0,
    comments: post?.comment_count ?? 0,
    imageUrl: primary,
    slideUrls: isCarousel ? slideUrls : [],
    isCarousel,
    permalink,
    timestamp,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractUserObject(profileJson: any): any | null {
  // Schema documentado: { success, status, data: { user: {...} } }
  // Alguns retornos legacy tem o user no topo. Cobrimos ambos.
  if (profileJson?.data?.user) return profileJson.data.user;
  if (profileJson?.user) return profileJson.user;
  if (profileJson?.data) return profileJson.data;
  return profileJson ?? null;
}

export class ScrapeCreatorsScraper implements InstagramScraper {
  id = "scrapecreators";

  async scrape(handle: string): Promise<ProfileData> {
    if (!isScrapeCreatorsConfigured()) {
      throw new ScraperError(
        "SCRAPECREATORS_API_KEY missing (primary + backup)",
        "scrapecreators",
        false
      );
    }

    const cleanHandle = handle.replace(/^@/, "");

    const [profileJson, postsJson] = await Promise.all([
      callEndpoint("/v1/instagram/profile", cleanHandle),
      callEndpoint("/v2/instagram/user/posts", cleanHandle),
    ]);

    const user = extractUserObject(profileJson);
    if (!user) {
      throw new ScraperError(
        "scrapecreators profile empty",
        "scrapecreators",
        true
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user as any;

    const bio: string | null = u.biography ?? u.bio ?? null;
    const avatarUrl: string | null =
      u.profile_pic_url_hd ??
      u.profile_pic_url ??
      u.profilePicUrl ??
      null;

    const followers: number | null =
      u.edge_followed_by?.count ??
      u.follower_count ??
      u.followersCount ??
      null;
    const following: number | null =
      u.edge_follow?.count ??
      u.following_count ??
      u.followsCount ??
      null;
    const name: string | null = u.full_name ?? u.fullName ?? u.name ?? null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pj = postsJson as any;
    const items: unknown[] = pj?.items ?? pj?.data?.items ?? [];
    const recentPosts: RecentPost[] = items.slice(0, 20).map((p) => mapPost(p));

    return {
      handle: cleanHandle,
      platform: "instagram",
      name,
      bio,
      avatarUrl,
      followers,
      following,
      niche: inferNiche(bio),
      recentPosts,
      partial: false,
    };
  }
}
