# Plan 011: Harden the generator contract (structural read, not regex scrape)

> **Executor instructions**: Follow step by step, verify with the golden tests from plan 001, honor
> STOP conditions, update the row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- scripts/build-registry.mjs registry/icons/index.ts components/dark/icon-meta.ts`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: 001 (its golden tests are this plan's regression gate — **required**)
- **Category**: tech-debt
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The registry generator scrapes hand-maintained TypeScript with **four regexes**; a formatting drift
in a source file silently degrades output or throws at build. Adding an icon means editing three files
in lockstep, and a reordered entry field, a multi-line import, or a comment inside an entry object
breaks the parse. The slug set lives in three places (`.tsx` files, `index.ts`, `icon-meta.ts`) with
only a partial cross-check. This plan makes the source→generator contract **structural** (read the
data as data, not as text patterns) and adds the missing parity assertion, so a reformat can't ship
broken icons.

## Current state

- `scripts/build-registry.mjs`:
  - `loadEntries()` (`:273-284`):
    ```js
    const re = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*keywords:\s*\[([^\]]*)\]/g;
    ```
    Only matches entries where `slug`, `name`, `keywords` appear **in that order** on the expected
    shape. A reordered/reformatted entry silently yields no metadata → the icon ships with
    `name ?? slug` and empty keywords (degraded search).
  - `loadMotionNames()` (`:286-292`):
    ```js
    const re = /^\s*"?([a-z0-9-]+)"?:\s*\{\s*motion:\s*"([^"]+)"/gm;
    ```
    Silently omits the `(motion)` description suffix if `icon-meta.ts` formatting drifts.
  - `parseSource()` (`:136-173`) — line-by-line import parsing with a closed module allow-list
    (`:164-170`); throws on unrecognized shapes (this part is deliberately strict — keep it).
  - The slug list is `readdirSync(ICONS_DIR)` (`:296-299`); a cross-check throws if a `.tsx` file is
    missing from `index.ts` (`:305-308`) — but there is **no** check that every `index.ts` slug is in
    `icon-meta.ts` (a missing motion entry silently drops the suffix).
- The three hand-maintained sources: `registry/icons/index.ts` (174 `Component:` entries + imports +
  `HOME_HIDDEN_SLUGS`), `components/dark/icon-meta.ts` (`ICON_META` `{ motion, glow }` map).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Build registry | `pnpm build:registry` | exit 0 |
| Golden tests (from 001) | `pnpm test` | all pass, output byte-identical |
| Verify | `pnpm verify` | exit 0 |
| Diff generated output | `git status --porcelain public/r registry/*.gen.*` | **no diff** vs pre-change |

## Scope

**In scope**:
- `scripts/build-registry.mjs` (or the extracted `scripts/registry-lib.mjs` from plan 001) — replace
  `loadEntries` / `loadMotionNames` (and the `index.ts` import-line / `HOME_HIDDEN_SLUGS` scrapes)
  with a **structural read** of the modules, and add an `index.ts` ↔ `icon-meta.ts` slug-parity
  assertion.

**Out of scope**:
- `parseSource`'s import allow-list and inlining logic — that strictness is intentional; keep it.
- Changing the *format* of `index.ts` / `icon-meta.ts` (this plan reads them more robustly; it does
  not reformat them).
- Merging `motion`/`glow` into `IconEntry` (a larger refactor — could be a follow-up; note it in
  maintenance).

## Git workflow

- Branch: `advisor/011-harden-generator-contract`
- Imperative commit subject.

## Steps

### Step 1: Read the icon index structurally

Replace the `loadEntries` regex with a real read of `registry/icons/index.ts`'s exported data. Options
(pick the lowest-risk that works in the build environment):
- **Preferred**: import the module at build time via a TS-capable loader. The generator is `.mjs`; use
  a loader that can import `.ts` (e.g. `node --import tsx scripts/build-registry.mjs`, or spawn a tiny
  `tsx`/`esbuild` sidecar that emits the entries as JSON). If a loader isn't already a dependency,
  prefer a small `esbuild`-transform-then-`import` over adding a heavy dep.
- **Fallback**: if importing TS at build time is infeasible without new deps, keep a text read but
  make it **field-order-independent and comment-tolerant** (parse each `{ ... }` entry object and
  extract `slug`/`name`/`keywords` regardless of order), and **fail loudly** (throw) if an entry can't
  be parsed instead of silently degrading.

Whichever path: a malformed/unexpected entry must **throw**, never silently produce empty keywords.

**Verify**: `pnpm build:registry` then `pnpm test` (plan 001's golden tests) → output **byte-identical**
to pre-change; `git status --porcelain public/r registry/*.gen.*` shows no diff.

### Step 2: Read `icon-meta.ts` structurally + add parity assertion

Replace `loadMotionNames`'s regex similarly (structural import or robust parse). Then add an assertion:
every slug registered in `index.ts` **must** have an `icon-meta.ts` entry (motion + glow); throw with
the missing slugs listed if not. This closes the silent-drop gap.

**Verify**: `pnpm build:registry` succeeds and output is byte-identical. Temporarily remove one
icon-meta entry → the build now **throws** naming that slug (then restore it).

### Step 3: Full verification

**Verify**: `pnpm verify` exits 0; the golden tests confirm byte-identical `public/r/*.json` and
`registry/*.gen.*` for all icons.

## Test plan

- The plan-001 golden tests are the regression gate: run `pnpm test` before and after; output must be
  byte-identical for every pinned icon.
- Add tests to `scripts/build-registry.test.mjs`: (a) an out-of-order/commented entry still parses to
  the correct `{ slug, name, keywords }`; (b) a missing `icon-meta.ts` entry for a registered slug
  throws; (c) a malformed entry throws rather than degrading.

## Done criteria

- [ ] `loadEntries` / `loadMotionNames` no longer rely on order-sensitive regexes (structural read or
      order-independent+throwing parse).
- [ ] Generator throws (doesn't silently degrade) on a malformed entry or a missing `icon-meta` slug.
- [ ] `pnpm test` shows byte-identical generated output vs pre-change for all pinned icons.
- [ ] `pnpm verify` exits 0.
- [ ] `plans/README.md` row for 011 updated.

## STOP conditions

- Any pinned icon's generated `public/r/*.json` or `registry/*.gen.*` output changes (not
  byte-identical) — the read is not faithful; STOP and report the diff.
- Making the read structural requires adding a heavy build dependency (large loader) — report the
  options; the fallback (order-independent + throwing text parse) is acceptable if importing TS is
  disproportionately costly.

## Maintenance notes

- A natural follow-up: fold `motion`/`glow` from `icon-meta.ts` into the single `IconEntry` in
  `index.ts`, deleting the second source file entirely (removes one of the three lockstep files). Left
  out here to keep the diff small and the golden tests meaningful; scope it separately.
- After this lands, relax the "don't reformat the regex-parsed files" warning in AGENTS.md (plan 006).
