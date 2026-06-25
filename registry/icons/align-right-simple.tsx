"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the left) — matches align-right: on hover the block flies in from the
// left, hits the right baseline and rebounds LEFT with diminishing hops before
// settling. Every keyframe is <= 0 (the rest line at the baseline) so it bounces off
// the wall and never crosses it. The right baseline holds perfectly still. Phosphor
// align-right-simple, split into the baseline + one hollow block; artwork unchanged.
const BASELINE = "M232,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0Z";
const BLOCK =
  "M200,96v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V96A16,16,0,0,1,32,80H184A16,16,0,0,1,200,96Zm-16,0H32v64H184Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly in from the left (-190) to the baseline (0), rebound left to -34, etc.
const BOUNCE_X = [-190, 0, -34, 0, -12, 0, -4, 0];
// The block lands right-edge-first against the right baseline, so squash is anchored
// at its right edge (x≈184/256).
const WALL_ANCHOR = { transformBox: "view-box" as const, originX: 184 / 256, originY: 0.5 };
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
const drop: Variants = {
  normal: { x: 0, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    x: BOUNCE_X,
    scaleX: SQUASH_X,
    transition: { x: FALL_BOUNCE, scaleX: SQUASH_TRANSITION },
  },
};

export const AlignRightSimpleIcon = forwardRef<IconHandle, IconProps>(function AlignRightSimpleIcon(
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
        <motion.path variants={reduced ? undefined : drop} style={WALL_ANCHOR} d={BLOCK} />
      </motion.svg>
    </div>
  );
});
