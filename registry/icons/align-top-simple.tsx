"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the bottom) — matches align-top: on hover the block flies up from below,
// hits the top baseline and rebounds DOWN with diminishing hops before settling.
// Every keyframe is >= 0 (the rest line at the baseline) so it bounces off the
// ceiling and never crosses it. The top baseline holds perfectly still. Phosphor
// align-top-simple, split into the baseline + one hollow block; artwork unchanged.
const BASELINE = "M208,32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,32Z";
const BLOCK =
  "M176,72V224a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16V72A16,16,0,0,1,96,56h64A16,16,0,0,1,176,72Zm-16,0H96V224h64Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly up from below (+190) to the baseline (0), rebound down to +34, etc.
const BOUNCE_Y = [190, 0, 34, 0, 12, 0, 4, 0];
// The block lands top-edge-first against the top baseline, so squash is anchored at
// its top edge (y≈56/256).
const TOP_ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 56 / 256 };
// Squash on impact: the block compresses the instant it meets the baseline, then
// stretches off the rebound and settles. Flat through the flight; the squash rides
// the bounce on scaleY, sourced from the shared squashStretch() vocabulary.
const [, SQ, ST] = squashStretch();
const SQUASH_Y = [1, SQ, ST, 0.97, 1.01, 1];
const SQUASH_TRANSITION: Transition = {
  duration: 0.95,
  times: [0, 0.46, 0.6, 0.74, 0.86, 1],
  ease: "easeOut",
};
const drop: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: BOUNCE_Y,
    scaleY: SQUASH_Y,
    transition: { y: FALL_BOUNCE, scaleY: SQUASH_TRANSITION },
  },
};

export const AlignTopSimpleIcon = forwardRef<IconHandle, IconProps>(function AlignTopSimpleIcon(
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
        <motion.path variants={reduced ? undefined : drop} style={TOP_ANCHOR} d={BLOCK} />
      </motion.svg>
    </div>
  );
});
