"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PLANE, PLANE_PIVOT } from "../tilt-icon";

// BUZZ — an excitable shudder: the craft jitters with a quick decaying wobble of
// roll and nudge, like a little plane revving to go, then settles.
const buzz: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -6, 5, -4, 3, -1, 0],
    x: [0, 2.5, -2.5, 1.5, -1, 0, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.14, 0.3, 0.46, 0.62, 0.8, 1] },
  },
};

export const TiltV5 = forwardRef<IconHandle, IconProps>(function TiltV5(
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
          variants={reduced ? undefined : buzz}
          style={{ transformBox: "view-box", originX: PLANE_PIVOT.x, originY: PLANE_PIVOT.y }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
