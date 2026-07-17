import { NextResponse } from "next/server";
import { visibleIconMeta } from "@/registry/icon-meta.gen";

/**
 * The icon's AI prompt, read from Sanity.
 *
 * This is the site's ONLY read from Sanity, and it is deliberately confined to
 * one field on one route. `aiPrompt` is the one thing Sanity is authoritative
 * for — it exists nowhere in the repo — whereas the grid, ICON_COUNT and the
 * copy button stay build-time or static (/r/*.json) so a Sanity outage can never
 * take the site down. The blast radius of Sanity being unreachable is this route
 * returning 502 and one button showing an error toast.
 *
 * Server-side on purpose: the projectId/dataset never have to be shipped to the
 * browser, and the ISR cache means Sanity sees roughly one request per icon per
 * revalidate window rather than one per visitor. No token is needed — the
 * dataset is public and this reads published content only.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

// Studio edits appear within this window. Prompts change rarely, so 5 minutes
// trades negligible staleness for a near-zero request rate against Sanity.
const REVALIDATE_SECONDS = 300;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  // Validate against the registry rather than passing the path straight into a
  // query: the slug is user-controlled, and this keeps an arbitrary string from
  // ever reaching GROQ.
  if (!visibleIconMeta.some((e) => e.slug === slug)) {
    return NextResponse.json({ error: `unknown icon "${slug}"` }, { status: 404 });
  }

  if (!PROJECT_ID || !DATASET) {
    return NextResponse.json(
      { error: "Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET)" },
      { status: 501 },
    );
  }

  const query = `*[_type == "icon" && slug == $slug][0].aiPrompt`;
  const url =
    `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(query)}` +
    `&$slug=${encodeURIComponent(JSON.stringify(slug))}`;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      return NextResponse.json({ error: `Sanity responded ${res.status}` }, { status: 502 });
    }
    const { result } = (await res.json()) as { result?: string | null };
    if (!result) {
      return NextResponse.json({ error: `no prompt written for "${slug}" yet` }, { status: 404 });
    }
    return NextResponse.json({ slug, prompt: result });
  } catch {
    return NextResponse.json({ error: "could not reach Sanity" }, { status: 502 });
  }
}
