"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, squashStretch } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover only the block falls in from above, hits its rest line and rebounds
// UP with diminishing hops before settling. Every keyframe is <= 0 (the rest line) so
// it bounces off the floor and never dips below. The center guide axis holds
// perfectly still and runs the full height behind the block. The block is an outlined
// frame whose interior is filled with the card surface colour (var(--surface)) — so
// it's opaque (the axis never bleeds through) and matches whatever card it sits in.
const AXIS = "M128,32a8,8,0,0,1,8,8V216a8,8,0,0,1-16,0V40A8,8,0,0,1,128,32Z";
const BLOCK_OUTER =
  "M48,80H208a16,16,0,0,1,16,16v64a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V96A16,16,0,0,1,48,80Z";
const BLOCK_INNER = "M48,96H208V160H48Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
// Squash on impact (anchored at the block's leading bottom edge): it compresses the
// instant it meets its rest line, then stretches off the rebound and settles. Flat
// through the fall; the squash rides the bounce on scaleY, sourced from the shared
// squashStretch() vocabulary.
const [, SQ, ST] = squashStretch();
const SQUASH_Y = [1, SQ, ST, 0.97, 1.01, 1];
const SQUASH_TRANSITION: Transition = {
  duration: 0.95,
  times: [0, 0.46, 0.6, 0.74, 0.86, 1],
  ease: "easeOut",
};
const BLOCK_ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 176 / 256 };
const drop: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: BOUNCE_Y,
    scaleY: SQUASH_Y,
    transition: { y: FALL_BOUNCE, scaleY: SQUASH_TRANSITION },
  },
};

export const AlignCenterHorizontalSimpleIcon = forwardRef<IconHandle, IconProps>(
  function AlignCenterHorizontalSimpleIcon({ size = 28, style, ...props }, ref) {
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
          <path d={AXIS} />
          <motion.g variants={reduced ? undefined : drop} style={BLOCK_ANCHOR}>
            <path d={BLOCK_OUTER} />
            <path d={BLOCK_INNER} fill="var(--surface)" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
