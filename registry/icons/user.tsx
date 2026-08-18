"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// GLANCE — the head checks left, sweeps across to check right, and comes back
// to centre. Promoted from app/lab/user (variant 2).
//
// NOTHING IS SPLIT HERE, WHICH IS A FIRST FOR THIS SET. Phosphor's `user` is
// already two separate stroked elements — a `<circle>` head and a `<path>`
// shoulder arc, both `fill="none" stroke-width="16"`. There is no compound path
// to cut, so §1's pixel-diff gate does not apply: rest parity is exact BY
// CONSTRUCTION, not by measurement. Verified anyway at 512x512 — 0 flipped
// pixels against the authored glyph.
//
// THE HEAD CANNOT TURN, AND THAT IS WHY THIS SHIFTS INSTEAD OF ROTATING. The
// head is a perfect circle, and a circle rotated about its own centre is itself
// (§3). Rasterised and rotated 25.7° about (128,96) it differs from itself by
// 0.5568% — antialiasing on the rim and nothing else. This is `bicycle`'s wheel
// trap exactly: the rotation is real, costs a transform, and is invisible at any
// speed. A turn would need a face to turn and the mark has none; adding one is
// forbidden by §0 gate 1. So the gesture moves the circle's CENTRE. Do not
// "simplify" this back into a rotation — it will render as nothing.
//
// THE HEAD AND SHOULDERS ARE TANGENT AT REST, WHICH BOUNDS THE AMPLITUDE. The
// circle's lowest point and the shoulder arc's apex are both exactly (128,160):
// the two 16-wide strokes sit on one another there, overlapping by 15.5 units of
// ink. Generous for lateral motion, lethal for vertical. Below 18 units the
// shift is invisible (§2); above ~26 the chin slides off the shoulder apex and
// the neck joint visibly comes apart. 22 is the value that satisfies both — at
// full reach the head's ink lands at x34 / x221.5, inside the wall on both
// sides, and the joint holds 1,517 px of overlap against 3,197 at rest.
//
// THE LIFT IS HELD ACROSS THE SWEEP, NOT PUMPED PER SIDE. The 5-unit rise puts
// the head on a shallow arc instead of a rail (§10) — 5 UNITS, not the 10–20
// SCREEN PIXELS a general UI motion guide would hand you, which is 106 grid
// units and half this artboard (§14). Arcing up to the left, down through
// centre, then up again to the right bobs the head twice and reads as a bounce;
// rising once on the way out, holding while it crosses, and settling once on the
// way home reads as one continuous look.
//
// SYMMETRY IS SAFE HERE. The shoulder arc's second half is an `s` — a smooth
// reflection of the first — and the head is centred on x128, so the mark is
// mirror-symmetric about the centre line to within 0.193% (antialiasing). The
// right extreme is the left extreme's mirror and needs no separate clearance
// budget; measured joint overlap is 1,517 left against 1,514 right. The HOLDS
// are unequal instead (0.14 then 0.12), because §10 wants decaying repeats and
// two identical pauses read as a metronome.
//
// MATERIAL (§9): a person — soft and organic, so easeInOut and a held arc rather
// than the 0% detents a mechanism gets. Nothing here is springy enough to read
// as rubber, which a head on a neck would.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - A HEAD TURN / SPIN. Invisible; see above.
//   - A SHRUG (shoulders lifting toward the ears). The most human gesture
//     available, and it does not survive the tangency: the shoulder apex already
//     touches the chin, so lifting it 18+ units to clear the amplitude floor
//     drives the arc straight through the head. Tried both directions —
//     shoulders up and head down — and both draw a line across the face. §1
//     forbids using opacity to hide a line collision, so there is no rescue.
//   - WIDENING THE SHOULDERS (scaleX) to suggest a breath. Needs ~1.18 to clear
//     the floor at the arc's endpoints, and at that amplitude a person does not
//     read as breathing, they read as inflating.
//   - A DRAW-ON IDENTIFY (head draws, beat, shoulders sweep in). Honest here,
//     since both elements are natively stroked, and it survives as `3 · Identify`
//     in app/lab/user. Not what shipped: it opens on `pathLength: 0`, so frame 0
//     is not the icon (§1), which a persistent avatar in a nav bar cannot afford.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do — the hover replay loop in use-hover is already gated.

/** The glyph's own two elements, untouched. */
const HEAD = { cx: 128, cy: 96, r: 64 };
const SHOULDERS = "M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DUR = 1.3;
const head: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -22, -22, 22, 22, 0],
    y: [0, -5, -5, -5, -5, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.2, 0.34, 0.6, 0.72, 1] },
  },
};

export const UserIcon = forwardRef<IconHandle, IconProps>(function UserIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} {...STROKE} />
          <path d={SHOULDERS} {...STROKE} />
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
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} {...STROKE} variants={head} />
        <path d={SHOULDERS} {...STROKE} />
      </motion.svg>
    </div>
  );
});
