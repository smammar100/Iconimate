# Plan 004: Delete dead code (unused hero + orphaned lab prototypes)

> **Executor instructions**: Follow step by step, verify each step, honor STOP conditions, update the
> row in `plans/README.md` when done. This plan deletes files — the reference-check commands below
> are load-bearing; run them exactly.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- components/dark/interactive-hero.tsx app/lab`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (safer *after* 001 so `pnpm verify` + `next build` gate the deletions)
- **Category**: tech-debt
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

Two piles of dead code:

1. `components/dark/interactive-hero.tsx` — an unused second hero implementation with **zero
   importers**. It imports the whole icons barrel (`icons, visibleIcons` from `@/registry/icons`) —
   the exact anti-pattern the perf work deliberately eliminated in favor of the code-split
   `visibleIconMeta` + `lazy-icons.gen`. Dead weight that also models the wrong pattern.
2. A subgraph of orphaned lab prototypes under `app/lab/` — flat `*-icon.ts` files and
   `variants/*.tsx` that predate the current per-icon `app/lab/<icon>/page.tsx` structure. **Most, but
   not all, are dead** (see the precise boundary below).

## Current state — IMPORTANT boundary

The audit's first pass over-claimed "all 28 flat files and all 99 variant files are dead." Verified
truth at `fe790ed`:

- `app/lab/page.tsx` (the `/lab` index route) **still imports** `./baby-carriage-icon` and
  `./variants/bc1` … `./variants/bc7`. Those are **live** — do not delete them.
- The per-icon `app/lab/<icon>/page.tsx` directories are **live** (each is a real prototype page).
- Everything else under `app/lab/` that nothing imports is dead: ~92 `variants/*.tsx` (all except
  `bc1`–`bc7`) and 27 flat `*-icon.ts` (all except `baby-carriage-icon.ts`). These form a closed dead
  subgraph — the dead variant files import the dead flat files, and nothing else imports either.

Do NOT trust a static snapshot list — **compute the dead set at execution time** (Step 2) so drift
since `fe790ed` can't cause a wrong deletion.

Excerpt confirming interactive-hero is dead:
- `grep -rln "interactive-hero\|InteractiveHero" app components registry | grep -v interactive-hero.tsx`
  → **no output** at `fe790ed`.

Excerpt confirming the lab index's live deps:
- `app/lab/page.tsx:6-13` imports `BABY_CARRIAGE` from `./baby-carriage-icon` and `Bc1`…`Bc7` from
  `./variants/bc1`…`bc7`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Verify (if 001 landed) | `pnpm verify` | exit 0 |
| Full build | `pnpm build` | exit 0 |
| Confirm no importers | see Step 1 & Step 2 | empty output |

## Scope

**In scope** (delete, after the reference checks pass):
- `components/dark/interactive-hero.tsx`
- The transitively-dead `app/lab/variants/*.tsx` (all except `bc1`–`bc7`)
- The transitively-dead `app/lab/*-icon.ts` flat files (all except `baby-carriage-icon.ts`)

**Out of scope** (do NOT delete):
- `app/lab/page.tsx`, `app/lab/baby-carriage-icon.ts`, `app/lab/variants/bc1.tsx`…`bc7.tsx` — live.
- Any `app/lab/<icon>/page.tsx` directory — live prototype pages.
- `registry/icons/*` — production icons.
- Retiring `app/lab/page.tsx` itself + its bc-prototype deps — that's deferred to plan 012 (which
  restructures the lab onto a shared harness); don't do it here.

## Git workflow

- Branch: `advisor/004-delete-dead-code`
- One commit for `interactive-hero.tsx`, one for the lab subgraph (so a revert is granular).

## Steps

### Step 1: Delete `interactive-hero.tsx`

Re-confirm no importers, then delete:

```
grep -rln "interactive-hero\|InteractiveHero" app components registry | grep -v interactive-hero.tsx
```
Must be empty. Then `git rm components/dark/interactive-hero.tsx`.

**Verify**: `pnpm build` exits 0.

### Step 2: Compute and delete the dead lab subgraph

Compute the *keep* set (files reachable from `app/lab/page.tsx` and the per-icon page dirs), then
delete flat `*-icon.ts` and `variants/*.tsx` files not in it. A safe procedure:

1. Keep list: `baby-carriage-icon.ts`, `variants/bc1.tsx`…`bc7.tsx`, and everything under
   `app/lab/<icon>/`.
2. For each candidate `app/lab/*-icon.ts` and `app/lab/variants/*.tsx`, check it is imported by
   nothing outside the dead set:
   ```
   # example for one file basename without extension, e.g. "atom-icon":
   grep -rln "atom-icon\"" app --include="*.tsx" --include="*.ts" | grep -v "app/lab/variants/"
   ```
   If the only importers are other `app/lab/variants/*` files (themselves candidates for deletion),
   the file is dead.
3. Delete the dead flat files and dead variant files with `git rm`.

**Verify after deletion**:
- `pnpm build` exits 0 (catches any missed live reference).
- `grep -rln "from \"\./variants/\|from \"\./[a-z-]*-icon\"" app/lab/page.tsx` still resolves — i.e.
  `app/lab/page.tsx`'s imports (`bc1`–`bc7`, `baby-carriage-icon`) still exist.

### Step 3: Full verification

**Verify**: `pnpm verify` (if 001 landed) and `pnpm build` both exit 0; `next dev` then load `/lab`
and one per-icon page (e.g. `/lab/baseball`) — both render.

## Test plan

- No new unit tests. The gate is `pnpm build` + a manual `/lab` and `/lab/<icon>` render check
  (these are the pages whose imports the deletions could break).

## Done criteria

- [ ] `components/dark/interactive-hero.tsx` deleted; `grep -rln "InteractiveHero" app components` empty.
- [ ] All dead `app/lab/variants/*.tsx` (except `bc1`–`bc7`) and dead `app/lab/*-icon.ts` (except
      `baby-carriage-icon.ts`) deleted.
- [ ] `app/lab/page.tsx` and its `bc1`–`bc7` + `baby-carriage-icon` deps still present.
- [ ] `pnpm build` exits 0; `/lab` and `/lab/baseball` render in `next dev`.
- [ ] `git status` shows only deletions (no modified files).
- [ ] `plans/README.md` row for 004 updated.

## STOP conditions

- Any file you were about to delete turns out to be imported by a live file (`app/lab/page.tsx` or a
  per-icon page) — STOP; the keep-set is larger than assumed.
- `pnpm build` fails after a deletion — restore the last-deleted file and report which import broke.

## Maintenance notes

- Plan 012 restructures the lab onto a shared harness and can retire the remaining old
  `app/lab/page.tsx` + `bc*` prototype chain at that time.
- After this lands, "how do I add a lab page" is unambiguous: copy an existing `app/lab/<icon>/page.tsx`.
