"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CLIMB — the plane lifts to altitude with a gentle nose-up pitch, then eases
// back down, smooth and continuous. The contrail trails a beat behind, lagging
// the climb the way vapor hangs in the air the plane has already left.
// Filled Phosphor airplane-in-flight glyph (currentColor).
const PLANE =
  "M248,136v24a8,8,0,0,1-8,8H61.07a39.75,39.75,0,0,1-38.31-28.51L8.69,92.6A16,16,0,0,1,24,72h8a8,8,0,0,1,5.65,2.34L59.32,96H81.81l-9-26.94A16,16,0,0,1,88,48h8a8,8,0,0,1,5.66,2.34L147.32,96H208A40,40,0,0,1,248,136Zm-16,0a24,24,0,0,0-24-24H144a8,8,0,0,1-5.65-2.34L92.69,64H88l12.49,37.47A8,8,0,0,1,92.91,112H56a8,8,0,0,1-5.66-2.34L28.69,88H24l14.07,46.9a23.85,23.85,0,0,0,23,17.1H232Z";
const TRAIL = "M224,216a8,8,0,0,1-8,8H72a8,8,0,1,1,0-16H216A8,8,0,0,1,224,216Z";

const planeClimb: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 0],
    rotate: [0, -5, 0],
    transition: { duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};
const trailClimb: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 0],
    opacity: [1, 0.5, 1],
    transition: { duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.22 },
  },
};

export const AirplaneInFlightIcon = forwardRef<IconHandle, IconProps>(function AirplaneInFlightIcon(
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
          variants={reduced ? undefined : trailClimb}
          style={{ transformBox: "view-box" }}
          d={TRAIL}
        />
        <motion.path
          variants={reduced ? undefined : planeClimb}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.45 }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
