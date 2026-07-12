# Plan 007: Implement `?icon=` deep links (make the advertised URLs real)

> **Executor instructions**: Follow step by step, verify each step, honor STOP conditions, update the
> row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/page.tsx components/seo/structured-data.tsx app/llms.txt`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (unblocks 013)
- **Category**: correctness / seo
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The site's entire single-page SEO strategy hands crawlers and AI assistants ~150 per-icon "deep
links" — but **nothing reads the param**, so every one resolves to the identical plain homepage. The
JSON-LD `ItemList` (whose comment at `components/seo/structured-data.tsx:6-11` calls these deep links
"the linchpin of the single-page SEO plan") and `/llms.txt` both advertise `/?icon=<slug>`; a
repo-wide search for `useSearchParams`/`searchParams`/`URLSearchParams` finds only those two
producers and zero consumers. Result: duplicate content across every advertised URL, and a user
following a deep link lands on the un-focused grid. Making `?icon=` actually scroll to and play the
named icon delivers the feature the schema exists to promise.

## Current state

- `components/seo/structured-data.tsx:36-41` emits, per icon:
  ```tsx
  itemListElement: visibleIcons.map((icon, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Animated ${icon.name} icon`,
    url: `${SITE}/?icon=${icon.slug}`,
  })),
  ```
- `app/llms.txt/route.ts:29` advertises `${SITE}/?icon=bell` as "Deep link to a single icon".
- `app/page.tsx` is a `"use client"` component. The grid renders `DarkIconCard` per icon
  (`app/page.tsx:135-155`); each card is a `DarkIconCard entry={entry}` where `entry.slug` is the
  icon slug. The card exposes its animation via an imperative handle (see
  `components/dark/dark-icon-card.tsx` — it holds a `ref` to the icon's `IconHandle` with
  `startAnimation`/`stopAnimation`).
- `app/page.tsx` already manages refs/state for cards and a command palette; adding a mount effect
  that reads the URL and scrolls/plays fits the existing client-component shape.
- The JSON-LD is injected via `dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}`
  (`structured-data.tsx:53`) — currently safe (static data), but `JSON.stringify` does not escape
  `<`; fold in the cheap hardening here.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Dev server | `pnpm dev` | serves localhost:3000 |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0 |
| Verify | `pnpm verify` (if 001 landed) | exit 0 |

## Suggested executor toolkit

- Use the Next.js App Router `useSearchParams` hook (client component). Because `useSearchParams`
  requires a Suspense boundary in some configs, verify the page builds; if Next complains, wrap the
  reader in a `<Suspense>` or read from `window.location.search` inside the mount effect (this is a
  client component, so `window` is available in `useEffect`).

## Scope

**In scope**:
- `app/page.tsx` — read `?icon=<slug>` on mount; scroll the matching card into view and trigger its
  animation once.
- `components/dark/dark-icon-card.tsx` — only if needed to expose a stable scroll target (e.g. an
  `id={\`icon-${slug}\`}` or forwarding a ref). Prefer adding an `id` attribute to the card wrapper.
- `components/seo/structured-data.tsx` — add the `<`→`<` JSON-LD hardening (defense-in-depth).

**Out of scope**:
- Changing the canonical URL strategy or adding real per-icon routes — keep `/` canonical (that
  design work is plan 013). This plan makes the *existing* advertised param functional, nothing more.
- The command palette (plan 013 territory).
- Changing the JSON-LD shape/URLs — keep `/?icon=<slug>` exactly.

## Git workflow

- Branch: `advisor/007-icon-deep-links`
- Imperative commit subject.

## Steps

### Step 1: Give each card a stable scroll/focus target

In the grid render (`app/page.tsx:135-155`) or in `DarkIconCard`, add `id={\`icon-${entry.slug}\`}`
to the card's outer element so a deep link can find it. If a ref-based approach is cleaner given the
existing card structure, use a `Map<string, HTMLElement>` populated via ref callbacks instead — pick
whichever matches the file's existing patterns.

**Verify**: `pnpm dev`, inspect the DOM — each card wrapper has `id="icon-<slug>"` (or is registered
in the ref map).

### Step 2: Read the param on mount and act

Add a `useEffect` (runs once) in `app/page.tsx` that:
1. Reads `icon` from `useSearchParams()` (or `new URLSearchParams(window.location.search)`).
2. If present and it matches a `visibleIconMeta` slug, scrolls the target card into view
   (`scrollIntoView({ block: "center", behavior: "smooth" })`).
3. Triggers that card's animation once via its imperative handle (the same `startAnimation` the
   hover path uses).
4. Guards against the hero-intro delay and missing/invalid slugs (no-op if the slug isn't found).

Respect the existing LCP/intro sequencing — don't fight the `heroIntro` timing; a short delay before
scrolling is fine.

**Verify**: `pnpm dev`, load `/?icon=bell` (use a slug that exists in `registry/icons/`) → the page
scrolls to the Bell card and it plays its animation once. Load `/?icon=doesnotexist` → no error, page
behaves like plain `/`.

### Step 3: Harden the JSON-LD serialization

In `structured-data.tsx:53`, replace the raw `JSON.stringify(graph)` with a version that escapes `<`
(and `>`, `&`) to unicode escapes so a future dynamic icon name containing `</script>` can't break
out:
```tsx
__html: JSON.stringify(graph).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
```
Output stays valid JSON-LD (these escapes are legal inside JSON strings).

**Verify**: `pnpm dev`, view source — the `<script type="application/ld+json">` still parses as valid
JSON (paste into a JSON validator); no literal `<` remains inside the script body.

## Test plan

- Manual E2E is the primary gate (client-side URL behavior): `/?icon=<existing>` scrolls + plays;
  `/?icon=<missing>` no-ops; plain `/` unchanged.
- If a Playwright harness exists after plan 001, add one spec asserting `/?icon=bell` scrolls the
  `#icon-bell` element into the viewport. Otherwise verify manually.

## Done criteria

- [ ] `/?icon=<slug>` scrolls to and plays the matching icon; invalid/missing slug is a clean no-op.
- [ ] Canonical URL remains `/` (no new route, no redirect); crawl of `/?icon=bell` still reports
      canonical `/`.
- [ ] JSON-LD escapes `<`/`>`/`&`; the script body is valid JSON.
- [ ] `pnpm exec tsc --noEmit` and `pnpm build` exit 0.
- [ ] `plans/README.md` row for 007 updated.

## STOP conditions

- `useSearchParams` forces a Suspense/prerender error that can't be resolved by a `<Suspense>` wrap or
  a `window.location` read — report the exact Next error.
- Scrolling/playing conflicts with the hero-intro animation in a visibly broken way — report; the
  timing needs design input.

## Maintenance notes

- Plan 013 builds on this: it adds a shareable `?q=` search and evaluates real per-icon canonical
  routes. Keep the `?icon=` reader here simple and canonical-`/`.
- If icon names ever become user-supplied/dynamic, the Step 3 hardening becomes load-bearing, not
  just defensive.
- While in `command-palette.tsx` area for 013, consider the cosmetic 1-9 badge that does nothing
  (`components/dark/command-palette.tsx:213`) — wire digit keys or drop the badge.
