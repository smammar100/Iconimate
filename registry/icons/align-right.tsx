"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the left) — a mirror of align-left: on hover the two blocks fly in from
// the left, hit the right baseline and rebound LEFT with diminishing hops before
// settling, the bottom block a beat behind the top. Every keyframe is <= 0 (the rest
// line at the baseline) so they bounce off the wall and never cross it. The right
// baseline holds perfectly still. Phosphor align-right, split into the baseline +
// two hollow blocks; artwork unchanged.
const BASELINE = "M224,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Z";
const BLOCK_TOP =
  "M192,64v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V64A16,16,0,0,1,80,48h96A16,16,0,0,1,192,64Zm-16,0H80v40h96Z";
const BLOCK_BOTTOM =
  "M192,152v40a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H176A16,16,0,0,1,192,152Zm-16,0H40v40H176Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly in from the left (-190) to the baseline (0), rebound left to -34, etc.
const BOUNCE_X = [-190, 0, -34, 0, -12, 0, -4, 0];
// Both blocks land right-edge-first against the right baseline, so squash is anchored
// at their shared right edge (x≈176/256).
const WALL_ANCHOR = { transformBox: "view-box" as const, originX: 176 / 256, originY: 0.5 };
// Squash on impact: the block compresses the instant it meets the wall, then stretches
// off the rebound and settles. Flat through the flight; the squash rides the bounce on
// scaleX, sourced from the shared squashStretch() vocabulary.
const [, SQ, ST] = squashStretch();
const SQUASH_X = [1, SQ, ST, 0.97, 1.01, 1];
const SQUASH_TRANSITION: Transition = {
  duration: 0.95,
  times: [0, 0.46, 0.6, 0.74, 0.86, 1],
  ease: "easeOut",
};
const dropTop: Variants = {
  normal: { x: 0, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    x: BOUNCE_X,
    scaleX: SQUASH_X,
    transition: { x: FALL_BOUNCE, scaleX: SQUASH_TRANSITION },
  },
};
const dropBottom: Variants = {
  normal: { x: 0, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    x: BOUNCE_X,
    scaleX: SQUASH_X,
    transition: {
      x: { ...FALL_BOUNCE, delay: 0.1 },
      scaleX: { ...SQUASH_TRANSITION, delay: 0.1 },
    },
  },
};

export const AlignRightIcon = forwardRef<IconHandle, IconProps>(function AlignRightIcon(
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
        <motion.path variants={reduced ? undefined : dropTop} style={WALL_ANCHOR} d={BLOCK_TOP} />
        <motion.path variants={reduced ? undefined : dropBottom} style={WALL_ANCHOR} d={BLOCK_BOTTOM} />
      </motion.svg>
    </div>
  );
});
