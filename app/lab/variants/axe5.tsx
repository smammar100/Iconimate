"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE, AXE_IMPACT, AXE_PIVOT } from "../axe-icon";

// v5 — CHOP + SPARK. The full hit. The axe winds back, drives down and bites with a
// recoil, and at the exact moment of contact a starburst of sparks flies off the blade
// — short chips that flash out and vanish. Anticipation, impact, follow-through, and a
// little debris: the most satisfying swing of the set. The keeper.
const PIVOT = { transformBox: "view-box" as const, originX: AXE_PIVOT.x / 256, originY: AXE_PIVOT.y / 256 };
const SPARK_O = { transformBox: "view-box" as const, originX: AXE_IMPACT.x / 256, originY: AXE_IMPACT.y / 256 };
const SPARK_ANGLES = [-150, -115, -80, -45, -10, 30];

const chop: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -24, 16, -6, 3, 0],
    y: [0, 0, 4, 0, 0, 0],
    transition: { duration: 0.8, times: [0, 0.28, 0.5, 0.66, 0.83, 1], ease: ["easeOut", "easeIn", "easeOut", "easeInOut", "easeOut"] },
  },
};
// Sparks — hidden until impact (~0.5), then a quick flash that scales out and fades.
const spark: Variants = {
  normal: { scale: 0.4, opacity: 0, transition: { duration: 0.15 } },
  animate: {
    scale: [0.4, 0.4, 1.2, 1.5],
    opacity: [0, 0, 1, 0],
    transition: { duration: 0.8, times: [0, 0.5, 0.66, 0.86], ease: "easeOut" },
  },
};

export const Axe5 = forwardRef<IconHandle, IconProps>(function Axe5({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const { x: ix, y: iy } = AXE_IMPACT;
  const sparks = SPARK_ANGLES.map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { x1: ix + 7 * Math.cos(a), y1: iy + 7 * Math.sin(a), x2: ix + 22 * Math.cos(a), y2: iy + 22 * Math.sin(a) };
  });

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
        {!reduced && (
          <motion.g variants={spark} style={SPARK_O} stroke="currentColor" strokeWidth={8} strokeLinecap="round">
            {sparks.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
            ))}
          </motion.g>
        )}
      </motion.svg>
    </div>
  );
});
