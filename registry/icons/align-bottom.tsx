"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover the two blocks fall in from above, hit the baseline and bounce
// back UP with diminishing hops before coming to rest, the right one a beat behind
// the left. Every keyframe is <= 0 (the rest line), so the blocks rebound off the
// base and never dip below it. Bottoms stay aligned throughout; the baseline holds
// still. Filled Phosphor align-bottom glyph (currentColor) — artwork unchanged.
const BASELINE = "M224,216a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,216Z";
const BLOCK_LEFT =
  "M48,176V40A16,16,0,0,1,64,24h40a16,16,0,0,1,16,16V176a16,16,0,0,1-16,16H64A16,16,0,0,1,48,176ZM64,176h40V40H64Z";
const BLOCK_RIGHT =
  "M136,176V80a16,16,0,0,1,16-16h40a16,16,0,0,1,16,16v96a16,16,0,0,1-16,16H152A16,16,0,0,1,136,176ZM152,176h40V80H152Z";

// Origin at the blocks' shared bottom edge (y≈192/256) so nothing leaves the line.
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.75 };

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
// Squash on impact (anchored at the landed bottom edge via ORIGIN): the block
// compresses the instant it meets the baseline, then stretches off the rebound and
// settles. Flat through the fall; the squash keyframes ride the bounce on scaleY,
// sourced from the shared squashStretch() vocabulary.
const [, SQ, ST] = squashStretch();
const SQUASH_Y = [1, SQ, ST, 0.97, 1.01, 1];
const SQUASH_TRANSITION: Transition = {
  duration: 0.95,
  times: [0, 0.46, 0.6, 0.74, 0.86, 1],
  ease: "easeOut",
};
const dropLeft: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: BOUNCE_Y,
    scaleY: SQUASH_Y,
    transition: { y: FALL_BOUNCE, scaleY: SQUASH_TRANSITION },
  },
};
const dropRight: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: BOUNCE_Y,
    scaleY: SQUASH_Y,
    transition: {
      y: { ...FALL_BOUNCE, delay: 0.1 },
      scaleY: { ...SQUASH_TRANSITION, delay: 0.1 },
    },
  },
};

export const AlignBottomIcon = forwardRef<IconHandle, IconProps>(function AlignBottomIcon(
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
        <motion.path variants={reduced ? undefined : dropLeft} style={ORIGIN} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : dropRight} style={ORIGIN} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
