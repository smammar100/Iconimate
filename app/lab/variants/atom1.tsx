"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, springPop } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM } from "../atom-icon";

// v1 — SPIN IN. The whole atom scales up while rotating a half-turn, with a springy
// settle. Clean, but the rings and nucleus move as one rigid badge — nothing reads as
// the atom being alive.
const spin: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0, 1], rotate: [-180, 0], opacity: [0, 1], transition: springPop },
};

export const Atom1 = forwardRef<IconHandle, IconProps>(function Atom1({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const center = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
        <motion.path variants={reduced ? undefined : spin} style={center} d={ATOM} />
      </motion.svg>
    </div>
  );
});
