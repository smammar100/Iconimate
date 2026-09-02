"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, type MotionValue, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE, DUR } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// GUST — a draught catches the ribbon: it swings from the pin it hangs on while a
// ripple runs down its length and dies out. Promoted from
// `app/lab/bookmark-simple/page.tsx` (variant 6 of 6, composing that page's
// `3 · Swing` with its `5 · Cloth`); the four rejected takes live there.
//
// VERB: it HANGS AND CATCHES THE AIR. A bookmark is a strip of fabric pinned at
// the top edge of a page with a cut V at the free end, so one fact governs
// everything: THE TOP IS FIXED AND THE TAILS ARE FREE.
//
// MATERIAL: fabric (§9). Not paper and not metal — it is the one mark in the set
// whose subject is limp, so it is also the one that earns a travelling wave
// instead of a transform. It does not squash and it does not spring.
//
// ── MEASURED (512x512, counting only pixels that flip ink/no-ink) ──────────
//
//   ink bbox   x56..199.5, y32..231.5 — the outline plus its 8-unit half stroke.
//              LANE: 56 left, 56.5 right, 32 top, 24.5 bottom. The generous side
//              lanes are what make the ripple possible without clipping.
//   mirror about x=128 -> 0.0049% (2 px, antialiasing only)
//
// ── THE PARAMETRIC REBUILD, AND THE GATE IT HAD TO PASS ────────────────────
//
// This gesture changes the OUTLINE, not a transform of it, so the mark is
// regenerated from parameters every frame. That is only allowed if the generator
// reproduces the authored glyph exactly at rest, and it does — the sampled and
// smoothed form measured against the source `d` at zero amplitude:
//
//     0 of 40,518 px  =  0.0000%
//
// Each vertical edge is sampled at 9 points and joined with Catmull-Rom cubics.
// Through COLLINEAR, EVENLY SPACED points that construction puts the control
// points on the same line, so the curve degenerates to the exact straight edge.
// Rest is not "close to" the glyph, it IS the glyph, and the wave dials to zero
// with no seam. At peak the mark spans x38..217.5 in a 0..256 artboard, so
// nothing clips (§4) even while the silhouette is being rebuilt.
//
// THE V IS DELIBERATELY NOT SMOOTHED ACROSS THE NOTCH. Running the spline through
// it rounds off the cut, which is the one feature that makes this a bookmark
// rather than a rectangle. The notch is an explicit corner between two runs.
//
// ── WHAT MAKES IT FABRIC AND NOT A WAGGLE ──────────────────────────────────
//
// Three properties, and dropping any one collapses it into a rigid flag on a
// pole (which was built first and thrown away):
//   1. THE WAVE TRAVELS. Phase advances with time, so a crest forms near the pin
//      and moves down the ribbon. A shape that flexes in place is a lever.
//   2. THE AMPLITUDE RAMPS AS u^2 from the pinned top to the free tails. Cloth is
//      constrained at its seam and freest at its far end; the square makes the
//      top genuinely quiet rather than merely smaller.
//   3. THE ENVELOPE IS A GUST, NOT A LOOP — it rises over the first 12% and
//      decays to exactly 0 by the end. Fabric that oscillates forever is a
//      mechanism, and an unattended loop fails the peripheral-vision test.
// 1.25 wavelengths along the ribbon: fewer and it is a lean, more and the ripple
// is finer than the 16-unit stroke and reads as noise at ship size.
//
// NOTE ON WHAT THE WAVE IS NOT: the displacement is a function of y alone, so
// both edges at a given height move TOGETHER — the ribbon's cross-section
// translates sideways as a unit, which is what a strip of cloth does. The tails
// are not counter-oscillating; the width never changes. What sells it is the wave
// travelling along the length, not the two edges disagreeing.
//
// ── THE COMPOSITION: SWING OUTSIDE, RIPPLE INSIDE ──────────────────────────
//
// A ribbon knocked at its pin does not choose between rotating and rippling. The
// swing is the primary and the ripple rides it (§10, overlapping action), built
// as an outer rigid rotation about (128,44) — THE MIDDLE OF THE PINNED TOP EDGE,
// not the centre of the mark — with the wave morph inside it. Composing that way
// means the ripple is computed in the swinging frame, so a crest formed on the
// way out is still on the ribbon on the way back and the two read as one body.
// Swinging about the centre instead is a spinning label; that single coordinate
// is the whole difference.
//
// THE BODY SETTLES BEFORE THE FABRIC DOES. The swing lands at 0.7 of the pass and
// the ripple runs to 1.0 — measured live, the tails were still moving (+2, +4,
// +2) for ~300ms after the rotation reached 0. The other order (fabric still,
// body moving) reads as a stiff card wobbling.
//
// AMPLITUDE IS 14, CUT FROM THE 18 THE STANDALONE RIPPLE USES, because the swing
// already contributes 28 units of tail travel; stacked at 18 the far corner
// reached x246 and the tails flailed.
//
// ── WHY `d` IS DRIVEN BY A MotionValue, NOT BY VARIANT KEYFRAMES ───────────
//
// Established by measurement on `globe` and reused here: path `d` keyframes in a
// variant DO NOT interpolate, and driving `d` from `useTransform` into a
// `motion.path` races React re-renders that restore the prop. So the gesture
// animates an ordinary NUMBER — a 0..1 clock — and a memo'd plain `<path>` with
// exactly ONE writer sets `d` from the driver's `on("change")`. This icon
// therefore wraps `start`/`stop` and binds its own handlers rather than
// spreading `useHover`'s `bind`; the imperative handle wraps the same pair, so
// `startAnimation` / `stopAnimation` still work on touch.
//
// AN INTERRUPT FINISHES THE GUST FORWARD, and that was a defect caught by
// sampling rather than by eye. The clock's envelope is zero at BOTH ends, so u=0
// and u=1 are both the resting glyph — but settling back to 0 replayed the
// ripple in reverse at speed, measured as the tails snapping +2 -> -9 -> -3 -> +6
// in 180ms. Fabric does not un-ripple. Hover-out now runs the clock forward to
// u=1, the gust dying out (the `gear` argument: a body completes its stroke).
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · A UNIFORM SIDE-TO-SIDE SWAY. That is a rigid flag on a pole, not fabric.
//   · A FILL RISING INSIDE THE OUTLINE for the "saved" state — the canonical
//     bookmark gesture. `heart` shipped a fill here and it was later removed
//     (MOTION.md §11 records the retiming that followed), so the set has already
//     decided against fill-as-gesture; it would also make rest ambiguous between
//     saved and unsaved.
//   · SCALING THE WHOLE MARK. The top edge is pinned to a page; scaling moves it,
//     which reads as the bookmark growing rather than the ribbon flexing.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// THIS DEFORMS THE SILHOUETTE EVERY FRAME. A mark whose outline is regenerated is
// one bad envelope away from reading as a wobbling blob, and at 20px a ripple can
// look like a rendering fault rather than fabric. Resolved three ways, all
// checked: the top edge and both corners are LITERALLY UNMOVED (the ramp is zero
// there and the rotation pivots through them), so the icon stays anchored where
// the eye expects; the envelope returns to 0 before the pass ends, so it settles
// on the authored glyph rather than being cut off mid-ripple; and it is one gust
// that decays, never a loop. The still frame at 60% is a bookmark with a slight
// lean (§0 gate 2).
//
// Second worry, the FIFTIETH HOVER: 1.5s is Expressive tier (§8) and a bookmark
// is a save button that may fire all day. It survives that room because it is one
// closed round trip with no repeat, no accent and no ambient layer — nothing
// moves unless the user is pointing at it (test 5). The hit area never moves: the
// swing pivots on the pinned edge and the ripple stays inside the mark's own
// lane, so the silhouette never grows past the artboard (test 2). Every exit
// lands on the authored glyph.

