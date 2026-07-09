import type { MetadataRoute } from "next";
import { SITE } from "@/components/dark/icon-meta";

/**
 * Sitemap. Iconimate is a single-page gallery, so we list the real routes only
 * (homepage, docs, and the comparison page). The 147 icons stay on `/` and are
 * made machine-readable through the ItemList JSON-LD in components/seo, not
 * through 147 separate URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${SITE}/compare/iconimate-vs-lucide-animated`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
