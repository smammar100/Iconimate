"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v8 — RISE + WIGGLE. A blend: the coil-and-stick motion is taken from v5 (the rod
// rises from its foot with a sinuous slither — a damping skewX wave), and the head
// motion is taken from v6 (a gentle damping rotation wiggle, instead of v5's hard
// strike). The head waits for the body to stand, then fades in and wiggles to rest.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};

// Body — straight from v5: rise from the foot + slither.
const body: Variants = {
  normal: { scaleY: 1, skewX: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.36, 0.92, 1.05, 0.99, 1],
    skewX: [0, -5, 3.5, -1.5, 0],
    opacity: [0, 1, 1, 1, 1],
    transition: { duration: 0.62, ease: "easeOut", times: [0, 0.32, 0.56, 0.8, 1] },
  },
};
// Head — from v6: hold, then a damping wiggle. A short fade-in keeps it from floating
// above the body while the rod is still rising.
const wiggle: Variants = {
  normal: { rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 9, -5, 2, 0],
    opacity: [0, 1],
    transition: {
      delay: 0.5,
      opacity: { duration: 0.15 },
      rotate: { duration: 0.5, ease: "easeOut", times: [0, 0.2, 0.42, 0.64, 0.82, 1] },
    },
  },
};

export const Asclepius8 = forwardRef<IconHandle, IconProps>(function Asclepius8(
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
        <motion.path variants={reduced ? undefined : body} style={FOOT} d={ASCLEPIUS_BODY} />
        <motion.path variants={reduced ? undefined : wiggle} style={HEAD} d={ASCLEPIUS_HEAD} />
      </motion.svg>
    </div>
  );
});
