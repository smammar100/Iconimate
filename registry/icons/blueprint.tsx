"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW & SNAP — the paper draws itself, and the moment it is finished the grid
// flies in and snaps onto it. Promoted from app/lab/blueprint (variant 6, which
// composes that page's `2 · Draw` with its `3 · Snap`).
//
// THIS MARK IS STROKED, NOT FILLED, AND THAT IS WHY THIS GESTURE IS HONEST HERE.
// `bird`, `heart` and `star` are filled compound paths: there is no stroke to run
// a dash along, so "drawing" them means faking it with clips. Every element here
// is already `fill="none" stroke="currentColor" stroke-width="16"`, so
// `pathLength` is native and free. Do not port this gesture to a filled icon.
//
// THE COMPOSITION IS THE POINT. Drawn by one pen, the sheet and grid read as a
// single continuous act of drawing. Snapped in together, the sheet is a given and
// only the grid is placed. Doing the sheet with the pen and the grid with the
// snap gives what neither has alone: paper is DRAWN, marks are PLACED — two
// different tools, in the right order.
//
// THE HANDOFF IS THE ONLY REAL TUNING DECISION. The pen lands at 0.50 and the
// first line begins its approach at 0.54. That 4% beat of stillness is what makes
// the paper visibly exist before anything lands on it; start the snap earlier and
// the lines fly toward a sheet still being drawn, which reads as two animations
// colliding rather than one handing off to the other.
//
// THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION. Every element here is
// round-capped, and a round-capped stroke at `pathLength: 0` renders a full
// 16-wide DOT parked at its start point — so without them the sheet shows a blob
// at (24,176) and, in the lab's other draw variants, four dots sit on the paper
// through the whole hold. (`bell-simple-slash` documents the same trap.) The two
// cases need DIFFERENT remedies and must not be merged:
//   - the OUTLINE gets a fast, separate tween (up over the first 0.05). Fading it
//     across its whole draw would hold the finished part of the line
//     semi-transparent for a full second.
//   - the GRID lines fade across their own approach, which is already what the
//     snap does, so it costs nothing.
// Butt caps would also kill the dots, at the cost of flat-ending every line.
//
// EACH LINE ENTERS ALONG ITS OWN AXIS — verticals from above and below,
// horizontals from left and right. A line entering across its own length reads as
// a wipe; entering along it reads as a part being placed. The overshoot is small
// and the settle fast (-6% and out): blueprint lines land on a measurement, and a
// springy bounce reads as jelly.
//
// THE RIGHT-HAND LINE STARTS OFF-CANVAS (x104..192 shifted +80 reaches x272,
// past the 256 wall) and the wrapper keeps `overflow: hidden`, so it is clipped
// until it enters. That is deliberate: it fades in while travelling, so only the
// faint leading frames are clipped, and nothing paints outside the box at rest.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do — the hover replay loop in use-hover is already gated.
const MARK = "M24,176V64A24,24,0,0,1,48,40H64V152H48a24,24,0,0,0,0,48H232V64H64";

/** The four grid lines: verticals at x128/x168, horizontals at y112/y144. */
const GRID = [
  { x1: 128, y1: 96, x2: 128, y2: 160 },
  { x1: 168, y1: 96, x2: 168, y2: 160 },
  { x1: 104, y1: 112, x2: 192, y2: 112 },
  { x1: 104, y1: 144, x2: 192, y2: 144 },
];

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DUR = 1.9;

const sheet: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: DUR, times: [0, 0.5], ease: "easeInOut" },
      opacity: { duration: DUR, times: [0, 0.05], ease: "linear" },
    },
  },
};

/** Enters from (dx, dy), holding off-frame until `delay`, then settling. */
function snapFrom(dx: number, dy: number, delay: number): Variants {
  return {
    normal: { x: 0, y: 0, opacity: 1, transition: RETURN_TRANSITION },
    animate: {
      x: [dx, dx, -dx * 0.06, 0, 0],
      y: [dy, dy, -dy * 0.06, 0, 0],
      opacity: [0, 0, 1, 1, 1],
      transition: {
        duration: DUR,
        times: [0, delay, Math.min(delay + 0.22, 0.94), Math.min(delay + 0.32, 0.98), 1],
        ease: ["linear", [0.2, 0.9, 0.3, 1], "easeOut", "linear"],
      },
    },
  };
}
// 0.08 apart, tighter than a snap-only pass would be, because the grid has only
// the back half of the cycle to finish in.
const SNAPS = [snapFrom(0, -70, 0.54), snapFrom(0, 70, 0.62), snapFrom(-80, 0, 0.7), snapFrom(80, 0, 0.78)];

export const BlueprintIcon = forwardRef<IconHandle, IconProps>(function BlueprintIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
          <g {...STROKE}>
            <path d={MARK} />
            {GRID.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </g>
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
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <g {...STROKE}>
          {/* The pen draws the sheet; the grid is placed onto it afterwards. */}
          <motion.path d={MARK} variants={sheet} />
          {GRID.map((l, i) => (
            <motion.line key={i} {...l} variants={SNAPS[i]} />
          ))}
        </g>
      </motion.svg>
    </div>
  );
});
