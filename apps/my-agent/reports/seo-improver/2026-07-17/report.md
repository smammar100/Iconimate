# SEO Improver — iconimate.app — 2026-07-17 (Baseline Run)

**Property:** `sc-domain:iconimate.app` (confirmed via Search Console API, access level: `siteRestrictedUser`)
**Tracked keywords:** not preset — derived from the domain's own Search Console query data (see Blockers: DataForSEO's ranked-keywords endpoint, the intended derivation source, is unauthorized this run).
**Locale/device:** United States, all devices (GSC); the only two queries on record split 1 mobile / 1 desktop.
**Date range pulled:** 2025-03-17 → 2026-07-16 (max available GSC window — result was identical to the trailing 90 days, confirming no earlier history).

This is the **baseline run** — no prior report exists under `reports/seo-improver/`, so there is nothing to diff against yet. Everything below establishes the starting point for next week.

## 1. Executive summary

**iconimate.app currently has almost no organic visibility to measure.** Across the entire lifetime of the property, Search Console recorded exactly **2 queries, 8 total impressions, 0 clicks**, both at positions far outside page 1 (52 and 88.5). The sitemap lists only **3 URLs** (home, `/docs`, one `/compare` page), and the homepage's 161-icon gallery — the site's only real content depth — has **zero individual, indexable icon pages**; every icon links straight out to `v0.dev` instead of to an internal page Google could rank.

**The single most important action:** ship individual per-icon landing pages (e.g. `/icons/acorn`) for the 161 icons already in the gallery. This is a structural/indexation fix, not a copy tweak — it's the difference between a 3-page site and a 160+ page site that can absorb long-tail "[icon name] icon svg/react" queries, which is exactly how comparable icon libraries (Lucide, Tabler, Phosphor, Heroicons) built their organic footprint.

Everything else in this report (title/meta fixes, the comparison-page playbook) is worth doing, but won't move the needle much while the site has only 3 crawlable pages and near-zero impressions.

## 2. Movement since last run

Not applicable — baseline run, no prior data. Recorded now for next week's diff:

| Query | Position | Impressions | Clicks | Page |
|---|---|---|---|---|
| iconater | 88.5 (mobile) | 2 | 0 | https://iconimate.app/ |
| ikonate | 52 (desktop) | 2 | 0 | https://iconimate.app/ |

Notes on these two:
- **"ikonate"** is not a variant of the site's own brand — it's the name of an unrelated, pre-existing SVG icon library. The impression at position 52 is almost certainly Google loosely matching on text/topic similarity, not a real ranking opportunity for iconimate.app to chase.
- **"iconater"** looks like an accidental/typo query with a single stray impression at a very weak position (88.5). Neither query is a meaningful signal of product-market search demand; treat both as noise, not a target.
- No query for the brand term **"iconimate"** itself appears yet in Search Console, which for a live, indexed site this age would normally be the first query to show impressions. Worth checking again next week — if it's still absent, that points to an indexation lag rather than a demand problem.

## 3. Did last week's changes work?

No prior run exists, so there are no prior recommendations to verify. This section will be populated starting next week.

## 4. This week's improvements

Ranked by realistic upside given the current state (near-zero visibility, 3 pages). IDs are stable for next week's follow-up.

### SEO-STRUCT-001 — Ship individual per-icon pages (highest leverage)
- **Evidence:** The homepage renders all 161 icons in one gallery; every icon's only outbound link is `https://v0.dev/chat/api/open?url=...&lt;slug&gt;.json` (confirmed via source inspection). There is **no internal route per icon** — `/icon/acorn`, `/icons/acorn`, and `/icons` all return `404`; only the machine-readable registry file `/r/acorn.json` (`200`) exists. The sitemap confirms only 3 pages are offered to crawlers at all.
- **Change:** Create a real page per icon, e.g. `/icons/acorn`, with a unique `<title>` ("Acorn icon — animated SVG icon for React · Iconimate"), a unique meta description naming the icon and the install command, an `<h1>` with the icon name, the live/hover preview, the exact `npx shadcn@latest add https://iconimate.app/r/acorn.json` snippet, and 2–3 internal links (back to `/docs`, to 2–3 visually/semantically related icons). Add all 161 URLs to `sitemap.xml`.
- **Target:** long-tail queries of the shape "[icon name] icon react", "[icon name] svg icon animated", "[icon name] shadcn icon" — 161 pages' worth, each low-competition individually.
- **Expected effect:** This is the foundational fix; it turns a 3-page site into a 160+ page site with unique, specific content Google can index and match to specific searches. Expect this to take a few weeks to be crawled/indexed before any position data shows up — track indexation count in `sitemap.xml` submissions and the `page` dimension in GSC as the leading indicator, ahead of clicks.

