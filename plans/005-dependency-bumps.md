# Plan 005: Dependency patch/minor bumps + clear the PostCSS advisory

> **Executor instructions**: Follow step by step, verify each step, honor STOP conditions, update the
> row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- package.json pnpm-lock.yaml`
> If deps already moved, re-run `pnpm outdated` / `pnpm audit --prod` and reconcile against the
> current state before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (coordinate with 008 — 008 removes `@react-spectrum/s2`, so skip bumping it if
  008 lands first)
- **Category**: dependencies
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

`pnpm audit --prod` reports one **moderate** advisory: PostCSS `<8.5.10` (GHSA-qx2v-qp2m-jg93),
reachable only through `next > postcss` (build-time CSS tooling). It clears by bumping `next`
16.2.9 → 16.2.10. Core deps are also a patch behind (`react`/`react-dom` 19.2.4 → 19.2.7, `motion`
12.40.0 → 12.42.2) — near-zero-cost fixes worth taking together. This is a clean, low-risk hygiene
pass. **Out of scope: the TypeScript 7 and ESLint 10 majors** — those carry real migration cost and
MED risk; they are deliberately deferred.

## Current state

- `package.json` dependency versions at `fe790ed` (verify with `pnpm outdated`):
  `next` 16.2.9, `eslint-config-next` 16.2.9, `react`/`react-dom` 19.2.4, `motion` 12.40.0,
  `@react-spectrum/s2` 1.4.0.
- `pnpm audit --prod` → one moderate (PostCSS via next).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| See outdated | `pnpm outdated` | table of available bumps |
| Audit | `pnpm audit --prod` | after: no moderate/high advisories |
| Update | `pnpm update <pkg>@<ver>` | lockfile updated |
| Verify | `pnpm verify` (if 001 landed) else `pnpm build` | exit 0 |

## Scope

**In scope**:
- `package.json`, `pnpm-lock.yaml` — patch/minor bumps of `next` + `eslint-config-next` (to 16.2.10),
  `react` + `react-dom` (to 19.2.7), `motion` (to latest 12.42.x). Optionally `@react-spectrum/s2`
  to 1.5.x **only if plan 008 has not removed it**.

**Out of scope**:
- `typescript` 5.x → 7.x (major, deferred).
- `eslint` 9.x → 10.x (major, deferred).
- `@types/node` major bump (deferred; low-value until the runtime Node major is confirmed).

## Git workflow

- Branch: `advisor/005-dependency-bumps`
- One commit; subject like "Bump next/react/motion to latest patch; clear PostCSS advisory".

## Steps

### Step 1: Bump the patch/minor line

```
pnpm update next@16.2.10 eslint-config-next@16.2.10 react@19.2.7 react-dom@19.2.7 motion@latest
```
(Use the exact latest patch versions from `pnpm outdated`; keep within the current majors.)

**Verify**: `pnpm audit --prod` → the PostCSS advisory is gone (no moderate/high remaining).

### Step 2: Rebuild and verify

**Verify**: `pnpm verify` (or, if 001 hasn't landed, `pnpm build:registry && pnpm exec tsc --noEmit
&& pnpm build`) → exit 0. Then `next dev` and load the homepage — icons animate, no console errors.

## Test plan

- No new tests. `pnpm verify` + a homepage smoke check (icons render and animate; `next build`
  succeeds) is the gate. Motion is the one runtime dep with animation surface — confirm a couple of
  icons still play on hover.

## Done criteria

- [ ] `pnpm audit --prod` reports no moderate/high advisories.
- [ ] `pnpm build` exits 0; homepage icons animate in `next dev`.
- [ ] Only `package.json` + `pnpm-lock.yaml` changed (`git status`).
- [ ] TypeScript and ESLint remain on their current majors (no accidental major bump).
- [ ] `plans/README.md` row for 005 updated.

## STOP conditions

- A bump introduces a type error or a runtime console error on the homepage — report which package;
  do not chase a major-version upgrade to resolve it (that's out of scope).
- `motion@latest` crosses a major (13.x) — pin to the latest 12.x instead and report.

## Maintenance notes

- The TS7/ESLint10 majors remain open findings — schedule them as separate, individually-verified
  upgrades (each is its own MED-risk plan).
- If plan 008 lands first and removes `@react-spectrum/s2`, drop it from the bump list entirely.
