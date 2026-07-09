import type { MetadataRoute } from "next";
import { SITE } from "@/components/dark/icon-meta";

/**
 * robots.txt. Everything is public, and we explicitly welcome the major AI
 * crawlers so Iconimate stays eligible for citations in AI answers. The lab
 * and capture routes are internal tooling, so they are kept out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/lab/", "/capture/"] },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/lab/", "/capture/"],
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
