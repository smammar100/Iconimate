"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LOCK ON — the glasses sweep right, hold, sweep across to the left, hold,
// settle back to centre, and only then magnify: the order the actions actually
// happen in. You find the thing first, then you look closer at it.
//
// ANATOMY, measured off the rendered fill at 4x:
//
//   mark      x16..239.75, y40..215.75
//   lenses    two counters, r32 about (64,168) and (192,168) — clean circles,
//             each sitting inside an r48 barrel end
//
// THE APERTURE IS DRAWN ADDITIVELY, AND THAT IS THE ONE STRUCTURAL DECISION.
// The obvious way to animate a lens stopping down is to rebuild the body with
// its counters removed and punch them back with a mask, so the punch can then be
// animated. Measured, that construction costs 146 INK FLIPS against the original
// at rest — a path's own counter and a mask punch antialias their rims
// differently, and the two do not sum to the same edge. Small, but it is a
// RESTING icon paying for something only the animation needs.
//
// So the body is never touched. The full glyph is drawn exactly as authored and
// the iris is an ANNULUS laid inside the existing hole: outer r32 matching the
// counter, inner radius animating. Closing the aperture only ever ADDS ink into
// a hole that is already there, and rest is the untouched mark.
//
// A ZERO-AREA ANNULUS IS NOT NOTHING. Its outer and inner rims coincide, and
// coincident opposite-wound edges do not cancel in rasterisation the way they do
// in theory — painted opaque at rest it costs 28 ink flips, a faint ring around
// each lens. So opacity is 0 wherever the ring is degenerate, and both fades sit
// where the inner radius is within a third of a unit of the outer, i.e. already
// thinner than a pixel at ship size. Neither transition can be seen.
//
// The inner circle floors at r10 rather than 0: `a0,0,...` is a degenerate arc
// that SVG renders as a line, and a pupil that vanishes entirely reads as the
// lens filling in solid rather than as a stop.
const BINOCULARS =
  "M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z";

const LENS = [
  { cx: 64, cy: 168 },
  { cx: 192, cy: 168 },
];
const R = 32;
const SHUT = 10;
/** Sub-pixel ring — safe to fade across. */
const OPEN = R * 0.99;

/** An annulus inside a lens counter: outer r32, inner `ri`, opposite windings so
 *  nonzero leaves the pupil open. Identical command skeleton at every radius,
 *  which is the condition for `d` to interpolate at all. */
const iris = (cx: number, cy: number, ri: number) =>
  `M${cx - R},${cy}a${R},${R},0,1,0,${2 * R},0a${R},${R},0,1,0,${-2 * R},0Z` +
  `M${cx - ri},${cy}a${ri},${ri},0,1,1,${2 * ri},0a${ri},${ri},0,1,1,${-2 * ri},0Z`;

/** C2 ramp — zero velocity AND zero acceleration at both ends, so a ramp can
 *  butt straight against a hold with no corner at the join. */
const step = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};
const rampAt = (s: number, s0: number, s1: number, a: number, b: number) =>
  a + (b - a) * step((s - s0) / (s1 - s0));

/**
 * THE SMOOTHNESS IS IN THE SAMPLING AND IN THE RAMP LENGTHS, not in the easing.
 * Hand-placed keyframes with a per-segment ease have motion easing BETWEEN
 * keyframes, so every junction drops the velocity to nothing and starts it
 * again. On a gesture that already contains deliberate dead stops that is fatal:
 * the intentional holds and the accidental ones stop being distinguishable and
 * the whole thing reads as hesitant rather than as decisive-then-still.
 *
 * Sampling fixed the scale track — 72% less jerk — and left the SWEEP untouched,
 * because the sweep's harshness was never coming from junctions. It was the
 * moves themselves. Measured over the whole gesture:
 *
 *   16 units, ramps 0.12 / 0.14 ... jerk 0.113, peak speed 3.78
 *   14 units, ramps 0.22 / 0.22 ... jerk 0.045, peak speed 2.00
 *
 * So the ramps were lengthened and the swing eased from 16 to 14: 60% less jerk
 * and 47% off the peak speed, with the shape untouched.
 *
 * ROTATION IS DERIVED FROM POSITION rather than keyed alongside it. Leaning is a
 * consequence of aiming, so `lockR` is simply `lockX` scaled — the two cannot
 * drift apart and there is one fewer track to keep in sync.
 */
