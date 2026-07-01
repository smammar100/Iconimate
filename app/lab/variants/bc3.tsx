"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE, BC_GROUND } from "../baby-carriage-icon";

// v3 — ROCK. The pram rocks on its wheels, pivoting on the ground contact between them,
// tilting back and forth with decaying amplitude before it settles — the gentle sway of
// soothing a baby. Better than a straight roll: it has weight and a follow-through.
const GROUND = { transformBox: "view-box" as const, transformOrigin: `${BC_GROUND.x}px ${BC_GROUND.y}px` };
const rock: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, -6, 4.5, -3, 1.5, 0],
    transition: { duration: 1.1, times: [0, 0.16, 0.4, 0.62, 0.82, 1], ease: "easeInOut" },
  },
};

export const Bc3 = forwardRef<IconHandle, IconProps>(function Bc3({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : rock} style={GROUND} d={BABY_CARRIAGE} />
      </motion.svg>
    </div>
  );
});
