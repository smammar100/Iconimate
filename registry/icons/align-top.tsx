"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the bottom) — a vertical mirror of align-bottom: on hover the two blocks
// fly up from below, hit the top baseline and rebound DOWN with diminishing hops
// before settling, the right block a beat behind the left. Every keyframe is >= 0
// (the rest line at the baseline) so they bounce off the ceiling and never cross it.
// The top baseline holds perfectly still. Phosphor align-top, split into the baseline
// + two hollow blocks; artwork unchanged.
const BASELINE = "M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40Z";
const BLOCK_LEFT =
  "M120,80V216a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V80A16,16,0,0,1,64,64h40A16,16,0,0,1,120,80Zm-16,0H64V216h40Z";
const BLOCK_RIGHT =
  "M208,80v96a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V80a16,16,0,0,1,16-16h40A16,16,0,0,1,208,80Zm-16,0H152v96h40Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly up from below (+190) to the baseline (0), rebound down to +34, etc.
const BOUNCE_Y = [190, 0, 34, 0, 12, 0, 4, 0];
const dropLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: FALL_BOUNCE },
};
const dropRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: { ...FALL_BOUNCE, delay: 0.1 } },
};

export const AlignTopIcon = forwardRef<IconHandle, IconProps>(function AlignTopIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
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
        <path d={BASELINE} />
        <motion.path variants={reduced ? undefined : dropLeft} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : dropRight} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
