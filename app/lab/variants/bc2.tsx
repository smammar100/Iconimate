"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE } from "../baby-carriage-icon";

// v2 — ROLL IN. The pram rolls in from the left and eases to a stop with a small
// overshoot, as if pushed into frame. Better than a pop because it reads as a wheeled
// thing arriving, not just appearing — direction and momentum.
const rollIn: Variants = {
  normal: { x: 0, opacity: 1, transition: { duration: 0.35, ease: ARRIVE } },
  animate: {
    x: [-68, 6, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.62, times: [0, 0.78, 1], ease: ARRIVE },
  },
};

export const Bc2 = forwardRef<IconHandle, IconProps>(function Bc2({ size = 28, style, ...props }, ref) {
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
      >
        <motion.path variants={reduced ? undefined : rollIn} d={BABY_CARRIAGE} />
      </motion.svg>
    </div>
  );
});
