"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE, AXE_PIVOT } from "../axe-icon";

// v3 — CHOP. A real swing: the axe winds back (anticipation), then drives down fast
// past rest and settles. Pivoting on the grip, the blade arcs through a chop. The
// accelerate-on-the-way-down timing gives the swing its snap.
const PIVOT = { transformBox: "view-box" as const, originX: AXE_PIVOT.x / 256, originY: AXE_PIVOT.y / 256 };
const chop: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -22, 14, 0],
    transition: { duration: 0.66, times: [0, 0.34, 0.6, 1], ease: ["easeOut", "easeIn", "easeOut"] },
  },
};

export const Axe3 = forwardRef<IconHandle, IconProps>(function Axe3({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : chop} style={PIVOT} d={AXE} />
      </motion.svg>
    </div>
  );
});
