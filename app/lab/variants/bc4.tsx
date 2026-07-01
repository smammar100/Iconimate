"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE, BC_GROUND } from "../baby-carriage-icon";

// v4 — BUMP RIDE. The pram is pushed over a bump: it lurches up with a tilt, bounces on
// its suspension a couple of times with decaying height, and settles. Combines travel,
// vertical bounce and a rocking tilt at once — the liveliest of the rigid-body takes.
const GROUND = { transformBox: "view-box" as const, transformOrigin: `${BC_GROUND.x}px ${BC_GROUND.y}px` };
const bump: Variants = {
  normal: { y: 0, rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    y: [0, -13, 0, -6, 0, -2, 0],
    rotate: [0, -5, 1, -3, 0.5, -1, 0],
    transition: {
      duration: 1.05,
      times: [0, 0.16, 0.34, 0.5, 0.66, 0.82, 1],
      ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
    },
  },
};

export const Bc4 = forwardRef<IconHandle, IconProps>(function Bc4({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : bump} style={GROUND} d={BABY_CARRIAGE} />
      </motion.svg>
    </div>
  );
});
