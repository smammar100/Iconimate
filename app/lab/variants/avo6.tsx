"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AVOCADO_BODY, AVOCADO_PIT, AVOCADO_PIT_CENTER } from "../avocado-icon";

// v6 — DROP & SWAY. The pit falls in and bounces — a real drop with two decaying
// hops — until it comes to rest dead-centre. Meanwhile the body swings like a
// pendulum, pivoting on its bottom point: it rocks left↔right in an arc, each swing
// smaller than the last, and settles at the exact moment the pit lands for good. Both
// run for one shared duration so they come to rest together.
const DUR = 0.95;
// Pivot at the avocado's bottom tip (≈128,232) so the body swings as a pendulum.
const PIVOT = { transformBox: "view-box" as const, originX: 0.5, originY: 232 / 256 };
const PIT_O = {
  transformBox: "view-box" as const,
  originX: AVOCADO_PIT_CENTER.x / 256,
  originY: AVOCADO_PIT_CENTER.y / 256,
};

// Body — a pendulum swing about the bottom point: the rotation angle oscillates and
// damps to zero, so the top of the fruit arcs left and right and slows to rest.
const body: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 8.5, -5.5, 3.4, -1.7, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.26, 0.42, 0.58, 0.74, 0.88, 1] },
  },
};
// Pit — drops from above and bounces (fall → hop → hop) to rest. Falls accelerate
// (easeIn), rises decelerate (easeOut), so it reads as gravity + impacts.
const pit: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-52, 0, -18, 0, -6, 0],
    opacity: [0, 1, 1, 1, 1, 1],
    transition: {
      duration: DUR,
      times: [0, 0.4, 0.56, 0.74, 0.87, 1],
      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
    },
  },
};

export const Avocado6 = forwardRef<IconHandle, IconProps>(function Avocado6({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : body} style={PIVOT} d={AVOCADO_BODY} />
        <motion.path variants={reduced ? undefined : pit} style={PIT_O} d={AVOCADO_PIT} />
      </motion.svg>
    </div>
  );
});
