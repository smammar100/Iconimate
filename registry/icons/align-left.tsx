"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
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
// Both blocks land left-edge-first against the left baseline, so squash is anchored at
// their shared left edge (x≈64/256).
const WALL_ANCHOR = { transformBox: "view-box" as const, originX: 64 / 256, originY: 0.5 };
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
        <motion.path variants={reduced ? undefined : dropTop} style={WALL_ANCHOR} d={BLOCK_TOP} />
        <motion.path variants={reduced ? undefined : dropBottom} style={WALL_ANCHOR} d={BLOCK_BOTTOM} />
      </motion.svg>
    </div>
  );
});