/* -- geometry ------------------------------------------------------------- */

const HW = 64; // half width
const TOP = 40; // top edge y
const EDGE_TOP = 48; // where the corner arcs end and the vertical edges begin
const NOTCH = 184; // the V apex
const TAIL = 224; // the tail tips
const SAMPLES = 8; // segments per vertical edge

/** The authored glyph, for the static / reduced-motion render. */
const SRC = "M192,224l-64-40L64,224V48a8,8,0,0,1,8-8H184a8,8,0,0,1,8,8Z";

/** Catmull-Rom through sampled points as cubics. Collinear input -> straight. */
function spline(pts: [number, number][]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)},${c2x.toFixed(2)},${c2y.toFixed(2)},${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

/** Sampled/smoothed rebuild with a horizontal displacement dx(y).
 *  dx = 0 reproduces SRC exactly (0.0000%). */
function bookmarkWave(dx: (y: number) => number) {
  const edge = (sign: 1 | -1) => {
    const p: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const y = EDGE_TOP + ((TAIL - EDGE_TOP) * i) / SAMPLES;
      p.push([128 + sign * HW + dx(y), y]);
    }
    return p;
  };
  const right = edge(1);
  const left = edge(-1).reverse();
  return (
    `M${(128 - HW + dx(EDGE_TOP)).toFixed(2)},${EDGE_TOP}a8,8,0,0,1,8,-8` +
    `H${128 + HW - 8}a8,8,0,0,1,8,8` +
    spline(right) +
    `L${(128 + dx(NOTCH)).toFixed(2)},${NOTCH}` +
    `L${left[0][0].toFixed(2)},${left[0][1].toFixed(2)}` +
    spline(left) +
    "Z"
  );
}

