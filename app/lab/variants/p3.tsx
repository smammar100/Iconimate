"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { STAND, BOARD } from "../presentation-icon";

// TAP — a presenter gestures at the board: it rocks once off the top of the
// easel, like a pointer tapping the corner. Pivots about the stand apex.
// (Four keyframes, so a duration curve — springs allow only two.)
const APEX = { x: 0.5, y: 0.672 }; // top of the easel triangle (y≈172/256)
const tap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -8, 5, 0], transition: { duration: 0.6, ease: ARRIVE } },
};

export const PresV3 = forwardRef<IconHandle, IconProps>(function PresV3(
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
        <path d={STAND} />
        <motion.path
          variants={reduced ? undefined : tap}
          style={{ transformBox: "view-box", originX: APEX.x, originY: APEX.y }}
          d={BOARD}
        />
      </motion.svg>
    </div>
  );
});
