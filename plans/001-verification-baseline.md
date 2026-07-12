# Plan 001: Establish a verification baseline (typecheck + generator tests + CI)

> **Executor instructions**: Follow this plan step by step. Run every verification command and
> confirm the expected result before moving to the next step. If anything in the "STOP conditions"
> section occurs, stop and report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- package.json scripts/ .github/`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts
> against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests / dx
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The repo has **zero automated verification**: no `test` script, no `typecheck` script, no CI. The one
real safety layer is TypeScript, and nothing runs it except a full `next build`. Worse, the icon
registry — the product shipped to `npx shadcn add` consumers — is produced by `scripts/build-registry.mjs`,
which **regex-parses** TypeScript source to emit `public/r/*.json` and inlined standalone `.tsx`. The
generator even writes those standalone files to `generated/registry/` "for tsc verification only,"
and `scripts/tsconfig.registry.json` targets exactly that directory — but **no script or CI ever runs
that tsc**. A regex mis-parse (or a hand-edit that drifts from the expected shape) can ship a
type-broken or degraded component to consumers with nothing to catch it. This plan builds the
one-command health check (`pnpm verify`) that every later, riskier plan depends on.

## Current state

- `package.json` scripts (verified `fe790ed`):
  ```json
  "scripts": {
    "dev": "node scripts/build-registry.mjs && next dev --webpack",
    "build": "node scripts/build-registry.mjs && next build --webpack",
    "build:registry": "node scripts/build-registry.mjs",
    "start": "next start",
    "lint": "eslint"
  }
  ```
  No `test`, no `typecheck`, no `verify`.
- `scripts/build-registry.mjs` — the generator. It reads `registry/icons/*.tsx`, inlines shared
  modules, and emits `public/r/<slug>.json`, `public/r/registry.json`, `registry/icon-meta.gen.ts`,
  `registry/lazy-icons.gen.tsx`, and standalone `.tsx` under `generated/registry/`. Key pure
  functions to test:
  - `parseSource(src, file)` (`scripts/build-registry.mjs:136`) — splits a file into
    `{ imports, body }`; **throws** on an unrecognized import shape or unexpected module.
  - `splitTokenDeclarations(src)` (`~:38`) — splits `registry/lib/motion-tokens.ts` at export
    boundaries.
  - `loadEntries()` (`:273`) and `loadMotionNames()` (`:286`) — regex-scrape `registry/icons/index.ts`
    and `components/dark/icon-meta.ts`.
  - Token collision-rename logic (`~:224`) — e.g. avocado's icon body declares a local `const DUR`
    that collides with a pulled-in token named `DUR`; the generator renames the token to `DUR_TOKEN`
    inside the inlined snippet only.
- `scripts/tsconfig.registry.json` exists and targets `generated/registry/` but is never invoked.
- `generated/` is a git-ignored build artifact (confirm with `git check-ignore generated`).
- No `.github/` directory exists (confirm: `ls .github` → not found).

Repo conventions: ESM `.mjs` scripts, no existing test framework. Use Node's built-in test runner
(`node:test` + `node:assert`) — it needs no new dependency and runs `.mjs` directly.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 |
| Build registry | `pnpm build:registry` | exit 0, prints `registry: NNN icons -> public/r/` |
| Root typecheck | `pnpm exec tsc --noEmit` | exit 0, no errors |
| Generated typecheck | `pnpm exec tsc -p scripts/tsconfig.registry.json --noEmit` | exit 0, no errors |
| Lint | `pnpm lint` | exit 0 |
| Unit tests | `node --test scripts/` | all pass |

## Scope

**In scope** (create/modify):
- `package.json` — add `typecheck`, `test`, `verify` scripts.
- `scripts/build-registry.mjs` — **only** to `export` the pure helper functions that tests import
  (add named exports; do NOT change their behavior). If the file runs its main logic at import time
  (top-level side effects at `~:294` onward), guard the main block so importing the helpers does not
  regenerate files — wrap the "Main" section in `if (import.meta.url === \`file://${process.argv[1]}\`)`
  or move helpers into a sibling `scripts/registry-lib.mjs` that both the generator and the tests
  import. Prefer the sibling-module extraction — it is cleaner and lower-risk than a run-guard.
- `scripts/registry-lib.mjs` (create, if extracting helpers).
- `scripts/build-registry.test.mjs` (create) — the `node:test` suite.
- `.github/workflows/ci.yml` (create).

**Out of scope** (do NOT touch):
- Any `registry/icons/*.tsx`, `registry/icons/index.ts`, `components/dark/icon-meta.ts` — this plan
  adds tests around the generator, it does not change icon sources or fix any bug the tests reveal.
- `generated/` and `public/r/` — build outputs; never hand-edit.
- The generator's parsing behavior — characterize what it does today, don't "improve" it (that's
  plan 011).

## Git workflow

- Branch: `advisor/001-verification-baseline`
- Commit style matches repo (`git log --oneline -5` shows plain imperative subjects, e.g. "Add
  animated barn icon (Barn Dance) with lab candidates"). Use imperative subjects.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract testable helpers

If the helper functions are not already importable without side effects, move `parseSource`,
`splitTokenDeclarations`, `loadEntries`, `loadMotionNames`, the token dependency/closure logic, and
the collision-rename logic into `scripts/registry-lib.mjs` with named `export`s, and have
`scripts/build-registry.mjs` import them. The generator's output must be **byte-identical** after
this refactor.

**Verify**: `pnpm build:registry` then `git status --porcelain public/r registry/*.gen.*` → **no
diff** in generated files (the extraction changed no output).

### Step 2: Add the scripts to `package.json`

```json
"typecheck": "tsc --noEmit && tsc -p scripts/tsconfig.registry.json --noEmit",
"test": "node --test scripts/",
"verify": "pnpm build:registry && pnpm typecheck && pnpm lint && pnpm test"
```

Note: `typecheck` runs the **generated** tsc too, so it must run *after* `build:registry` populated
`generated/registry/`. `verify` orders that correctly.

**Verify**: `pnpm verify` runs all four stages. Record the exit code and any type errors.

### Step 3: Write characterization tests

Create `scripts/build-registry.test.mjs` using `node:test`. Cover:

1. **`parseSource` happy paths** — a plain-hover icon, a factory-importing icon (`import { X } from
   "./_something"` → `imports.factory` set), a token-importing icon. Assert the `imports` shape and
   that `body` strips `"use client"` and import lines.
2. **`parseSource` throws** — feed a line `import fs from "node:fs";` (unexpected module) and assert
   it throws with a message containing `unexpected import module`.
3. **Token collision rename** — assert that when an icon body contains `const DUR` and a token named
   `DUR` is pulled in, the inlined token is renamed (search output for `DUR_TOKEN`).
4. **`loadEntries` / `loadMotionNames`** — run against the real `registry/icons/index.ts` and
   `components/dark/icon-meta.ts`; assert every slug in `loadEntries()` also appears in the icon
   files list, and note (don't fail) any slug in entries missing from `loadMotionNames()`.
5. **Golden output** — for 3–4 representative slugs (pick one factory-based, one with a token
   collision like `avocado`, one plain hover like `bell`, one with a lazy loop like a recent
   baseball icon), assert `public/r/<slug>.json` `files[0].content` is non-empty, contains
   `export const` for the icon component, and does **not** contain any `import ... from "@/..."`
   (all `@/` imports must have been inlined). This pins the inlining contract without brittle
   full-string snapshots.

Model the test file structure on Node's `node:test` docs — `import { test } from "node:test"` and
`import assert from "node:assert/strict"`.

**Verify**: `node --test scripts/` → all tests pass; the run reports the number of tests.

### Step 4: Add CI

Create `.github/workflows/ci.yml` that on `push`/`pull_request` runs: checkout → setup pnpm + Node
(match the Node version the repo targets; check `package.json` `engines` or default to Node 20 LTS) →
`pnpm install --frozen-lockfile` → `pnpm verify`.

**Verify**: `pnpm exec ... ` locally mirrors the CI steps; the YAML is valid
(`pnpm dlx yaml-lint .github/workflows/ci.yml` or any YAML validator) — exit 0.

## Test plan

- New file `scripts/build-registry.test.mjs` with the cases in Step 3 (happy paths, the throw case,
  collision rename, metadata parity, golden inlining assertions).
- Pattern to follow: none exists in-repo; use `node:test` + `node:assert/strict` (built-in).
- Verification: `pnpm test` → all pass, ≥ 8 assertions across the cases above.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm verify` exits 0.
- [ ] `pnpm test` exits 0 with ≥ 8 passing tests.
- [ ] `pnpm build:registry` after Step 1 produces **no diff** in `public/r/` or `registry/*.gen.*`
      versus before the refactor.
- [ ] `.github/workflows/ci.yml` exists and runs `pnpm verify`.
- [ ] `git status` shows no files modified outside the in-scope list.
- [ ] `plans/README.md` status row for 001 updated to DONE.

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm typecheck` (either the root or the generated tsc) reveals **pre-existing** type errors. These
  are a real finding — report them with the file:line, do NOT silently fix them (that would exceed
  this plan's scope and mask a bug).
- Step 1's byte-identical check fails — the helper extraction changed generator output; the refactor
  is wrong, back it out and report.
- The golden test in Step 3.5 finds an `@/` import that was NOT inlined in a `public/r/*.json` —
  that's a real generator bug; record it and report (it becomes input to plan 011), do not patch the
  generator here.

## Maintenance notes

- When plan 011 rewrites the generator's parsing, the golden tests here are its regression gate — run
  `pnpm test` before and after and confirm byte-identical output.
- If a future icon uses a new shared module, `parseSource`'s allow-list (`scripts/build-registry.mjs:164-170`)
  must be updated; add a test case for it.
- A reviewer should scrutinize that Step 1's extraction did not change any generator behavior — the
  no-diff check in Done criteria is the proof.
