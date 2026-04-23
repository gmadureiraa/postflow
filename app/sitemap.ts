import type { MetadataRoute } from "next";
import { POSTS_META } from "@/lib/blog-posts-meta";

const BASE_URL = "https://viral.kaleidos.com.br";

// Lista canonica de posts vem de lib/blog-posts-meta.ts
const blogSlugs = POSTS_META.map((p) => p.slug);

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      // Rota obrigatoria Meta App Review — user pode chegar via Facebook.
      url: `${BASE_URL}/account/data-deletion`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
    ...blogEntries,
  ];
}
