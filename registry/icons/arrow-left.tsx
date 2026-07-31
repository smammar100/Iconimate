"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TRAVEL — the arrow goes where it points. It accelerates off the left edge, and while it
// is genuinely off-frame it is repositioned to the far right and eases back in to rest.
// A journey, not a rubber band: an arrow that stretches and snaps back in place has gone
// nowhere, and those keyframes would look the same on any glyph in the set.
//
// The mirror of arrow-right: same recipe, opposite direction vector. Direction is the
// only thing that changes across the family.
const ARROW =
  "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z";

// The glyph spans x32..224. -228 puts its trailing edge at -4 (past the 0 edge) and +230
// puts its leading edge at 262, so it is fully invisible at BOTH ends of the jump — which
// is what licenses the reposition. Measured off the path, not guessed.
const OUT = -228;
const BACK = 230;

// Leaving is the one place ease-in is right: a departure does not start at its slowest.
// The return is the set's shared ARRIVE decelerate. Departure takes a third of the
// timeline, the arrival two thirds, so the icon reads as coming home rather than fleeing.
const travel: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, OUT, BACK, 0],
    transition: {
      duration: 0.75,
      // The 0.0001 gap is the jump nobody sees — off-frame at both keyframes.
      times: [0, 0.34, 0.3401, 1],
      ease: ["easeIn", "linear", ARRIVE],
    },
  },
};

export const ArrowLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowLeftIcon(
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
          d={ARROW}
          variants={reduced ? undefined : travel}
          style={{ transformBox: "view-box" }}
        />
      </motion.svg>
    </div>
  );
});
