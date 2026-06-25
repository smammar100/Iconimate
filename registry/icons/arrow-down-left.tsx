"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPRING — a squash with the tail (upper-right) anchored: the arrow compresses
// toward its tail, then springs back out down-left, overshooting past rest and
// bouncing to a stop. (Diagonal arrow → uniform squash so the 45° shape keeps its
// proportions; the down icon squashes vertical-only.)
const ARROW =
  "M197.66,69.66L83.31,184H168a8,8,0,0,1,0,16H64a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v84.69L186.34,58.34a8,8,0,0,1,11.32,11.32Z";
// The tail (free end of the shaft, upper-right ~192,64) — the squash anchor.
const TAIL = { x: 192 / 256, y: 64 / 256 };

const squash: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // Squash & stretch + anticipation (the deep 0.5 wind-up) + follow-through (the
    // diminishing 1.12 → 0.93 → 1.04 overshoot bounce): rest → squash → stretch past
    // rest → bounce → small overshoot → settle. Deeper than the shared squashStretch()
    // on purpose — an arrow's length reads as elastic, so the recoil is exaggerated.
    scale: [1, 0.5, 1.12, 0.93, 1.04, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.26, 0.5, 0.68, 0.85, 1] },
  },
};

export const ArrowDownLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowDownLeftIcon(
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
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : squash}
          style={{ transformBox: "view-box", originX: TAIL.x, originY: TAIL.y }}
        />
      </motion.svg>
    </div>
  );
});
