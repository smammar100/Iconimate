import { SITE, SITE_NAME, SITE_DESCRIPTION, KEY_FACTS, FAQ, ICON_COUNT, REPO_URL } from "@/lib/seo";

/**
 * /llms.txt — a compact, machine-first summary for AI crawlers and assistants,
 * following the emerging llms.txt convention. Built from the same facts source
 * as the on-page content and JSON-LD so the three never disagree.
 *
 * LINKS MUST BE MARKDOWN LINKS — `- [Name](url): description`, the shape
 * llms.txt specifies. They were previously plain `- Name: url` lines, which
 * read fine to a human but parse as prose: an agentic-browsing audit reported
 * "File does not appear to contain any links" against a file whose whole
 * purpose is to hand an assistant the URLs. Keep the bracket form.
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
- Distribution: shadcn registry, per-icon AI prompt (Copy AI prompt on any icon)
- Animation model: spring physics with anticipation and settle frames, on hover and keyboard focus

## Links
- [Homepage](${SITE}/): The full gallery — hover or focus any icon to play its animation.
- [Docs](${SITE}/docs): Install, props, the imperative startAnimation/stopAnimation handle, and reduced-motion behaviour.
- [Registry index](${SITE}/r/registry.json): Every installable item with a meta.version content hash — fetch this to check whether an already-installed copy is behind.
- [Single-icon deep link](${SITE}/?icon=bell): Example of linking straight to one icon.
- [Iconimate vs other animated React icons](${SITE}/compare/iconimate-vs-lucide-animated): How the Phosphor 256 grid differs from the Lucide 24px grid.
- [Source on GitHub](${REPO_URL}): MIT licensed, issues and contributions welcome.

## Installing
Each icon installs on its own through the shadcn CLI, for example:
\`npx shadcn@latest add ${SITE}/r/bell.json\`
Swap \`bell\` for any icon's slug. The command copies a single self-contained
component into the project, so it does NOT update itself later — re-run it to
pull a newer version, and compare against the version stamp in the installed
file's header or in [the registry index](${SITE}/r/registry.json).

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
