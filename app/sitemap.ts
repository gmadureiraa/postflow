import type { MetadataRoute } from "next";
import { POSTS_META } from "@/lib/blog-posts-meta";

const BASE_URL = "https://viral.kaleidos.com.br";

/**
 * Sitemap SEO-friendly.
 *
 * Importante: `lastModified` para páginas estáveis usa data fixa (não
 * `new Date()`), porque Google desconfia de sitemaps com lastmod sempre
 * "agora" — sinaliza spam de churn artificial. Mudamos pra:
 *  - Posts: usam a `date` do próprio post (do `POSTS_META`).
 *  - Páginas estáticas legais (privacy/terms): data canônica de revisão.
 *  - Home/blog/roadmap: data do build (única "fresh" justificável).
 */
const SITE_REVISION_DATE = new Date("2026-04-23");
const LEGAL_REVISION_DATE = new Date("2026-04-15");

function isoToDate(iso: string): Date {
  // POSTS_META usa AAAA-MM-DD — UTC normalizado.
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = POSTS_META.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: isoToDate(p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: SITE_REVISION_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: SITE_REVISION_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: LEGAL_REVISION_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: LEGAL_REVISION_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: SITE_REVISION_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      // Rota obrigatoria Meta App Review — user pode chegar via Facebook.
      url: `${BASE_URL}/account/data-deletion`,
      lastModified: LEGAL_REVISION_DATE,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    ...blogEntries,
  ];
}
