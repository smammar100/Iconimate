"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PRESENTATION, PRESENTATION_PIVOT } from "../presentation-icon";

// POP — the whole stand-and-board springs forward with a little overshoot, the
// way a slide deck snaps to the front of the room. One confident pop, then settle.
// (Three keyframes, so a duration curve rather than a spring — springs allow only two.)
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 1.14, 1], transition: { duration: 0.42, ease: ARRIVE } },
};

export const PresV2 = forwardRef<IconHandle, IconProps>(function PresV2(
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
          variants={reduced ? undefined : pop}
          style={{ transformBox: "view-box", originX: PRESENTATION_PIVOT.x, originY: PRESENTATION_PIVOT.y }}
          d={PRESENTATION}
        />
      </motion.svg>
    </div>
  );
});
