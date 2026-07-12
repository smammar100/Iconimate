# Plan 012: Collapse the 38 lab pages onto a shared harness

> **Executor instructions**: Follow step by step, verify each migrated page renders identically,
> honor STOP conditions, update the row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/lab`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: LOW (internal tooling; regressions are visible on the page)
- **Depends on**: 001 (verify gate)
- **Category**: tech-debt
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The 38 `app/lab/<icon>/page.tsx` prototype pages total **12,460 lines**, of which ~150 per page is
identical harness: the `Svg` wrapper, the `AT()` view-box-origin helper, the auto-cycle `useEffect`,
the preview-grid JSX, and the page chrome. Measured duplication: `function Svg` appears in **27**
pages; the `OVERSHOOT = [0.34, 1.56, 0.64, 1]` literal in **28** pages (despite
`registry/lib/motion-tokens.ts` already exporting it as `OVERSHOOT_BACK`); the auto-cycle
`setInterval` and the `repeat(auto-fit, minmax(...))` grid in essentially all of them. The only
per-icon signal is the glyph path + the `Variants` objects + the variant list. Extracting a shared
harness means a change to the preview UX happens once, not 38 times, and new prototypes shrink to
their actual content.

## Current state

Representative structure (from `app/lab/baseball/page.tsx`, similar across all 38):
- A `Svg({ size, controls, children })` wrapper rendering `<motion.svg viewBox="0 0 256 256"
  fill="currentColor" initial="normal" animate={controls} style={{ overflow: "visible" }}>`
  (`:38-49`).
- Per-variant `forwardRef` components each wiring `useHover()` + `useImperativeHandle` +
  `<Svg controls={controls}>...</Svg>`.
- A `VARIANTS` array of `{ name, blurb, Component }`.
- A default-export page: the auto-cycle `useEffect` (a `setInterval` calling each ref's
  `startAnimation`/`stopAnimation`), and a `<main>` with the `repeat(auto-fit, minmax(180px, 1fr))`
  preview grid mapping over `VARIANTS`.
- Some pages also inline `const AT = (x, y) => ({ transformBox: "view-box", originX: x/256, originY:
  y/256 })` and `const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;`.

The lab pages are **internal prototyping tooling** — never distributed through the registry, so they
are NOT subject to the generator's inline-able-module constraint (that applies only to
`registry/icons/*`). A shared `app/lab/_shared/` module is safe here.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Dev | `pnpm dev` | load each migrated `/lab/<icon>` |
| Build | `pnpm build` | exit 0 |
| Verify | `pnpm verify` | exit 0 |
| Count harness dup (progress) | `grep -rl "function Svg" app/lab/*/page.tsx | wc -l` | decreases to ~0 |

## Scope

**In scope**:
- Create `app/lab/_shared/` (e.g. `harness.tsx`) exporting: a shared `Svg`/`IconSvg` wrapper, the
  `AT()` origin helper, and a `<VariantGrid title variants />` component that owns the auto-cycle
  effect + preview-grid JSX + page chrome.
- Migrate the 38 `app/lab/<icon>/page.tsx` pages to import from `_shared` and render `<VariantGrid>`;
  each page keeps only its glyph path(s), `Variants` objects, per-variant components, and the
  `VARIANTS` array.
- Optionally: replace inline `OVERSHOOT` literals in lab pages with an import (from `_shared` or from
  `@/lib/motion-tokens`'s `OVERSHOOT_BACK`).

**Out of scope**:
- `registry/icons/*` — do NOT touch shipped icons (their duplication is subject to the inlining
  contract; changing it risks the distribution). Deduping registry-icon primitives is a separate,
  higher-risk effort.
- Retiring `app/lab/page.tsx` + its `bc*` prototype chain — optional here; if done, verify `/lab`
  still renders. Prefer to leave it unless trivially convertible.
- Behavior changes to the auto-cycle timing or grid layout — reproduce them exactly in `VariantGrid`.

## Git workflow

- Branch: `advisor/012-shared-lab-harness`
- Migrate in small batches (e.g. 5 pages per commit) so a regression is easy to bisect. Do NOT do all
  38 in one commit.

## Steps

### Step 1: Build `app/lab/_shared/harness.tsx`

Extract, verbatim in behavior:
- `Svg`/`IconSvg` — the `<motion.svg viewBox="0 0 256 256" fill="currentColor" ...>` wrapper.
- `AT(x, y)` — the view-box origin helper.
- `VariantGrid({ title, variants, cycleMs?, playMs? })` — owns the `useRef` array, the auto-cycle
  `useEffect` (`setInterval` start/stop), and the `<main>`/preview-grid JSX. Accept the per-page
  timing knobs as props with defaults matching the current common values (check a few pages: many use
  `stopAnimation` after ~1.4–2.2s on a ~2.6–3.6s interval — expose these as props).

**Verify**: `pnpm exec tsc --noEmit` exits 0; `_shared` exports the three symbols.

### Step 2: Migrate one page as the template

Pick a representative page (e.g. `app/lab/baseball/page.tsx`). Replace its `Svg`, `AT`, auto-cycle
effect, and preview-grid JSX with imports + `<VariantGrid title="Baseball" variants={VARIANTS} />`.
Keep its glyph path, `Variants`, per-variant components, and `VARIANTS` array.

**Verify**: `pnpm dev`, load `/lab/baseball` → renders identically (same tiles, same auto-cycle, same
hover behavior). Screenshot before/after.

### Step 3: Migrate the rest in batches

Repeat Step 2 for the other 37 pages, 5 per commit. After each batch, load 1–2 of the migrated pages
and confirm identical rendering.

**Verify**: after all batches, `grep -rl "function Svg" app/lab/*/page.tsx | wc -l` → 0 (or only pages
with a genuinely custom wrapper); `pnpm build` exits 0.

## Test plan

- No unit tests (internal visual tooling). Gate: each migrated `/lab/<icon>` renders identically
  (spot-check a sample per batch with screenshots) + `pnpm verify` green + `pnpm build` succeeds.

## Done criteria

- [ ] `app/lab/_shared/harness.tsx` exports `Svg`/`IconSvg`, `AT`, `VariantGrid`.
- [ ] All 38 `app/lab/<icon>/page.tsx` use the shared harness; `grep -rl "function Svg"
      app/lab/*/page.tsx` → ~0.
- [ ] A spot-check sample of migrated pages renders identically to pre-migration (screenshots).
- [ ] `pnpm build` and `pnpm verify` exit 0.
- [ ] `plans/README.md` row for 012 updated.

## STOP conditions

- A page uses a genuinely different `Svg`/harness variant that `VariantGrid` can't express without a
  prop explosion — leave that page unmigrated, note it, and continue; don't over-generalize the
  harness.
- Any migrated page renders differently (missing tile, broken auto-cycle, changed layout) — revert
  that page and report.

## Maintenance notes

- New lab prototypes now copy a ~40-line page: glyph path + variants + `<VariantGrid>`. Document this
  in AGENTS.md (plan 006) / CONTRIBUTING.
- This is the natural place to also retire the old flat `app/lab/page.tsx` + `bc*` chain (deferred
  from plan 004) if it's superseded by the per-icon pages.
- Deduping the registry icons' inline `OVERSHOOT`/`AT` is a separate effort gated by the generator's
  inlining allow-list — do not fold it in here.