### SEO-META-002 — Trim the homepage meta description to avoid truncation
- **Evidence:** The live homepage description tag is 290 characters: <cite index="1-1">Iconimate is a free, open-source library of animated SVG icons for React, hand-drawn on the Phosphor 256 grid and tuned to read at 24px.</cite> Google typically truncates snippets around ~155–160 characters on desktop, so the back half of this sentence is being cut off in any SERP appearance today.
- **Change:** Shorten to ≤155 characters, front-loading the distinguishing claim, e.g.: `Iconimate — 161 free, open-source animated SVG icons for React. Install via the shadcn CLI, tuned to the Phosphor 256 grid, MIT licensed.` (143 characters.)
- **Target:** `https://iconimate.app/` — brand and category queries ("animated icon library react", "shadcn animated icons").
- **Expected effect:** Full, un-truncated snippet once the page starts earning impressions; won't change position, but protects CTR as impressions grow from SEO-STRUCT-001.

### SEO-CONTENT-003 — Extend the `/compare/` pattern to more competitors
- **Evidence:** The one existing comparison page, `/compare/iconimate-vs-lucide-animated`, is well-built: it has a clear head-to-head table and dedicated sections — <cite index="1-1">The grid is the real difference</cite> and <cite index="1-1">Motion authored per icon, not applied uniformly</cite> — at ~2,300 words, more depth than either the homepage or docs page per topic. This is a proven comparison-content template that only exists once.
- **Change:** Reuse the same template for the other animated/general icon libraries developers actually compare against (e.g. Heroicons, Tabler Icons, Phosphor Icons, React Icons animated variants) — `/compare/iconimate-vs-heroicons`, `/compare/iconimate-vs-tabler-icons`, etc. Link every new page from `/docs` and the homepage footer, and add them to the sitemap.
- **Target:** "[competitor] vs animated icons", "[competitor] alternative", "animated version of [competitor]" query patterns.
- **Expected effect:** Low-competition, high-intent developer queries; this is a cheap page-count and long-tail-coverage win once SEO-STRUCT-001 is underway.

### SEO-DOCS-004 — Give `/docs` a keyword-bearing title instead of a bare label
- **Evidence:** The live title tag for the docs page is just `<title>Docs · Iconimate</title>` — 16 characters, no descriptive keywords, while the page itself is substantive (Install/Use/Control animation/TypeScript/Reduced motion sections, ~2,200 words).
- **Change:** Retitle to something like `Install Iconimate — React animated icon docs (shadcn, TypeScript, v0)` and keep the description as-is (157 characters, already well-sized).
- **Target:** "install animated icons react", "shadcn animated icon component" style queries.
- **Expected effect:** Marginal but free — the content already supports the keyword, only the title tag doesn't reflect it.

## 5. Blockers and data caveats

- **DataForSEO connection is fully unauthorized this run.** All three available tools — `dataforseo_labs_google_ranked_keywords`, `dataforseo_labs_google_domain_intersection`, and `serp_organic_live_advanced` — returned `HTTP 403` on every call, including plain keyword lookups with no domain-specific parameters. This blocks the entire competitive layer for this run:
  - No live-SERP visibility into who ranks above iconimate.app for any keyword.
  - No search volume or SERP-feature data — `rankings.csv` marks these fields `unavailable (DataForSEO 403)` rather than fabricating numbers.
  - No domain-level "own ranked keywords" pull, which is the method this loop normally uses to derive tracked keywords when none are configured — this run derived tracked keywords from GSC's own query list instead (only 2 rows existed).
  - **Action needed before next run:** re-verify/refresh the DataForSEO API credentials on this connection. Until that's resolved, striking-distance sizing, cannibalization checks against competitor pages, and "who's beating us and why" analysis cannot be done with real data.
- **Search Console history is extremely thin.** Only 2 queries and 1 page have ever recorded impressions, over the full available 16-month window. This is consistent with a very recently launched and/or thinly indexed site rather than a reporting error — the 90-day and 16-month pulls returned identical results.
- **No blog repo is configured**, so this run is report-only; none of the above changes were applied to any repository. If a GitHub blog/docs repo is wired up, SEO-STRUCT-001 (icon pages) and SEO-DOCS-004 (title tag) are the most mechanically ready to turn into a PR.
- On-page inspection (titles, meta tags, headings, internal links, HTTP status, sitemap, robots.txt) was done directly via `curl` against the live site, which is why those findings are stated with confidence despite the DataForSEO outage — they don't depend on that connection.
