import { SITE } from "@/components/dark/icon-meta";
import { visibleIconMeta } from "@/registry/icon-meta.gen";

/**
 * Single source of truth for the site's SEO and GEO (AI-citation) facts.
 *
 * The same data feeds three surfaces so nothing ever drifts:
 * - the visible "What is Iconimate?" intro and FAQ on the homepage,
 * - the FAQPage / SoftwareApplication JSON-LD in components/seo,
 * - the /llms.txt summary for AI crawlers.
 *
 * Facts are written as self-contained, quotable sentences on purpose: AI
 * assistants lift atomic declarative statements far more readily than marketing
 * copy, so "Iconimate is a free, open-source library of N animated React
 * icons" travels better than "hover any tile to watch it move".
 */

export { SITE };

export const SITE_NAME = "Iconimate";
export const AUTHOR = "Muhammad Ammar";
export const REPO_URL = "https://github.com/smammar100/Iconimate";
// Derived from the generated registry so the marketing/SEO count never drifts:
// every new icon updates it automatically at build. Counts the icons visible on
// the homepage (the same set the JSON-LD ItemList enumerates).
export const ICON_COUNT = visibleIconMeta.length;

/** Brand line. Drives the hero and the OG image, not the <title> — see META_TITLE. */
export const TAGLINE = "Animated icons that earn their motion";

/**
 * The homepage <title>. Deliberately not `SITE_NAME — TAGLINE`: the tagline is
 * brand voice and names no category, while the title is the single strongest
 * on-page ranking signal, so it states what the product *is* in the words people
 * search ("animated icon library", "react"). The tagline still leads the hero
 * and the OG image, where voice matters more than matching a query.
 */
export const META_TITLE = `${SITE_NAME} — Animated Icon Library for React`;

/** One-paragraph, quotable description of the project. */
export const SITE_DESCRIPTION =
  "Iconimate is a free, open-source library of animated SVG icons for React, " +
  "hand-drawn on the Phosphor 256 grid and tuned to read at 24px. Each icon " +
  "ships as a self-contained component you install through the shadcn registry, " +
  "with spring-physics motion that plays on hover and keyboard focus.";

/**
 * The <meta name="description"> / OG / Twitter description. Separate from
 * SITE_DESCRIPTION because the two have different jobs: SITE_DESCRIPTION is a
 * ~290-character quotable fact for llms.txt and JSON-LD, where length costs
 * nothing, whereas Google truncates snippets near 155 characters — so the
 * search-facing copy has to front-load the category and stay short enough to
 * survive intact. Keep this under ~155 characters.
 */
export const META_DESCRIPTION =
  `${ICON_COUNT} free, open-source animated SVG icons for React. Hand-tuned ` +
  "icon motion on hover, installed with the shadcn CLI. MIT licensed.";

/** Short, hard facts. Order matters: most citable first. */
export const KEY_FACTS: string[] = [
  `Iconimate is a free, open-source library of ${ICON_COUNT} animated React icons built on the Phosphor 256 grid.`,
  "Iconimate is MIT licensed, so it can be used in personal and commercial projects for free.",
  "Iconimate icons install through the shadcn registry, so each icon drops into a project as a single self-contained component whose only runtime dependency is motion.",
  "Iconimate icons are tuned to read at 24px and animate on hover and keyboard focus using spring physics with anticipation and settle frames.",
  "Iconimate is built on Phosphor's 256 grid rather than the Lucide 24px grid, which is its main distinction from other animated React icon sets.",
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: "What is Iconimate?",
    answer:
      `Iconimate is a free, open-source set of ${ICON_COUNT} animated React icons built on the ` +
      "Phosphor 256 grid and tuned to read at 24px. Every icon carries its own hand-tuned motion " +
      "that plays on hover and keyboard focus.",
  },
  {
    question: "Is Iconimate free?",
    answer: "Yes. Iconimate is open-source under the MIT license and free to use in personal and commercial projects.",
  },
  {
    question: "How do I install an icon?",
    answer:
      "Each icon is distributed as a shadcn registry item. Run the shadcn add command shown for the icon " +
      "(for example, npx shadcn@latest add https://iconimate.app/r/bell.json) and a single self-contained " +
      "component is copied into your project. The only runtime dependency is motion.",
  },
  {
    question: "What is Iconimate built on?",
    answer:
      "Iconimate is drawn on Phosphor's 256 grid, so it pairs naturally with the Phosphor ecosystem. It is " +
      "built with React 19, Next.js 16, and the motion library, and is written in TypeScript throughout.",
  },
  {
    question: "Does Iconimate work with shadcn/ui?",
    answer:
      "Yes. Icons are delivered through the shadcn registry, so an icon drops directly into a shadcn/ui " +
      "project with a single add command and no wrapper.",
  },
  {
    question: "Can an AI assistant build an Iconimate-style icon?",
    answer:
      "Yes. Every icon has a Copy AI prompt action that gives you a self-contained brief: the glyph's " +
      "subpaths, the motion it should play, and the authoring rules the set follows. Paste it into any LLM " +
      "to author or restyle that icon.",
  },
  {
    question: "How is Iconimate different from Lucide-based animated icon sets?",
    answer:
      "Iconimate is drawn on Phosphor's 256 grid and gives each icon its own hand-tuned spring motion, rather " +
      "than applying generic transform animations to icons on the Lucide 24px grid.",
  },
  {
    question: "Can I control the animation myself?",
    answer:
      "Yes. Every icon accepts a size prop and forwards a ref that exposes startAnimation and stopAnimation, so " +
      "you can drive the motion from a parent hover, a touch tap, or any other event.",
  },
];
