"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AVOCADO_BODY, AVOCADO_PIT, AVOCADO_PIT_CENTER } from "../avocado-icon";

// v5 — RIPE. The whole performance. The body falls in and lands with a squash, then
// stretches and jiggles to rest (anchored at its base). The pit is heavier, so it
// trails — it tumbles in a beat later, overshoots its size and rocks past true before
// settling dead-centre (overlapping action + follow-through). Soft fruit, real weight.
const BASE = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const PIT_O = {
  transformBox: "view-box" as const,
  originX: AVOCADO_PIT_CENTER.x / 256,
  originY: AVOCADO_PIT_CENTER.y / 256,
};
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const body: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-24, 0, 0, 0, 0],
    scaleY: [0.7, 1.16, 0.93, 1.04, 1],
    scaleX: [1.26, 0.91, 1.06, 0.97, 1],
    opacity: [0, 1, 1, 1, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.3, 0.52, 0.76, 1] },
  },
};
const pit: Variants = {
  normal: { y: 0, scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-34, 0],
    scale: [0.45, 1.22, 1],
    rotate: [-26, 8, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.56, ease: ELASTIC, delay: 0.3, times: [0, 0.62, 1] },
  },
};

export const Avocado5 = forwardRef<IconHandle, IconProps>(function Avocado5({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : body} style={BASE} d={AVOCADO_BODY} />
        <motion.path variants={reduced ? undefined : pit} style={PIT_O} d={AVOCADO_PIT} />
      </motion.svg>
    </div>
  );
});
