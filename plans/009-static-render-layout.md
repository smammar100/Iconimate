# Plan 009: Static-render the root layout (theme without `await cookies()`)

> **Executor instructions**: Follow step by step, verify each step (including the no-FOUC check in the
> browser), honor STOP conditions, update the row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/layout.tsx app/providers.tsx components/dark/theme-toggle.tsx`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: 001 (verify gate), 008 (theme sync should be pure CSS first)
- **Category**: perf
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

`app/layout.tsx:74` calls `await cookies()` to resolve the saved theme server-side. `cookies()` is a
dynamic API — reading it opts the **entire App Router tree out of static generation**. So a static
icon gallery is served **dynamically on every request**: no full-page CDN caching, TTFB pays a server
render each hit, and the ~150-card SSR HTML is re-serialized per request instead of once at build.
Replacing the server cookie read with an inline pre-hydration `<head>` script (which sets
`data-theme` before first paint) lets the layout prerender statically while preserving the no-flash
behavior the cookie read exists to provide.

## Current state

- `app/layout.tsx:67-95` — `export default async function RootLayout`. It does:
  ```tsx
  const stored = (await cookies()).get("iconimate-theme")?.value;
  const theme = stored === "dark" ? "dark" : "light";
  return (
    <html lang="en" data-theme={theme} data-color-scheme={theme} suppressHydrationWarning ...>
      <body suppressHydrationWarning>
        <AppProvider initialColorScheme={theme}>{children}</AppProvider>
        <StructuredData />
        <Analytics />
      </body>
    </html>
  );
  ```
- The theme is persisted in a cookie named `iconimate-theme` (values `"dark"` / else light). The
  theme toggle (`components/dark/theme-toggle.tsx`) writes this cookie and flips
  `document.documentElement`'s `data-theme` client-side.
- Default is **light** (only an explicit `"dark"` flips it).
- After plan 008, native-control theming is pure CSS `color-scheme` keyed off `data-theme`; no S2
  Provider needs a server-resolved scheme.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Build | `pnpm build` | `/` listed as `○ (Static)` in the route table |
| Dev | `pnpm dev` | serves; toggle theme; hard-reload |
| Verify | `pnpm verify` | exit 0 |

## Scope

**In scope**:
- `app/layout.tsx` — remove `await cookies()`; make `RootLayout` non-async (or keep async without the
  dynamic call); render `<html>` without a server-resolved `data-theme`, and inject an inline blocking
  script in `<head>` that sets `data-theme`/`data-color-scheme` from the cookie/localStorage before
  paint.
- `components/dark/theme-toggle.tsx` — only if it needs to also write `localStorage` for the inline
  script to read (align the storage the toggle writes with what the script reads).

**Out of scope**:
- The toggle's UX/appearance.
- S2 removal (plan 008 — must land first so there's no server-scheme dependency).
- Analytics / StructuredData.

## Git workflow

- Branch: `advisor/009-static-render-layout`
- Imperative commit subject.

## Steps

### Step 1: Author the inline pre-hydration theme script

The script must run **before first paint** (blocking, in `<head>`), read the persisted theme, and set
the attributes on `document.documentElement`. Read from the **same source the toggle writes** — the
`iconimate-theme` cookie (and/or `localStorage`). Example shape (inline via `dangerouslySetInnerHTML`
or a `<script>` child in `<head>`):
```html
<script>
  (function () {
    try {
      var m = document.cookie.match(/(?:^|; )iconimate-theme=([^;]+)/);
      var t = m && decodeURIComponent(m[1]) === "dark" ? "dark" : "light";
      var el = document.documentElement;
      el.setAttribute("data-theme", t);
      el.setAttribute("data-color-scheme", t);
    } catch (e) {}
  })();
</script>
```
Default to light on any error/absence (matches current behavior). This runs before the body paints,
so there's no flash.

**Verify**: the script string escapes correctly (no `</script>` inside it); it sets both attributes.

### Step 2: Remove the dynamic cookie read from the layout

- Delete `const stored = (await cookies()).get(...)` and the `theme` derivation.
- Drop `data-theme`/`data-color-scheme` from the server-rendered `<html>` (the inline script sets them
  before paint), OR keep a static default of `light` on `<html>` and let the script correct to dark
  — pick the option that avoids a flash. Keep `suppressHydrationWarning` on `<html>`/`<body>` since the
  script mutates attributes before React hydrates.
- Remove the `import { cookies } from "next/headers"` import.
- If `AppProvider` no longer needs `initialColorScheme` (post-008 it shouldn't), drop the prop here.
- `RootLayout` can become a non-async function.

**Verify**: `pnpm exec tsc --noEmit` exits 0; `grep -n "cookies" app/layout.tsx` → no match.

### Step 3: Confirm static render + no FOUC

- `pnpm build` → the route table lists `/` (and the lab routes) as `○ (Static)` rather than
  `ƒ (Dynamic)`.
- `pnpm dev`, toggle to dark, then **hard reload** (Ctrl/Cmd+Shift+R): the page paints dark
  immediately with **no white flash**. Repeat toggling to light.

**Verify**: build shows `/` static; no light/dark flash on hard reload in either theme (record a short
screen capture or step-through screenshots).

## Test plan

- No unit tests. Gates: `pnpm build` route table shows `/` static; manual no-FOUC check on hard reload
  in both themes; `pnpm verify` green.

## Done criteria

- [ ] `app/layout.tsx` contains no `cookies()` / `next/headers` import; `RootLayout` is not forced
      dynamic.
- [ ] `pnpm build` lists `/` as `○ (Static)`.
- [ ] Hard reload in dark mode shows no white flash; light mode unaffected.
- [ ] `pnpm verify` exits 0.
- [ ] `plans/README.md` row for 009 updated.

## STOP conditions

- The no-FOUC check fails (a visible flash on reload) and can't be resolved by moving the script
  earlier / setting a static default — report; the no-flash requirement is non-negotiable, so a
  failing approach must not ship.
- `/` still renders dynamic (`ƒ`) after removing `cookies()` — something else pulls a dynamic API;
  find and report it (don't leave it dynamic).

## Maintenance notes

- Must land after 008 (no server-resolved scheme dependency remains).
- If a future feature needs per-request server data in the layout, isolate it in a dynamic
  sub-segment rather than re-adding a dynamic call to the root layout.
- The theme toggle and the inline script must agree on the storage key/format forever — document the
  `iconimate-theme` cookie contract in AGENTS.md (plan 006) if not already noted.
