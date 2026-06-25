# Iconimate Motion Guide

How every icon in this set moves, expressed as Disney's 12 principles of animation
mapped onto our shared vocabulary. Read this before authoring or refining an icon so
the whole set keeps speaking one language.

The vocabulary lives in two files, both distributed with the registry:

- `registry/lib/motion-tokens.ts` — eases, springs, durations, and principle helpers.
- `registry/hooks/use-hover.ts` — the controller every icon is gated through.

## The shell every icon shares

```tsx
const { controls, reduced, start, stop, bind } = useHover();
useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
// ...
<div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden" | "visible", ...style }}>
  <motion.svg initial="normal" animate={controls} style={{ overflow: "visible" }}>
    <motion.path d={ART} variants={reduced ? undefined : myVariant}
      style={{ transformBox: "view-box", originX, originY }} />
  </motion.svg>
</div>
```

- Two states only: **`normal`** (rest) and **`animate`** (hover/focus). `useHover` wires
  `onMouseEnter/Leave/Focus/Blur`, so keyboard users get the same motion as pointer users.
- Every `normal` spreads **`RETURN_TRANSITION`** so an interrupted hover glides home instead of snapping.
- Anchors are **view-box fractions** (`originX/originY` 0–1, or `transformOrigin: "Xpx Ypx"`),
  never screen pixels — so motion is resolution-independent.

## Hard rules

1. **Never mutate `d`.** The artwork is fixed Phosphor geometry. Animate transforms
   (`scale*`, `rotate`, `x/y`, `opacity`, `pathLength`), not the path string. The only
   exception is a deliberately authored line that *is* the motion (e.g. the whip baseline).
2. **Tokens over magic numbers.** Reach for a shared ease/spring/helper. If you need a new
   constant more than once, promote it into `motion-tokens.ts` (additive — never change an
   existing exported value; every icon depends on them).
3. **Springs are single-overshoot only.** A `type: "spring"` transition animates one target,
   not a keyframe array. For multi-bounce *decay* use a diminishing-amplitude **tween**
   (`[0, 12, -9, 5, -2, 0]`), as in `bell.tsx`.
4. **Reduced motion is automatic.** Gate variants with `variants={reduced ? undefined : v}`
   and early-return from imperative starts (`if (reduced) return`). Because all motion is
   hover-triggered, the rest pose (the drawn artwork) is the reduced-motion state — meaningful
   by construction. Do not auto-play loops on mount.

## The 12 principles → our vocabulary

| # | Principle | Reach for | Canonical example |
|---|-----------|-----------|-------------------|
| 1 | **Squash & stretch** | anchored `scaleX`/`scaleY` keyframes; `squashStretch()` + `SQUASH_TIMES` | `arrow-right.tsx` (tail-anchored horizontal squash) |
| 2 | **Anticipation** | a wind-up keyframe before the move; `ANTICIPATE_DIP` (0.92) | `heart.tsx` (dip before the beat) |
| 3 | **Staging** | one clear focal motion; subordinate the rest; `staged()` for order | `phone-book.tsx` (cascade), `bell.tsx` (clapper lags) |
| 4 | **Straight-ahead / pose-to-pose** | variants = pose-to-pose; the draw engine = straight-ahead | `_draw-elbow.tsx` (traced frame-by-frame) |
| 5 | **Follow-through & overlapping** | trailing keyframes / `delay: staged(i)`; `springSettle` for a settling body | `bell.tsx` (ringer trails & swings wider) |
| 6 | **Slow in & slow out** | `SWEEP` (travels), `ARRIVE` (landings), `RETURN` (hover-out) | every icon's `normal` (RETURN_TRANSITION) |
| 7 | **Arcs** | multi-keyframe paths; tangent rotation | `airplane-takeoff.tsx` (x/y arc), `_draw-elbow.tsx` (head banks to tangent) |
| 8 | **Secondary action** | a second subordinate variant | `camera.tsx` (lens snap + flash), `moon.tsx` (crescent + sparkle) |
| 9 | **Timing** | `DUR` scale (`instant/fast/base/slow`), calibrated for 24px | shared across the set |
| 10 | **Exaggeration** | overshoot past rest; `OVERSHOOT_BACK`, spring overshoot, `popIn()` peak | `aperture.tsx` (back-out snap), `bolt.tsx` (1.22 pop) |
| 11 | **Solid drawing** | never change `d`; anchor with `transformBox: "view-box"` | rule #1 above |
| 12 | **Appeal** | motion must match the icon's `ICON_META.motion` label; tasteful overshoot/lean | the per-family character sheet below |

## Tokens & helpers (cheat sheet)

```ts
// Eases (registry/lib/motion-tokens.ts)
SWEEP   [0.65,0,0.35,1]   // confident travels
ARRIVE  [0.16,1,0.3,1]    // decelerate-to-rest landings (has built-in anticipation feel)
RETURN  [0.4,0,0.2,1]     // the universal hover-out glide
OVERSHOOT_BACK [0.34,1.56,0.64,1] // snaps past target then back — exaggeration

// Springs (single overshoot only)
springPop / springSwing / springSettle / springSoft

// Durations (seconds, 24px-calibrated)
DUR = { instant:0.12, fast:0.2, base:0.32, slow:0.5 }
RETURN_TRANSITION = { duration: DUR.base, ease: RETURN }   // spread into every `normal`

// Principle helpers
ANTICIPATE_DIP = 0.92                       // the wind-up scale before a pop
squashStretch({squash, stretch}) + SQUASH_TIMES   // anchored squash→stretch→settle keys
popIn({dip, peak, duration})                // ready anticipation+overshoot pop body
staged(index, step=0.09)                    // per-element delay for cascades/overlap
```

## Per-family character sheet

Each motion family (the `motion` label in `components/dark/icon-meta.ts`) has a fixed
character. New icons in a family must match it.

| Family | Character | Principles it leans on |
|--------|-----------|------------------------|
| **spring** | squash along the pointing axis, overshoot back to rest | squash/stretch, follow-through |
| **plunge** (arrow-fat-*) | elongate along the axis, tip leading, recoil; capped to stay in frame | squash/stretch, anticipation, follow-through |
| **scroll** (arrow-circle/square-*) | the inner arrow rides a wheel — fade in small, full at centre, out ahead; clipped | arcs, secondary action (scale+opacity track travel) |
| **draw** (arrow-elbow-*) | trace the centerline; chevron head banks to the tangent at each bend | straight-ahead, arcs |
| **snap** (arrow-bend-*) | self-draw on an underdamped spring; head overshoots the tip then settles | anticipation, exaggeration, follow-through |
| **whip** (arrow-line-*) | arrow collapses into / lunges from its line; the line recoils like a trampoline | squash/stretch, overlapping action |
| **drop** (align-*) | settle into place, with a squash on impact | squash/stretch, slow-in/out |
| **swing / sway / wind** | pendulum / rotational decay (diminishing-amplitude tween) | follow-through, arcs |
| **one-offs** (pop, twinkle, ring, …) | bespoke to the object; motion = the `motion` label | appeal above all |

## Reference implementations

- Squash & stretch — `registry/icons/arrow-right.tsx`
- Anticipation + secondary action — `registry/icons/heart.tsx`
- Staging / overlapping action — `registry/icons/bell.tsx`
- Exaggeration (shared overshoot) — `registry/icons/aperture.tsx`
- Arcs + straight-ahead — `registry/icons/_draw-elbow.tsx`
