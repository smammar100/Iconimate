# Plan 014 (outline): Shareable `?q=` search + wire the palette digit-select

> Outline produced by the plan 013 spike. Promote to a full plan (using the template) before
> executing. Full rationale + canonical analysis: `docs/design/linkable-search.md`.

## Status

- **Priority**: P3
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: 007 (the `?icon=` URL-reading pattern this reuses)
- **Category**: direction / seo
- **Planned at**: (fill when promoted)

## Why

The ⌘K palette (`components/dark/command-palette.tsx`) search is ephemeral client state — not
shareable or crawlable — despite the project's heavy SEO/AI-consumption investment. This is **Phase 1**
of the linkable-search design (option a: query-only, canonical stays `/`). Phase 2 (`/icons/<slug>`
landing pages) is deliberately deferred — see the design doc.

## Scope

- `components/dark/command-palette.tsx`: seed `query` from `?q=` when the palette opens;
  `history.replaceState` the current query on change (not push); clear `?q=` on close. Wire `1`–`9`
  in `onKeyDown` to select+copy `flat[n-1]` (the digit badges at `:213` currently do nothing).
- `app/page.tsx`: on mount, if `?q=` is present, auto-open the palette pre-filtered (reuse the
  `URLSearchParams(window.location.search)` pattern from plan 007 — no `useSearchParams`, no Suspense
  boundary).

**Out of scope**: `/icons/<slug>` routes (Phase 2); changing plan 007's `?icon=` behavior; canonical
stays `/`.

## Verify

- `/?q=bell` opens the palette pre-filtered to "bell"; typing updates the URL (a shared link
  reproduces the search).
- Pressing `3` selects + copies the 3rd result.
- Canonical still `/` (no duplicate-content surface added).
- `pnpm verify` + `pnpm build` exit 0.

## STOP conditions

- Reflecting the query into the URL forces a `useSearchParams`/Suspense refactor that changes the page
  architecture — report; the design assumes the 007 `URLSearchParams` pattern avoids this.
