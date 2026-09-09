import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/articles-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: `${base}/`, lastModified: new Date() },
    ...getArticles().map((a) => {
      const parsed = new Date(a.date);
      return {
        url: `${base}/article/${a.slug}`,
        lastModified: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
      };
    }),
  ];
}
