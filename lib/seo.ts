import { SITE } from "@/components/dark/icon-meta";

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
 * copy, so "Iconimate is a free, open-source library of 147 animated React
 * icons" travels better than "hover any tile to watch it move".
 */

export { SITE };

export const SITE_NAME = "Iconimate";
export const AUTHOR = "Muhammad Ammar";
export const REPO_URL = "https://github.com/smammar100/Iconimate";
export const ICON_COUNT = 147;

export const TAGLINE = "Animated icons that earn their motion";

/** One-paragraph, quotable description of the project. */
export const SITE_DESCRIPTION =
  "Iconimate is a free, open-source library of animated SVG icons for React, " +
  "hand-drawn on the Phosphor 256 grid and tuned to read at 24px. Each icon " +
  "ships as a self-contained component you install through the shadcn registry, " +
  "with spring-physics motion that plays on hover and keyboard focus.";

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
    question: "Does Iconimate work with shadcn/ui and v0?",
    answer:
      "Yes. Icons are delivered through the shadcn registry and every icon has an Open in v0 link, so they " +
      "fit directly into a shadcn/ui project or a v0 workflow.",
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
