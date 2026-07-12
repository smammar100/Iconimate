<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Iconimate — agent guide

Iconimate is an animated-icon gallery site (`app/`, `components/dark/`) plus a shadcn-style **registry**
(`registry/`) that distributes each icon via `npx shadcn add`. A generator, `scripts/build-registry.mjs`,
compiles the icon sources into `public/r/<slug>.json` (the shadcn registry items) plus
`registry/icon-meta.gen.ts` and `registry/lazy-icons.gen.tsx` (consumed by the live site).

**Commands:** `pnpm dev` (regenerates the registry, then `next dev`), `pnpm build`, and
`pnpm verify` — the one-command health check: `build:registry → typecheck → lint → test`. Run
`pnpm verify` before committing any change.

## Icon anatomy

An icon is `registry/icons/<slug>.tsx`. Follow the shape of an existing one (e.g.
`registry/icons/bell.tsx` or a recent one like `registry/icons/barn.tsx`):

- `"use client"` at the top.
- `forwardRef<IconHandle, IconProps>` exposing an imperative handle via
  `useImperativeHandle(ref, () => ({ startAnimation, stopAnimation }), [...])` — required because
  `:hover` never fires on touch.
- `useHover()` from `@/hooks/use-hover` drives the shared hover/focus + replay-loop controller.
- Motion `variants` with a **`normal`** (rest) and **`animate`** (playing) state.
- A **reduced-motion static fallback** that renders the plain glyph.

**Rest-state fidelity rule (load-bearing):** the `normal` variant must render **pixel-identical to the
original Phosphor glyph**. If a variant rebuilds the glyph from sub-paths to move parts independently,
diff the rest state against the original path (canvas pixel-diff) before shipping — a resting icon that
drifts reads as broken at 24px in consumer apps, and nothing in CI catches it yet.

## The generator contract (tripwires)

Adding an icon means editing **three hand-maintained files in lockstep**:

1. `registry/icons/<slug>.tsx` — the component.
2. `registry/icons/index.ts` — an `import { XIcon } from "./<slug>"` line **and** a
   `{ slug, name, keywords, Component }` entry (also `HOME_HIDDEN_SLUGS` if it shouldn't show on the
   homepage).
3. `components/dark/icon-meta.ts` — the `{ motion, glow }` entry.

`index.ts` and `icon-meta.ts` are **regex-parsed** by the generator, not imported. Do **not** reformat
their entries: keep the `{ slug, name, keywords }` field order, keep imports single-line. A reformatted
entry silently degrades (empty keywords / missing motion label) or throws the build.

**Closed import allow-list for registry icons** — a `registry/icons/*.tsx` may import only from:
`react`, `motion/react`, `@/lib/motion-tokens`, `@/lib/icon`, `@/hooks/use-hover`, and `./_*` private
factories. **Any other import breaks the build** (the generator inlines these and rejects the rest).

Adding a new export to `registry/lib/motion-tokens.ts` requires updating the **`TOKEN_DEPS`** map in the
generator so its transitive closure resolves. The authoritative description of all of this is the header
comment of `scripts/build-registry.mjs` (lines 1–12) and `parseSource` (the `IMPORT_RE` + module
allow-list around lines 129–170).

## Lab workflow

Prototype animation variants live in `app/lab/<slug>/page.tsx` (each renders 5–10 candidates that
auto-cycle + respond to hover). To promote a chosen variant, write it into `registry/icons/<slug>.tsx`
and make the three lockstep edits above.

## Before you commit

- Run `pnpm verify` (or at least `pnpm build`) — it must exit 0.
- Keep the icon's `normal` rest state pixel-identical to the Phosphor original.
- Do not reformat the regex-parsed `index.ts` / `icon-meta.ts` entries.
- Never hand-edit `generated/`, `public/r/`, or `registry/*.gen.*` — they're generator output.

> Note: `registry/hooks/use-hover.ts` schedules its replay via `setTimeout` guarded by a `looping` ref;
> the timer id isn't tracked, which is benign today (the guard makes a late fire bail) but a watch-item
> if that loop is ever edited to read state after unmount.
