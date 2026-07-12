# Plan 013: (Spike) Design linkable `?q=` search + per-icon canonical surfaces

> **Executor instructions**: This is a **design/spike** plan, not a build-everything plan. Investigate,
> prototype minimally, and produce a design doc + a follow-up build plan. Do NOT ship a full feature.
> Update the row in `plans/README.md` when the design doc is written.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/page.tsx components/dark/command-palette.tsx components/seo/structured-data.tsx app/llms.txt`

## Status

- **Priority**: P3
- **Effort**: M (spike — investigate + prototype + document; coarse estimate)
- **Risk**: LOW
- **Depends on**: 007 (the `?icon=` reader it builds on)
- **Category**: direction
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The project invests heavily in SEO/AI-consumption (JSON-LD `ItemList`, `/llms.txt`, a Lucide
comparison page) but its search — the ⌘K command palette — is **ephemeral client state**: results
aren't linkable or crawlable. A shareable `?q=<term>` search surface and per-icon canonical routes
would turn ~150 icons into indexable landing pages feeding exactly that strategy. The search index
(`visibleIconMeta`: slug/name/keywords) already exists; plan 007 adds the `?icon=` reader. This spike
decides the route/canonical shape and open questions **before** committing to a build, so the team can
weigh it against the duplicate-content risk plan 007 deliberately avoids.

## Current state

- `components/dark/command-palette.tsx` — the ⌘K palette; filters `visibleIconMeta` by name/slug/
  keywords, entirely client-side, no URL state.
- `app/page.tsx` — after plan 007, reads `?icon=<slug>` and scrolls/plays the matching card; canonical
  stays `/`.
- `components/seo/structured-data.tsx:36-41` — JSON-LD `ItemList` advertising `/?icon=<slug>` per icon.
- `app/llms.txt/route.ts` — advertises deep links; a static GET route.
- `lib/seo.ts` — SEO facts, `ICON_COUNT`, FAQ. The single source for SEO copy.
- Constraint from plan 007: canonical is `/` to avoid duplicate content. Any per-icon route this spike
  proposes must resolve the canonical story (a real `/icons/<slug>` route with its own canonical, vs.
  a query param that stays canonical-`/`).

## Scope

**In scope** (spike deliverables):
- A design doc at `docs/design/linkable-search.md` (create the `docs/design/` dir) covering the
  decisions below.
- A **minimal** throwaway prototype (behind a branch, not merged into the shipped UX) proving the
  hardest unknown — e.g. hydrating the palette from `?q=` and reflecting typing back into the URL —
  enough to estimate the build honestly.
- A follow-up build plan stub (`plans/014-...` outline) if the spike concludes it's worth building.

**Out of scope**:
- Shipping the feature. No production UX change lands from this plan.
- Re-doing plan 007's `?icon=` reader.

## Investigation questions the design doc must answer

1. **`?q=` search state**: hydrate the ⌘K palette from `?q=<term>` on load, and reflect the current
   query into the URL (replaceState) so a search is shareable. What's the UX when landing on `/?q=bell`
   — palette auto-open? A filtered grid? Both?
2. **Per-icon canonical**: two options —
   - (a) keep everything on `/` with query params (`?icon=`/`?q=`), canonical always `/` — simplest,
     zero duplicate-content risk, but no per-icon indexable page.
   - (b) add real `/icons/<slug>` routes (static, prerendered from `visibleIconMeta`) with their own
     canonical + per-icon metadata/OG — 150 indexable landing pages, but new surface to maintain and a
     canonical strategy to get right. Evaluate the SEO upside vs. maintenance cost; note the JSON-LD
     URLs would move from `/?icon=` to `/icons/<slug>`.
3. **Consistency with the existing SEO surfaces**: if (b), how do `structured-data.tsx`, `/llms.txt`,
   and the sitemap change? Is there a sitemap today (`app/sitemap.*`)? — investigate and record.
4. **Cost**: rough effort for each option, and a recommendation.
5. **Cosmetic cleanup to fold into the build**: the palette's 1-9 digit badges
   (`components/dark/command-palette.tsx:213`) render but do nothing — the build plan should wire or
   remove them.

## Steps

### Step 1: Investigate

Read the palette, `app/page.tsx` (post-007), the SEO surfaces, and check for an existing sitemap and
per-icon metadata. Record findings.

### Step 2: Prototype the riskiest unknown

On a throwaway branch, wire `?q=` ↔ palette state minimally. Confirm it's feasible with the App Router
client-component setup (Suspense/`useSearchParams` caveats) without a page-architecture change.

**Verify**: the prototype demonstrates `/?q=bell` opening the palette pre-filtered, and typing
updating the URL — enough to estimate the build. It does NOT need to be production-quality.

### Step 3: Write the design doc + build-plan outline

Produce `docs/design/linkable-search.md` answering all investigation questions with a recommendation
(option a vs b), the route/canonical shape, the SEO-surface changes required, open questions, and a
coarse effort estimate. If recommended, outline `plans/014-linkable-search-build.md`.

**Verify**: the doc answers every numbered investigation question and ends with a clear
build/don't-build recommendation.

## Done criteria

- [ ] `docs/design/linkable-search.md` exists and answers all investigation questions.
- [ ] The doc states a recommendation (query-only vs real per-icon routes) with rationale + effort.
- [ ] The doc defines the canonical strategy (no unresolved duplicate-content risk).
- [ ] A throwaway prototype validated the `?q=` ↔ palette feasibility (documented, not merged).
- [ ] If build is recommended, a `plans/014-...` outline exists.
- [ ] `plans/README.md` row for 013 updated.

## STOP conditions

- The prototype reveals the App Router setup makes `?q=` ↔ palette state infeasible without a large
  architecture change — document that finding; it changes the recommendation.

## Maintenance notes

- This spike's output feeds a future build plan; keep the design doc as the decision record.
- Whatever canonical strategy is chosen must stay consistent with plan 007 (which set canonical `/`)
  and with `structured-data.tsx` / `/llms.txt` URLs — changing one without the others reintroduces the
  duplicate-content problem this whole thread is trying to avoid.
