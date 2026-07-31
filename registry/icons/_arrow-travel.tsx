"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TRAVEL — shared engine for the arrow-fat family.
//
// The arrow goes where it points: it accelerates off the edge it aims at, and while it is
// GENUINELY off-frame it is repositioned to the far side and eases back in to rest. A
// journey, not a rubber band. The previous recipe stretched each arrow in place on one
// anchored axis — an arrow that elongates and snaps back has gone nowhere, and those
// keyframes would look the same pasted onto any glyph in the set.
//
// Direction is the only per-icon parameter, which is what makes twelve icons one recipe.

export type TravelDir = "up" | "down" | "left" | "right";

/**
 * Travel vectors per direction, in view-box units.
 *
 * Derived by measuring every arrow-fat glyph's rendered bounding box, not by eye. The
 * family is uniform per direction: down spans y32..240, up y16..224, left x16..224,
 * right x32..240 — the plain, `-line-` and `-lines-` variants of a direction share a box,
 * because the extra bars sit across the shaft rather than beyond the tip.
 *
 * `out` clears the leading edge past the far side of the 256 box; `back` puts the glyph
 * fully outside the opposite side. Both ends of the jump are off-frame, which is the whole
 * licence for repositioning mid-gesture — get either wrong and the arrow visibly teleports.
 */
const VECTORS: Record<TravelDir, { axis: "x" | "y"; out: number; back: number }> = {
  // exits at y264 (min 32 + 232), returns from y-8 (max 240 - 248)
  down: { axis: "y", out: 232, back: -248 },
  // exits at y-8 (max 224 - 232), returns from y264 (min 16 + 248)
  up: { axis: "y", out: -232, back: 248 },
  // exits at x-8 (max 224 - 232), returns from x264 (min 16 + 248)
  left: { axis: "x", out: -232, back: 248 },
  // exits at x264 (min 32 + 232), returns from x-8 (max 240 - 248)
  right: { axis: "x", out: 232, back: -248 },
};

// Leaving is the one place ease-in is right: a departure does not start at its slowest.
// The return is the set's shared ARRIVE decelerate. Departure takes a third of the
// timeline, the arrival two thirds, so the icon reads as coming home rather than fleeing.
// The 0.0001 gap between the middle keyframes is the jump nobody sees.
const TRANSITION: Transition = {
  duration: 0.75,
  times: [0, 0.34, 0.3401, 1],
  ease: ["easeIn", "linear", ARRIVE],
};

/** Build an arrow icon that travels off the edge it points at and returns from the far side. */
export function makeArrowTravel(d: string, dir: TravelDir) {
  const { axis, out, back } = VECTORS[dir];
  const keys = [0, out, back, 0];
  const travel: Variants =
    axis === "x"
      ? { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: keys, transition: TRANSITION } }
      : { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: keys, transition: TRANSITION } };

  return forwardRef<IconHandle, IconProps>(function ArrowTravelIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    return (
      // overflow:hidden is load-bearing here, not cosmetic — it is the clip that hides the
      // reposition. Without it the arrow is visibly teleported across the frame.
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          initial="normal"
          animate={controls}
        >
          <motion.path
            d={d}
            variants={reduced ? undefined : travel}
            style={{ transformBox: "view-box" }}
          />
        </motion.svg>
      </div>
    );
  });
}
