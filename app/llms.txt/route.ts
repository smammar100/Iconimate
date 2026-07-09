import { SITE, SITE_NAME, SITE_DESCRIPTION, KEY_FACTS, FAQ, ICON_COUNT } from "@/lib/seo";

/**
 * /llms.txt — a compact, machine-first summary for AI crawlers and assistants,
 * following the emerging llms.txt convention. Built from the same facts source
 * as the on-page content and JSON-LD so the three never disagree.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Key facts
${KEY_FACTS.map((f) => `- ${f}`).join("\n")}

## At a glance
- License: MIT
- Icon count: ${ICON_COUNT} (growing)
- Framework: React 19
- Design grid: Phosphor 256
- Recommended render size: 24px
- Distribution: shadcn registry, Open in v0
- Animation model: spring physics with anticipation and settle frames, on hover and keyboard focus

## Links
- Homepage: ${SITE}/
- Deep link to a single icon: ${SITE}/?icon=bell
- Docs: ${SITE}/docs
- Comparison: ${SITE}/compare/iconimate-vs-lucide-animated
- Registry index: ${SITE}/r/registry.json
- Source: https://github.com/smammar100/Iconimate

## Differentiator
Iconimate is built on Phosphor's 256 grid, not the Lucide 24px grid, which is the main
distinction from other animated React icon sets. Each icon has its own hand-tuned motion
rather than a generic transform applied uniformly across the set.

## FAQ
${FAQ.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n")}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