const N = 60;
const clock = Array.from({ length: N + 1 }, (_, k) => k / N);
const DUR = 2.0;
const SWING = 14;

/** Right, hold, across to the left, hold, back to centre, still. */
const lockX = (s: number) =>
  s < 0.02 ? 0
  : s < 0.24 ? rampAt(s, 0.02, 0.24, 0, SWING)
  : s < 0.32 ? SWING
  : s < 0.54 ? rampAt(s, 0.32, 0.54, SWING, -SWING)
  : s < 0.6 ? -SWING
  : s < 0.72 ? rampAt(s, 0.6, 0.72, -SWING, 0)
  : 0;
const lockR = (s: number) => (-3.2 * lockX(s)) / SWING;
/**
 * Magnification, entirely INSIDE the final hold. Once centred, x and rotate are
 * flat while the scale climbs underneath them — letting the position drift
 * during the magnification would read as the instrument being moved again,
 * which is precisely what somebody who has just found their target does not do.
 */
const lockS = (s: number) =>
  s < 0.72 ? 1
  : s < 0.84 ? rampAt(s, 0.72, 0.84, 1, 1.14)
  : s < 0.9 ? 1.14
  : rampAt(s, 0.9, 1, 1.14, 1);

/**
 * THE IRIS TRAILS THE SCALE, deliberately. The lens compensating for the light
 * it loses is a CONSEQUENCE of the zoom, so it has to arrive after it: the scale
 * peaks at 0.842 and the stop bottoms at 0.880. Aligned, the two would read as
 * one keyframe and the causal order would be lost.
 */
const lockRi = (s: number) =>
  s < 0.74 ? R
  : s < 0.88 ? rampAt(s, 0.74, 0.88, R, SHUT)
  : s < 0.97 ? rampAt(s, 0.88, 0.97, SHUT, OPEN)
  : rampAt(s, 0.97, 1, OPEN, R);
const lockOp = (s: number) =>
  s < 0.02 ? step(s / 0.02)
  : s > 0.985 ? 1 - step((s - 0.985) / 0.015)
  : 1;

const body: Variants = {
  normal: { x: 0, rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    x: clock.map((s) => +lockX(s).toFixed(3)),
    rotate: clock.map((s) => +lockR(s).toFixed(3)),
    scale: clock.map((s) => +lockS(s).toFixed(4)),
    transition: { duration: DUR, times: clock, ease: "linear" },
  },
};
const lens = (i: number): Variants => ({
  normal: { d: iris(LENS[i].cx, LENS[i].cy, R), opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    d: clock.map((s) => iris(LENS[i].cx, LENS[i].cy, +lockRi(s).toFixed(3))),
    opacity: clock.map((s) => +lockOp(s).toFixed(3)),
    transition: { duration: DUR, delay: i * 0.06, times: clock, ease: "linear" },
  },
});

export const BinocularsIcon = forwardRef<IconHandle, IconProps>(function BinocularsIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d={BINOCULARS} />
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
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        {/* The irises ride INSIDE the body group, so they cannot drift off their
            own lenses while it sweeps, leans and magnifies. */}
        <motion.g
          variants={body}
          style={{ transformBox: "view-box", originX: 0.5, originY: 168 / 256 }}
        >
          <path d={BINOCULARS} />
          {LENS.map((_, i) => (
            <motion.path key={i} d="" variants={lens(i)} />
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
