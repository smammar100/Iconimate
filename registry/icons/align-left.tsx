"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the right) — a horizontal take on the align-bottom drop: on hover the
// two blocks fly in from the right, hit the left baseline and rebound RIGHT with
// diminishing hops before settling, the bottom block a beat behind the top. Every
// keyframe is >= 0 (the rest line at the baseline) so they bounce off the wall and
// never cross it. The left baseline holds perfectly still. Phosphor align-left,
// split into the baseline + two hollow blocks; artwork unchanged.
const BASELINE = "M48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Z";
const BLOCK_TOP =
  "M64,104V64A16,16,0,0,1,80,48h96a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H80A16,16,0,0,1,64,104Zm16,0h96V64H80Z";
const BLOCK_BOTTOM =
  "M232,152v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H216A16,16,0,0,1,232,152Zm-16,40V152H80v40H216Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly in from the right (+190) to the baseline (0), rebound right to +34, etc.
const BOUNCE_X = [190, 0, 34, 0, 12, 0, 4, 0];
const dropTop: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: BOUNCE_X, transition: FALL_BOUNCE },
};
const dropBottom: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: BOUNCE_X, transition: { ...FALL_BOUNCE, delay: 0.1 } },
};

export const AlignLeftIcon = forwardRef<IconHandle, IconProps>(function AlignLeftIcon(
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
        <motion.path variants={reduced ? undefined : dropTop} d={BLOCK_TOP} />
        <motion.path variants={reduced ? undefined : dropBottom} d={BLOCK_BOTTOM} />
      </motion.svg>
    </div>
  );
});
