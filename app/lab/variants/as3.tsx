"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS } from "../asclepius-icon";

// v3 — COIL. The symbol winds into place: it rotates in from a tilt with a small
// overshoot past true, scaling up as it settles — the serpent coiling onto the staff.
// Rotation gives it character the straight rise didn't have.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const coil: Variants = {
  normal: { rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-14, 4, 0],
    scale: [0.78, 1.03, 1],
    opacity: [0, 1, 1],
    transition: { duration: DUR.slow, ease: OVERSHOOT_BACK, times: [0, 0.65, 1] },
  },
};

export const Asclepius3 = forwardRef<IconHandle, IconProps>(function Asclepius3(
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
      >
        <motion.path variants={reduced ? undefined : coil} style={CENTER} d={ASCLEPIUS} />
      </motion.svg>
    </div>
  );
});
