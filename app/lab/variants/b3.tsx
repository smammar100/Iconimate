"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PLANE, PLANE_PIVOT } from "../tilt-icon";

// ZOOM — the craft darts forward along its heading (up and to the right), swelling
// a touch with speed, then eases back to rest. A quick jet away and home.
const zoom: Variants = {
  normal: { x: 0, y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 20, 0],
    y: [0, -20, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.85, ease: ARRIVE, times: [0, 0.45, 1] },
  },
};

export const TiltV3 = forwardRef<IconHandle, IconProps>(function TiltV3(
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
          variants={reduced ? undefined : zoom}
          style={{ transformBox: "view-box", originX: PLANE_PIVOT.x, originY: PLANE_PIVOT.y }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
