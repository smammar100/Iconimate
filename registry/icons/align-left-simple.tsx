"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP (from the right) — matches align-left: on hover the block flies in from the
// right, hits the left baseline and rebounds RIGHT with diminishing hops before
// settling. Every keyframe is >= 0 (the rest line at the baseline) so it bounces off
// the wall and never crosses it. The left baseline holds perfectly still. Phosphor
// align-left-simple, split into the baseline + one hollow block; artwork unchanged.
const BASELINE = "M40,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0Z";
const BLOCK =
  "M240,96v64a16,16,0,0,1-16,16H72a16,16,0,0,1-16-16V96A16,16,0,0,1,72,80H224A16,16,0,0,1,240,96Zm-16,64V96H72v64H224Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fly in from the right (+190) to the baseline (0), rebound right to +34, etc.
const BOUNCE_X = [190, 0, 34, 0, 12, 0, 4, 0];
// The block lands left-edge-first against the left baseline, so squash is anchored at
// its left edge (x≈56/256).
const WALL_ANCHOR = { transformBox: "view-box" as const, originX: 56 / 256, originY: 0.5 };
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

export const AlignLeftSimpleIcon = forwardRef<IconHandle, IconProps>(function AlignLeftSimpleIcon(
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
