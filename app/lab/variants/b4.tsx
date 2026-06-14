"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PLANE, PLANE_PIVOT } from "../tilt-icon";

// FLOAT — drifting on smooth air: the craft rises and sinks in a slow, easy bob
// with the faintest roll, hanging weightless. Continuous.
const float: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 0, 5, 0],
    rotate: [0, 3, 0, -3, 0],
    transition: { duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};

export const TiltV4 = forwardRef<IconHandle, IconProps>(function TiltV4(
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
        style={{ overflow: "visible" }}
      >
        <motion.path
          variants={reduced ? undefined : float}
          style={{ transformBox: "view-box", originX: PLANE_PIVOT.x, originY: PLANE_PIVOT.y }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
