import { iconMeta, visibleIconMeta, HOME_HIDDEN_SLUGS } from "@/registry/icon-meta.gen";
import { metaFor } from "@/components/dark/icon-meta";

/**
 * The icon list the homepage renders, resolved from Sanity with the repo as a
 * fallback.
 *
 * Division of authority:
 *   - The REPO decides what can exist. An icon renders only if the generator
 *     emitted it, because the glyph is compiled code — Sanity cannot conjure a
 *     component, so a doc with no matching icon is ignored.
 *   - SANITY decides the words and the shelf: name, motion label, keywords, and
 *     whether an icon appears on the homepage.
 *
 * Resilience is the point of the fallback. The generator still emits
 * icon-meta.gen.ts at build, so if Sanity is unreachable, slow, or returns
 * nothing, the page renders the repo's own values. Sanity failing should cost
 * freshness, never the homepage.
 *
 * Server-side only: `next: { revalidate }` is a no-op in the browser, and this
 * is imported solely by app/page.tsx (a server component). It reads no secrets —
 * the projectId and dataset are public — so it needs no `server-only` guard.
 */

export interface IconView {
  slug: string;
  name: string;
  keywords: string[];
  motion: string;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

/** Studio edits go live within this window, with no deploy. */
export const ICONS_REVALIDATE_SECONDS = 300;

interface SanityIcon {
  slug?: string;
  name?: string;
  motion?: string;
  keywords?: string[] | null;
  homeVisibility?: string;
}

/** The repo's own answer — what the site rendered before Sanity existed. */
function fromRepo(): IconView[] {
  return visibleIconMeta.map((e) => ({
    slug: e.slug,
    name: e.name,
    keywords: e.keywords,
    motion: metaFor(e.slug).motion,
  }));
}

async function fetchFromSanity(): Promise<SanityIcon[] | null> {
  if (!PROJECT_ID || !DATASET) return null;
  const query = `*[_type == "icon"]{slug, name, motion, keywords, homeVisibility}`;
  const url =
    `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { next: { revalidate: ICONS_REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const { result } = (await res.json()) as { result?: SanityIcon[] };
    return Array.isArray(result) && result.length ? result : null;
  } catch {
    return null;
  }
}

export async function getIcons(): Promise<{ icons: IconView[]; source: "sanity" | "repo" }> {
  const docs = await fetchFromSanity();
  if (!docs) return { icons: fromRepo(), source: "repo" };

  const bySlug = new Map(docs.filter((d) => d.slug).map((d) => [d.slug!, d]));

  // Iterate the REPO's order, not Sanity's. The registry order is curated, not
  // alphabetical — "Control Tower" and "Phone Book" deliberately sit beside
  // "Address Book" — and Sanity has no field expressing that, so sorting by any
  // property of the documents would silently reshuffle the gallery. The repo
  // decides sequence and existence; Sanity fills in the words.
  const icons: IconView[] = [];
  for (const base of iconMeta) {
    const doc = bySlug.get(base.slug);
    // Sanity governs the shelf where it has an opinion; without a doc, fall back
    // to the repo's own hidden set.
    const hidden = doc ? doc.homeVisibility === "hidden" : HOME_HIDDEN_SLUGS.has(base.slug);
    if (hidden) continue;

    icons.push({
      slug: base.slug,
      name: doc?.name || base.name,
      keywords: doc?.keywords?.length ? doc.keywords : base.keywords,
      motion: doc?.motion || metaFor(base.slug).motion,
    });
  }

  // Empty would mean every icon was hidden — far likelier a mistake than an
  // intent, so keep the repo's grid rather than ship a blank page.
  if (!icons.length) return { icons: fromRepo(), source: "repo" };

  return { icons, source: "sanity" };
}
