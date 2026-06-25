"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPRING — a horizontal squash with the tail (right) anchored: the arrowhead retracts
// right, then springs back left, overshooting past rest and bouncing to a stop. The
// height never changes — only the length compresses and stretches.
const ARROW =
  "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z";
// The tail (right end of the shaft, x=216) — the squash anchor.
const TAIL = { x: 216 / 256, y: 0.5 };

const squash: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Squash & stretch + anticipation (the deep 0.5 wind-up) + follow-through (the
    // diminishing 1.12 → 0.93 → 1.04 overshoot bounce): rest → squash → stretch past
    // rest → bounce → small overshoot → settle. Deeper than the shared squashStretch()
    // on purpose — an arrow's length reads as elastic, so the recoil is exaggerated.
    scaleX: [1, 0.5, 1.12, 0.93, 1.04, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.26, 0.5, 0.68, 0.85, 1] },
  },
};

export const ArrowLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowLeftIcon(
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
