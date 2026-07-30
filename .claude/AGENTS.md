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

**The reduced-motion fallback is documented but not delivered.** `registry/hooks/use-hover.ts`
hardcodes `const reduced = false`, so the `reduced ? … : …` branch in all **151** `useHover()`
consumers is unreachable — it can never take the static path. Only the **13** files that call
`useReducedMotion()` themselves honour the OS preference (the ten `arrow-bend-*` icons plus
`_draw-elbow`, `_arrow-u-bounce`, `_arrows-pulse`), covering **30 of 198** icons. `alien.tsx` even
carries `fillReduced` / `haloReduced` variant sets that nothing can reach. Note the
`HoverController.reduced` JSDoc claims the field is "True when the user prefers reduced motion",
which is the opposite of what it returns — fix the doc or the code, but don't trust the doc. This
ships to consumers via `npx shadcn add`, and `app/docs/page.tsx` tells them to wrap in
`MotionConfig reducedMotion="user"`, which cannot help (see *Motion API gotcha* below). Resolving it
is a product decision — honouring the preference makes the gallery static, which arguably defeats the
page — so the likely fix is to respect it for ambient/auto playback while keeping explicit
hover/tap previews, not to flip the constant.

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

## Site UI tripwires

Each of these shipped as a real defect and was fixed; they are recorded so the next change doesn't
reintroduce them.

- **A reveal observer must never use a negative bottom `rootMargin`.** The grid reveal in
  `components/dark/gallery.tsx` animates position only — never opacity, to protect LCP — so an
  unrevealed card is fully painted and merely sits 12px low. A negative margin therefore carves a
  band at the bottom of the viewport where visible cards freeze misaligned against the settled row
  above them until the user happens to scroll. Keep it at `0px` or positive.
- **Don't clear an attribute that supplies a `transition-delay` while that transition is still in
  flight.** `data-intro` gates `transition-delay: calc(var(--stagger) + <hold>)`; removing it
  mid-delay re-resolves the delay to a value that has already elapsed, so held elements jump instead
  of gliding. The clear timer must outlast hold + duration + the widest stagger.
- **`opacity: 0` removes nothing from the tab order or the a11y tree** — `visibility: hidden` does.
  The card action toolbar was opacity-only and contributed **558** phantom tab stops across 186
  cards (759 total → 201). The keyboard path survives the change because the card itself is the
  focusable element, so `:focus-within` fires on card focus and makes the buttons tabbable in turn.
- **Hover-revealed controls need `@media (hover: hover)` and a real coarse-pointer path.** There was
  no hover gating anywhere in `globals.css`, which left two of the three card copy actions
  unreachable on touch. Keep the `:focus-within` rule *outside* the hover query or you break
  keyboard access.
- **Breakpoint scale is 600 / 900 / 1040.** It previously carried 560, 600, 880, 900 and 1040 —
  firing paired reflows 20–40px apart while resizing. Don't add a fourth.

## Motion API gotcha

`useReducedMotion()` reads the media query directly and **does not** consult `MotionConfig`; only
motion's internal `useReducedMotionConfig()` does. So `<MotionConfig reducedMotion="never">` in
`app/providers.tsx` cannot disable an explicit `useReducedMotion()` branch, and it is *not* why icons
ignore the OS preference — the hardcoded constant in `use-hover.ts` is (see *Icon anatomy*). Verified
against `framer-motion@12.42.2` source, after this exact wrong diagnosis was made and had to be
retracted. Don't repeat it.

## Before you commit

- Run `pnpm verify` (or at least `pnpm build`) — it must exit 0.
- Keep the icon's `normal` rest state pixel-identical to the Phosphor original.
- Do not reformat the regex-parsed `index.ts` / `icon-meta.ts` entries.
- Never hand-edit `generated/`, `public/r/`, or `registry/*.gen.*` — they're generator output.

> Note: `registry/hooks/use-hover.ts` schedules its replay via `setTimeout` guarded by a `looping` ref;
> the timer id isn't tracked, which is benign today (the guard makes a late fire bail) but a watch-item
> if that loop is ever edited to read state after unmount.
