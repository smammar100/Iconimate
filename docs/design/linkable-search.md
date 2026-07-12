# Design spike: linkable search & per-icon surfaces

> Deliverable of plan 013 (`/improve` audit, DIR-3). Decides the route/canonical shape for making
> Iconimate's search shareable/crawlable **before** committing to a build. No production UX ships from
> this doc.

## Problem

Iconimate invests in SEO/AI-consumption — JSON-LD `ItemList`, `/llms.txt`, a Lucide comparison page —
but its search (the ⌘K command palette, `components/dark/command-palette.tsx`) is **ephemeral client
state**: the `query` is a `useState("")` with no URL reflection, so a search can't be shared, linked,
or crawled. Plan 007 made `/?icon=<slug>` deep links functional (scroll + play, canonical `/`). The
open question: should search become linkable, and should each icon get a real indexable landing page?

## Investigation findings (current state, commit `4020790`)

- **Search**: `command-palette.tsx` filters `visibleIconMeta` (slug/name/keywords) entirely
  client-side; `query` is local state, no URL. `Suspense` is already imported but unused for URL state.
- **Deep links (post-007)**: `app/page.tsx` reads `?icon=<slug>` via
  `new URLSearchParams(window.location.search)` in a mount effect (deliberately NOT `useSearchParams`,
  so there's **no Suspense/prerender caveat**) and scrolls+plays the card. Canonical stays `/`.
- **Sitemap**: `app/sitemap.ts` lists **only 3 routes** (`/`, `/docs`, `/compare/...`). Its comment
  states the single-page philosophy explicitly: "The 147 icons stay on `/` and are made
  machine-readable through the ItemList JSON-LD … not through 147 separate URLs."
- **Per-icon routes**: none. No `/icons/<slug>`. No per-icon metadata/OG.
- **JSON-LD**: `components/seo/structured-data.tsx` emits `ItemList` with `url: ${SITE}/?icon=<slug>`
  per icon (150 entries). `numberOfItems` already uses the live `visibleIconMeta.length`.
- **`/llms.txt`**: `app/llms.txt/route.ts`, a static GET, advertises `/?icon=bell` as a deep link.
- **Cosmetic bug**: `command-palette.tsx:213` renders `{i < 9 && <span className="dc-kbd-mini">{i +
  1}</span>}` — 1–9 badges on the first rows that suggest a quick-select shortcut the key handler
  (`onKeyDown`, Arrow/Enter/Escape/Tab only) never implements.

## Answers to the investigation questions

### 1. `?q=` search state (shareable search)

**Recommended UX**: landing on `/?q=<term>` **auto-opens the palette pre-filtered** to `<term>`
(the palette is already the search surface; a second filtered-grid mode would duplicate it). While
the palette is open, reflect the current query into the URL with `history.replaceState` (not `push`,
so back-button isn't polluted per keystroke). Closing the palette clears `?q=`.

**Feasibility: HIGH — already proven.** Plan 007 reads the URL with `URLSearchParams` in a client
effect with no Suspense issue; the same pattern applies: on the palette's open effect, seed `query`
from `?q=`; in the existing `onChange`, `history.replaceState` the new value. This is a ~15-line
addition to `command-palette.tsx` + a mount check in `app/page.tsx` to auto-open when `?q=` is
present. No page-architecture change, no `useSearchParams`, no new Suspense boundary. (A throwaway
prototype branch was deemed unnecessary — 007's shipped code is the feasibility proof.)

### 2. Per-icon canonical — two options

- **(a) Query-only** — everything stays on `/` with `?icon=` / `?q=`; canonical is always `/`.
  - *Pros*: zero duplicate-content risk; no new surface; builds directly on 007; keeps the documented
    single-page philosophy intact. *Cons*: no per-icon **indexable** landing page — search engines
    still only rank `/`.
- **(b) Real `/icons/<slug>` routes** — statically prerendered from `visibleIconMeta`, each with its
  own `canonical: /icons/<slug>`, per-icon `<title>`/description/OG image, and a focused view of that
  icon.
  - *Pros*: ~150 indexable landing pages, each targeting "animated `<name>` icon react" — the real
    SEO upside the JSON-LD is a weaker proxy for. *Cons*: reverses the documented single-page
    philosophy; new surface to maintain; the JSON-LD `ItemList` URLs move from `/?icon=` to
    `/icons/<slug>`; sitemap grows from 3 → ~153; needs per-icon metadata + (ideally) generated OG
    images; canonical must be gotten exactly right to avoid `/` vs `/icons/<slug>` competing.

### 3. Consistency with existing SEO surfaces (if option b)

- `structured-data.tsx`: `ItemList` item `url` → `${SITE}/icons/${slug}` (from `/?icon=`).
- `app/sitemap.ts`: add a `visibleIconMeta.map` producing `${SITE}/icons/${slug}` entries (priority
  ~0.6, monthly) — and update its comment (the single-page rationale no longer holds).
- `app/llms.txt/route.ts`: advertise `/icons/<slug>` as the canonical deep link.
- `/?icon=<slug>` on `/` should **remain** as the homepage in-grid scroll/play (still useful), but is
  no longer the canonical per-icon URL — `/icons/<slug>` is.

### 4. Cost / recommendation

| Option | Effort | Risk |
|--------|--------|------|
| (a) `?q=` shareable search, canonical `/` | **S–M** | LOW |
| (b) `/icons/<slug>` landing pages | **L** | MED (canonical + SEO-surface migration) |

**Recommendation: phased.**
- **Phase 1 (build — worth it): option (a).** Shareable `?q=` search is cheap, low-risk, builds on
  007, and delivers immediate value (linkable searches, better AI-assistant navigability). Fold in
  the digit-badge fix (Q5). This is the `plans/014` outline below.
- **Phase 2 (defer / decide separately): option (b).** The per-icon-landing-page SEO upside is real
  but it's a strategic reversal of the documented single-page approach and an L-effort surface with a
  canonical-migration risk. Worth doing **only** if the team commits to per-icon SEO as a growth bet;
  keep it a separate, deliberate decision rather than bundling it with the cheap search win.

### 5. Cosmetic cleanup to fold into the build

The palette's 1–9 digit badges (`command-palette.tsx:213`) advertise a quick-select that doesn't
exist. In the Phase 1 build, **either** wire digit keys (`1`–`9` → select+copy the matching row in
`onKeyDown`) **or** remove the badge. Recommend wiring them (the affordance is good) — it's a small
branch in the existing `onKeyDown`.

## Canonical strategy (no unresolved duplicate-content risk)

- Phase 1: `?q=` and `?icon=` are query params on `/`; canonical stays `/` (already set via
  `metadata.alternates.canonical = "/"`). Query params do not mint new canonical URLs → no duplicate
  content. ✅
- Phase 2 (if pursued): each `/icons/<slug>` sets its own `canonical: /icons/<slug>`; `/?icon=` stays
  canonical-`/` (an in-page action, not a document). The two never compete because their canonicals
  differ and each is self-referential.

## Recommendation summary

**Build Phase 1** (`?q=` shareable search + digit-key fix) as `plans/014`. **Defer Phase 2**
(`/icons/<slug>` landing pages) to an explicit strategy decision. Feasibility of Phase 1 is proven by
plan 007's shipped URL-reading pattern.

---

## `plans/014` outline (Phase 1 build — if approved)

**Title**: Shareable `?q=` search + wire the palette digit-select
**Scope**: `components/dark/command-palette.tsx` (seed `query` from `?q=` on open; `replaceState` on
change; wire `1`–`9` in `onKeyDown` to select+copy `flat[n-1]`), `app/page.tsx` (auto-open the palette
on mount when `?q=` is present). Canonical unchanged (`/`).
**Out of scope**: `/icons/<slug>` routes (Phase 2); changing `?icon=` behavior.
**Verify**: `/?q=bell` opens the palette pre-filtered; typing updates the URL (shareable); pressing
`3` selects+copies the 3rd result; `pnpm verify` + `pnpm build` green; canonical still `/`.
**Effort**: S–M. **Risk**: LOW.
