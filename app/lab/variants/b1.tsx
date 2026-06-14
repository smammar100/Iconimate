"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PLANE, PLANE_PIVOT } from "../tilt-icon";

// LOOP — a full clockwise barrel roll: the craft tucks in slightly and spins one
// complete turn clockwise about its centre, swelling back out as it comes around
// to rest. One clean 360.
const loopCw: Variants = {
  // no rotate in normal: on hover-out the craft holds (360° ≡ rest) instead of
  // un-spinning counter-clockwise back to 0.
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 360],
    scale: [1, 0.9, 1.06, 1],
    transition: { duration: 1, ease: "easeInOut" },
  },
};

export const TiltV1 = forwardRef<IconHandle, IconProps>(function TiltV1(
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
          variants={reduced ? undefined : loopCw}
          style={{ transformBox: "view-box", originX: PLANE_PIVOT.x, originY: PLANE_PIVOT.y }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
