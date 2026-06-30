"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM } from "../atom-icon";

// v4 — TUMBLE. The atom spins in through 3D space: it swings around the vertical axis
// (rotateY) from nearly edge-on, with a little Z-twist and a perspective so the rings
// flatten and open out as it turns to face you. It reads as a real object rotating in
// space, not a flat icon scaling up.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5, transformPerspective: 520 };
const tumble: Variants = {
  normal: { rotateY: 0, rotateZ: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [-200, 0],
    rotateZ: [-40, 0],
    scale: [0.7, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.85, ease: ARRIVE, opacity: { duration: 0.25 } },
  },
};

export const Atom4 = forwardRef<IconHandle, IconProps>(function Atom4({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : tumble} style={CENTER} d={ATOM} />
      </motion.svg>
    </div>
  );
});
