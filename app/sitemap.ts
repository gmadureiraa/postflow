import type { MetadataRoute } from "next";

const BASE_URL = "https://postflow.app";

const blogSlugs = [
  "como-criar-carrosseis-virais-instagram-2026",
  "5-formatos-carrossel-mais-engajamento",
  "thread-vs-carrossel-qual-funciona-melhor",
  "como-usar-ia-criar-conteudo-redes-sociais",
  "guia-completo-tamanhos-instagram-twitter-linkedin",
];

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
    ...blogEntries,
  ];
}
