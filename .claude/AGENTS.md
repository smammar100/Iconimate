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

**Reduced motion is honoured on playback, not on rendering — know which lever you are pulling.**
`useHover()` returns two separate flags and they are not interchangeable:

- **`reduced`** — "render the static fallback". Still hardcoded `false`, **deliberately**. Taking the
  static path leaves a reduced-motion visitor unable to preview an icon at all, which defeats a
  gallery whose entire content is motion. The `reduced ? … : …` branch in ~151 consumers is therefore
  still unreachable (and `alien.tsx`'s `fillReduced` / `haloReduced` sets with it). That is a parked
  product decision, not an oversight — leave the branches wired so it can be switched on in one place.
- **`ambient`** — `!useReducedMotion()`, the real OS preference. It gates *unattended* motion: the
  hover replay loop stops after one full pass when the user prefers reduced motion, so an explicit
  hover/tap still performs the gesture once. **Any icon whose transition carries `repeat: Infinity`
  must gate that `repeat` on `ambient`** — the hook cannot reach inside a per-icon transition.

Every looping icon is now gated: **no `repeat: Infinity` remains anywhere in `registry/icons/`** — grep
for it, an unguarded one is a bug. The shared scroll token became `scrollLoop(ambient)`; the ambient /
STATE icons (`sun`, `moon`, `cloud`, `bed`, the `airplane*` trio, `alarm`, `ambulance`, `android-logo`,
`baby-carriage`, `beer-*`, `anchor*`, `alien`) each thread `ambient` in as motion's **`custom`**, which
is how a per-render value reaches a module-level variant. The **13** files that call
`useReducedMotion()` directly (the ten `arrow-bend-*` plus `_draw-elbow`, `_arrow-u-bounce`,
`_arrows-pulse`) predate this and are still correct.

> Gotcha: `custom` does **not** inherit from a parent `motion.*`. Put `custom={ambient}` on the same
> element that carries the dynamic `variants`, or the variant receives `undefined`, `repeat` collapses
> to `0`, and the loop silently plays once — which looks like a timing bug, not a wiring bug.

Note `app/docs/page.tsx` tells consumers to wrap in `MotionConfig reducedMotion="user"`, which cannot
help (see *Motion API gotcha* below) — that guidance is still wrong and should be rewritten to point
at `ambient`.

**Rest-state fidelity rule (load-bearing):** the `normal` variant must render **pixel-identical to the
original Phosphor glyph**. If a variant rebuilds the glyph from sub-paths to move parts independently,
diff the rest state against the original path (canvas pixel-diff) before shipping — a resting icon that
drifts reads as broken at 24px in consumer apps, and nothing in CI catches it yet.

The one licensed exception is a **deliberate redraw**: the author decides the icon should rest as a
different picture, and says so out loud in the file's header. That is a design decision, not a
tolerance — the new rest must still be exact, just exact to the *new* intended picture. There are
currently **two** such icons:

> **A scaled body does not have to cost rendered size — `bicycle` shows the way out.** It needs a
> lane and has none (ink bbox x[0, 255.75]; wheels r48 at (48,160) and (208,160), touching both walls
> at the equator), so its body is drawn at 0.824 *inside the viewBox* — but the `svg` is rendered at
> `size / 0.824` and pulled back by a negative margin of half the difference. The layout box stays
> `size`, the body renders at `0.824 × size/0.824 = size` (identical pixels-per-unit to an unscaled
> glyph), and the freed 17.6% becomes room **outside** the box for the travel and streaks. Shipping
> the scale *without* the compensating box is what makes an icon read as ~18% too small in a grid —
> that happened, and was caught in review. The three numbers move together or not at all. The trade
> is overflow, not size: nothing paints outside the box at rest, only while playing, which is the
> same trade `airplane-taxiing` makes.
>
> Two more bicycle findings worth keeping: the glyph *does* have a generous lane **higher up** — the
> left margin is empty out to x41 at y60, x85 at y96, and rows above y56 are empty edge to edge, so
> wind can live there at full size and only **travel** needs the horizontal lane. And the wheels
> deliberately do **not** spin: they are plain rings, and a circle rotated about its centre is itself,
> so no rotation is visible at any speed. Spokes would be needed and are not in the mark; prototyped
> in `app/lab/bicycle/page.tsx` and not taken.

- **`ambulance`** rests at **0.86 scale** about the artboard centre. The source van spans x16..256 and
  touches the right edge, so there is no lane for the speed streaks that make it read as racing; the
  scale frees one. Consumers swapping the static Phosphor ambulance for this one get a ~14% smaller
  glyph. Restoring full size means dropping the streaks — they cannot both fit. Do not "fix" this.

- **`bell-simple-slash`** (and **`bell-slash`**, identically) rests **12,447 pixels — 5.9%** off
  the Phosphor mark, counting only pixels that flip ink/no-ink so antialiasing cannot inflate
  the figure. An earlier note here said "832 pixels (1.3%)"; that was a narrower measurement
  reported as the rest-state deviation and understated it about fifteenfold. Most of the real
  figure is **clearance**: Phosphor leaves white margins either side of the slash where it
  crosses the outline, and these have the outline touching it, so the slash merges with the
  bell instead of cutting a channel through it. Phosphor does not
  overlay a slash on a whole bell — it redraws the bell with the dome's upper-left and the collar's
  right *omitted* where the slash crosses, so the outline stops against the slash. That geometry
  cannot be animated: the slash has no separate path to draw, and the gaps sit in the bell as a
  ghost outline before any ink arrives. So the bell is drawn from `bell-simple`'s whole geometry and
  the slash is stroked over it, running continuously beneath rather than stopping at it. Masking the
  band out and redrawing it round-trips at rest but fails in motion (a static cut shows the gaps
  early; a cut that follows the stroke leaves the source's own slash visible ahead of it, so the
  slash looks finished from frame 0). Both were tried. Do not re-try them.
  Also note the slash's `opacity` keyframes are load-bearing, not decoration: a round-capped stroke
  at `pathLength: 0` renders a full 16-wide **dot** parked at the start point. Fading in over the
  hold suppresses it while keeping the round caps the source has. Butt caps would also kill the dot,
  at the cost of flat-ending the finished slash.

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

> Note: `registry/hooks/use-hover.ts` schedules its replay via `setTimeout`. The timer id is now held
> in `replayTimer` and cleared by both `stop()` and the unmount effect, so a pending replay is torn
> down outright rather than relying on a late fire noticing `looping` went false.
