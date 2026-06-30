"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE, AXE_PIVOT } from "../axe-icon";

// v2 — SWING IN. The axe swings into place: it starts wound back and rotates down to
// rest about the grip, with a little overshoot. Pivoting at the handle butt makes it
// read as a tool being readied, not a flat badge scaling up.
const PIVOT = { transformBox: "view-box" as const, originX: AXE_PIVOT.x / 256, originY: AXE_PIVOT.y / 256 };
const swing: Variants = {
  normal: { rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-38, 0], opacity: [0, 1], transition: { duration: DUR.slow, ease: OVERSHOOT_BACK } },
};

export const Axe2 = forwardRef<IconHandle, IconProps>(function Axe2({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : swing} style={PIVOT} d={AXE} />
      </motion.svg>
    </div>
  );
});
