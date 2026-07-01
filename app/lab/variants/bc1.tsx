"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, springPop } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE } from "../baby-carriage-icon";

// v1 — POP. The plainest take: the whole pram springs in from nothing with a soft
// overshoot. No travel, no character beyond the spring — the family's baseline.
const pop: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0, 1], opacity: [0, 1], transition: springPop },
};

export const Bc1 = forwardRef<IconHandle, IconProps>(function Bc1({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : pop} style={center} d={BABY_CARRIAGE} />
      </motion.svg>
    </div>
  );
});
