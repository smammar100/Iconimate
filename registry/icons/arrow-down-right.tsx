"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TRAVEL — the arrow goes where it points. It accelerates off the bottom-RIGHT corner,
// and while it is genuinely off-frame it is repositioned past the top-left and eases back
// in to rest. A journey, not a rubber band: an arrow that stretches and snaps back in
// place has gone nowhere, and those keyframes would look the same on any glyph in the set.
//
// A diagonal arrow travels its OWN 45° axis, so x and y move together on one clock — both
// run positive here. Direction is the only per-icon parameter.
const ARROW =
  "M200,88V192a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h84.69L58.34,69.66A8,8,0,0,1,69.66,58.34L184,172.69V88a8,8,0,0,1,16,0Z";

// The glyph spans x50..208 and y50..208. +216 on both axes puts its trailing corner at
// (266,266); -220 puts its leading corner at (-12,-12). It is fully invisible at BOTH ends
// of the jump — which is what licenses the reposition. Measured off the path, not guessed.
const OUT = 216;
const BACK = -220;

// Leaving is the one place ease-in is right: a departure does not start at its slowest.
// The return is the set's shared ARRIVE decelerate. Departure takes a third of the
// timeline, the arrival two thirds, so the icon reads as coming home rather than fleeing.
const travel: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, OUT, BACK, 0],
    y: [0, OUT, BACK, 0],
    transition: {
      duration: 0.75,
      // The 0.0001 gap is the jump nobody sees — off-frame at both keyframes.
      times: [0, 0.34, 0.3401, 1],
      ease: ["easeIn", "linear", ARRIVE],
    },
  },
};

export const ArrowDownRightIcon = forwardRef<IconHandle, IconProps>(function ArrowDownRightIcon(
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
