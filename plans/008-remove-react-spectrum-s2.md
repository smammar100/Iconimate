# Plan 008: Remove React Spectrum S2; unblock Turbopack

> **Executor instructions**: Follow step by step, verify each step in the browser, honor STOP
> conditions, update the row in `plans/README.md` when done. This plan changes theming — the visual
> verification steps are load-bearing.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/providers.tsx app/layout.tsx next.config.ts package.json app/globals.css`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: 001 (needs `pnpm verify` as the gate)
- **Category**: perf / dependencies
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

`@react-spectrum/s2` is imported for exactly one thing — the `<Provider>` in `app/providers.tsx` that
syncs the browser's `color-scheme` (caret color, native scrollbars) to the theme. **No S2 component
renders anywhere.** For that cosmetic sync the app ships S2's global `page.css`, a provider runtime,
`transpilePackages`, and a Parcel-macro Webpack plugin — and, per `next.config.ts`'s own comment,
this is **the sole reason the build is pinned to `--webpack` instead of Turbopack**. Replacing the
Provider with a few lines of CSS (`color-scheme` / `caret-color` / `accent-color` keyed off
`data-theme`) removes a heavyweight dependency AND unblocks Turbopack for `dev` and `build`.

## Current state

- `app/providers.tsx` (full, `fe790ed`): a `"use client"` `AppProvider` that seeds
  `useState(initialColorScheme)`, keeps `scheme` in sync with `document.documentElement`'s
  `data-theme` via a `MutationObserver`, and renders
  `<Provider background="base" colorScheme={scheme} locale="en-US"><MotionConfig reducedMotion="never">{children}</MotionConfig></Provider>`.
  The `Provider` import is `import { Provider } from "@react-spectrum/s2/Provider";`.
- `app/layout.tsx:6`: `import "@react-spectrum/s2/page.css";` (global S2 stylesheet).
- `app/layout.tsx:89`: `<AppProvider initialColorScheme={theme}>{children}</AppProvider>`.
- `next.config.ts` (full): imports `unplugin-parcel-macros`, sets
  `transpilePackages: ["@react-spectrum/s2"]`, and a `webpack(config)` hook pushing `macros.webpack()`.
  Its header comment (`:4-12`) states the macro plugin is Webpack-only and is why the npm scripts pin
  `--webpack`.
- `package.json` scripts pin `--webpack` on `dev` and `build`.
- Grep confirms S2 appears only in `next.config.ts`, `app/layout.tsx`, `app/providers.tsx` (+ lockfile
  / package.json). No S2 tokens or components used elsewhere.
- The theme is applied via `data-theme`/`data-color-scheme` on `<html>` (set server-side in
  `app/layout.tsx` from the cookie — see plan 009). `app/globals.css` holds the app's own theme
  tokens keyed off `[data-theme="dark"]`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Dev (turbopack) | `pnpm dev` (after removing `--webpack`) | serves; no macro error |
| Build (turbopack) | `pnpm build` (after removing `--webpack`) | exit 0 |
| Verify | `pnpm verify` | exit 0 |
| Grep S2 | `grep -rln "react-spectrum" app components next.config.ts` | empty after |

## Scope

**In scope**:
- `app/providers.tsx` — drop the S2 `Provider`; keep the `MotionConfig reducedMotion="never"` wrapper
  and the `data-theme` sync if still needed (see Step 2).
- `app/layout.tsx` — remove the `@react-spectrum/s2/page.css` import.
- `app/globals.css` — add `color-scheme` / `caret-color` / `accent-color` rules keyed off
  `[data-theme]` (or `:root` + `[data-theme="dark"]`) to replace what S2 did.
- `next.config.ts` — remove `transpilePackages`, the `unplugin-parcel-macros` import, and the
  `webpack()` hook (keep `experimental.optimizePackageImports`).
- `package.json` — remove `@react-spectrum/s2` and `unplugin-parcel-macros` deps; drop `--webpack`
  from `dev` and `build` scripts.

**Out of scope**:
- The cookie-based theme resolution in `app/layout.tsx` (`await cookies()`) — that's plan 009. This
  plan only removes S2; the layout can stay dynamic for now.
- The app's own theme token system in `globals.css` — leave the existing `[data-theme]` tokens; only
  ADD the native-control rules.

## Git workflow

- Branch: `advisor/008-remove-react-spectrum-s2`
- Commit in logical units (CSS replacement, then dep/config removal) so a revert is granular.

## Steps

### Step 1: Add native-control theming to CSS

In `app/globals.css`, add rules so native controls follow the theme without S2. At minimum:
```css
:root { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
```
Add `caret-color` / `accent-color` if the design needs specific values (check what the ⌘K input caret
and any form controls looked like with S2 — match them). `color-scheme` alone fixes native scrollbars
and default caret/`accent-color` in most browsers.

**Verify**: temporary — with the Provider still present, confirm these rules don't conflict.

### Step 2: Remove the S2 Provider

In `app/providers.tsx`, delete the `Provider` import and unwrap it. Decide the `MotionConfig` /
`MutationObserver` fate:
- Keep `<MotionConfig reducedMotion="never">{children}</MotionConfig>` (still needed — icons must
  animate regardless of OS reduced-motion).
- The `useState`/`MutationObserver` existed only to feed S2's `colorScheme`. Since CSS `color-scheme`
  now reads `data-theme` directly, the observer can be removed. `AppProvider` becomes a thin wrapper
  around `MotionConfig`. Keep the `initialColorScheme` prop only if `layout.tsx` still passes it (it
  can be dropped, but that's a layout edit — keep the prop accepted-but-unused if minimizing churn,
  or remove the prop and its `layout.tsx` usage together).

**Verify**: `pnpm exec tsc --noEmit` exits 0.

### Step 3: Remove the S2 CSS import and the deps/config

- Delete `import "@react-spectrum/s2/page.css";` from `app/layout.tsx`.
- In `next.config.ts`, remove the `macros` import, `transpilePackages`, and the `webpack()` hook.
  Keep `experimental.optimizePackageImports: ["motion"]`.
- In `package.json`, remove `@react-spectrum/s2` and `unplugin-parcel-macros` from deps; remove
  `--webpack` from `dev` and `build`. Run `pnpm install` to update the lockfile.

**Verify**: `grep -rln "react-spectrum\|parcel-macros" app components next.config.ts package.json` →
empty.

### Step 4: Verify Turbopack build + visual parity

- `pnpm dev` (now Turbopack) → serves with no macro/webpack error.
- `pnpm build` (now Turbopack) → exit 0.
- Load the homepage in both themes (toggle light/dark). Confirm: caret color in the ⌘K search input,
  native scrollbar color, and any form control colors match the theme the same way they did with S2.
  Take before/after screenshots in both themes.

**Verify**: `pnpm verify` exits 0; Turbopack `dev` + `build` succeed; both themes visually correct
(screenshots).

## Test plan

- No unit tests (this is styling/deps). The gate is: `pnpm verify` green, Turbopack `dev`+`build`
  succeed, and a two-theme visual check of native controls (caret, scrollbar) with screenshots.
- Use the browser MCP/preview to capture light and dark screenshots of the ⌘K input focused (caret
  visible) before and after.

## Done criteria

- [ ] `grep -rln "react-spectrum" app components next.config.ts package.json` → empty.
- [ ] `next.config.ts` has no `webpack()` hook, no `transpilePackages`, no parcel-macros import.
- [ ] `dev` and `build` scripts have no `--webpack`; `pnpm build` (Turbopack) exits 0.
- [ ] `pnpm verify` exits 0.
- [ ] Native controls (caret, scrollbar) match the theme in both light and dark (screenshots
      attached to the PR).
- [ ] `plans/README.md` row for 008 updated.

## STOP conditions

- Removing S2 visibly breaks native-control theming in a way `color-scheme`/`caret-color`/`accent-color`
  can't reproduce — report with screenshots; some S2 token may be load-bearing.
- Turbopack `build` fails for a reason unrelated to the macro (e.g. another webpack-only assumption) —
  report the error; do not re-add `--webpack` silently.

## Maintenance notes

- This unblocks plan 009 (the cookie read is the only remaining reason the layout is dynamic once S2
  is gone).
- Coordinate with plan 005: once S2 is removed, drop it from 005's bump list.
- Removing the webpack pin means any future webpack-only plugin needs re-evaluation against Turbopack.
