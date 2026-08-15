"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WINGBEAT — the bird's own wing lifts out of its body and beats three times,
// the body rides each beat, and the eye blinks twice. Promoted from
// app/lab/bird (variant 6).
//
// THE WING IS ALREADY IN THE GLYPH. It is the diagonal bar across the belly —
// easy to mistake for a decorative crease, but it is the wing, and it is drawn
// as a detour in the mark's COUNTER subpath:
// `h26.9 l70.94-85.12 a8,8,0,1,1,12.29,10.24 L71.75,208`. That detour makes the
// bar a peninsula of ink protruding into the hollow chest. A lab take drew two
// NEW wings onto the bird's back instead; it was thrown away. Do not re-try it —
// never add geometry a mark already contains.
//
// THE BAR IS A 16-WIDE ROUND-CAPPED STROKE, derived rather than guessed. Its two
// long edges run (50.9,208)->(121.84,122.88) and (134.13,133.12)->(71.75,208),
// so the centreline is (61.33,208)->(127.99,128). The two bottom points are
// 20.85 apart along y=208; projected onto the bar's perpendicular that is 16.02
// — Phosphor's stroke weight exactly. The `a8,8` at the top is a round cap of
// that same 16. So the wing restates as one stroked line, and `BODY` is the mark
// with the detour replaced by a flat hollow floor (`L24,208 H112`).
//
// REST IS THE SOURCE MARK, MEASURED. `BODY` + the stroked wing + the eye differ
// from the authored `d` by 31 of 50,248 ink pixels at 512x512 — 0.062%, all of it
// antialiasing where a stroke edge meets an outline edge. This is not a redraw
// and claims no exception to the fidelity rule.
//
// ONLY THE EYE MAY BE LIFTED OUT VERBATIM. The eye subpath starts `M176,68` —
// ABSOLUTE. The other two start `m64,12` and `m-22.42,0` — RELATIVE, positioned
// by whatever precedes them; copied out as-is the counter renders at x-22.42. So
// `BODY` resolves both by hand: after a `Z` the current point returns to that
// subpath's own start, putting the body at (176+64, 68+12) = (240,80) and the
// counter at (240-22.42, 80) = (217.58, 80). Those two numbers are load-bearing.
//
// THE WING HINGES AT THE SHOULDER (127.99,128), the round-capped end — both the
// anatomically right pivot and the convenient one, since a round cap rotating
// about its own centre is invariant, so the joint never shows a corner.
//
// POSITIVE ROTATION IS UP AND OUT, measured: at +45 the tip clears the body's
// back edge, at +68 the wing stands clear of the outline entirely, which is the
// whole effect. NEGATIVE rotation drives the wing down through the belly floor
// and out of the bottom of the mark, so the down-strokes bottom out at +8 rather
// than passing 0 — the wing returns to its socket and stops there.
//
// NOTHING LEAVES THE ARTBOARD. Worst case is the head under the body's -5 tilt
// and -10 lift, which reaches y3.7, and the wing's tip at +68 sits at (33,84).
// Both are inside the 256 box, so the standard `overflow: hidden` wrapper clips
// nothing — unlike `star` or `airplane-taxiing`, this one needs no margin.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do: the hover replay loop in use-hover is already gated, and one hover plays
// one wingbeat sequence.
const BODY =
  "M240,80a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80ZM217.58,80L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";
/** The mark's own wing, restated as the stroke it already is. */
const WING = "M61.33,208L127.99,128";
/** Subpath 0 verbatim — the one subpath that starts absolute. */
const EYE = "M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Z";
/** The full authored mark, for the reduced-motion static fallback. */
const BIRD =
  "M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Zm64,12a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80Zm-22.42,0L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208h26.9l70.94-85.12a8,8,0,1,1,12.29,10.24L71.75,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const SHOULDER = AT(127.99, 128); // the wing's hinge
const EYE_C = AT(164, 68); // eye centre, r12
const CENTRE = AT(124, 120); // ink bbox centre (x8..240, y16..224)

/**
 * THREE BEATS, DECAYING (68, 58, 48). Wingbeats lose energy; a flat repeat reads
 * as a mechanism. The recoveries climb (8, 12, 16) for the same reason — the wing
 * settles back into its socket rather than slamming to it.
 */
const wing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 68, 8, 58, 12, 48, 16, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.2, 0.34, 0.48, 0.62, 0.74, 0.86, 1],
      ease: "easeInOut",
    },
  },
};
/**
 * THE BODY RIDES, IT DOES NOT DRIVE. Its lift peaks (-8, -10, -7) sit between the
 * wing's down-strokes, so the bird rises on each beat. Give the body a large
 * rotation of its own and it competes with the wing instead of carrying it.
 */
const body: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 2, -10, 2, -7, 0],
    rotate: [0, -5, 3, -5, 2, -3, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.22, 0.36, 0.5, 0.64, 0.78, 1],
      ease: "easeInOut",
    },
  },
};
/**
 * SCALE-Y TO 0.08, NOT TO 0. At 0 the eye vanishes and a hole opens in the head
 * for two frames; at 0.08 the 24-unit circle renders as a ~1.9-unit lens — a
 * closed lid, still ink. The two blinks land in the gaps between wingbeats.
 */
const eye: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.08, 1, 1, 0.08, 1, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.3, 0.35, 0.4, 0.58, 0.63, 0.68, 1],
      ease: ["linear", "easeIn", "easeOut", "linear", "easeIn", "easeOut", "linear"],
    },
  },
};

export const BirdIcon = forwardRef<IconHandle, IconProps>(function BirdIcon(
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
          <path d={BIRD} />
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
        {/* Wing and eye ride inside the body group, so both stay attached to it. */}
        <motion.g variants={body} style={CENTRE}>
          <path d={BODY} />
          <motion.path
            d={WING}
            variants={wing}
            style={SHOULDER}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
          />
          <motion.path d={EYE} variants={eye} style={EYE_C} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