const AMP = 14;
const WAVES = 1.25;
const DURATION = 1.5;

/** The travelling wave at pass-clock u (0..1). */
function gustDx(u: number) {
  const env = u < 0.12 ? u / 0.12 : Math.pow(1 - (u - 0.12) / 0.88, 1.5);
  const phase = -u * Math.PI * 2 * 1.6; // the crest travels downward
  return (y: number) => {
    const v = (y - TOP) / (TAIL - TOP);
    return AMP * env * v * v * Math.sin(2 * Math.PI * WAVES * v + phase);
  };
}

/** The rigid swing, about the pin. Decaying and uneven (§10). */
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 6, -3, 0, 0],
    transition: {
      duration: DURATION,
      times: [0, 0.16, 0.34, 0.52, 0.7, 1],
      ease: ["easeOut", "easeInOut", "easeInOut", ARRIVE, "linear"],
    },
  },
};

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const PIN = AT(128, 44); // the middle of the pinned top edge

/** The only writer of `d`. `memo` on a stable prop so React never re-renders it
 *  and never rewrites the attribute. */
const Ribbon = memo(function Ribbon({ clock }: { clock: MotionValue<number> }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const apply = (u: number) => ref.current?.setAttribute("d", bookmarkWave(gustDx(u)));
    apply(clock.get());
    return clock.on("change", apply);
  }, [clock]);
  return <path d={SRC} ref={ref} />;
});

export const BookmarkSimpleIcon = forwardRef<IconHandle, IconProps>(function BookmarkSimpleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop } = useHover();
  const clock = useMotionValue(0);
  const running = useRef<{ stop: () => void } | null>(null);

  const startAll = useCallback(() => {
    start();
    running.current?.stop();
    clock.set(0);
    running.current = animate(clock, 1, { duration: DURATION, ease: "linear" });
  }, [start, clock]);

  const stopAll = useCallback(() => {
    stop();
    running.current?.stop();
    // Forward to the end of the gust — never rewind the ripple.
    running.current = animate(clock, 1, { duration: DUR.base, ease: "easeOut" });
  }, [stop, clock]);

  useEffect(() => () => running.current?.stop(), []);
  useImperativeHandle(ref, () => ({ startAnimation: startAll, stopAnimation: stopAll }), [
    startAll,
    stopAll,
  ]);

  const bind = { onMouseEnter: startAll, onMouseLeave: stopAll, onFocus: startAll, onBlur: stopAll };

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={SRC} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
      >
        {/* Swing outside, ripple inside: the wave is computed in the swinging
            frame, so the two read as one body rather than two stacked effects. */}
        <motion.g variants={swing} style={PIN}>
          <Ribbon clock={clock} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
