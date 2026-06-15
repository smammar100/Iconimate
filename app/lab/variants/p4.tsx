"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PRESENTATION, PRESENTATION_PIVOT } from "../presentation-icon";

// FLOAT — the whole rig lifts off the floor and bobs, a weightless presentation
// hovering for attention. Loops while hovered.
const float: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -10, 0],
    transition: { duration: 1.4, ease: SWEEP, repeat: Infinity },
  },
};

export const PresV4 = forwardRef<IconHandle, IconProps>(function PresV4(
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
          style={{ transformBox: "view-box", originX: PRESENTATION_PIVOT.x, originY: PRESENTATION_PIVOT.y }}
          d={PRESENTATION}
        />
      </motion.svg>
    </div>
  );
});
