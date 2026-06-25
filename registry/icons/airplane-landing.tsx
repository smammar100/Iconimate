"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ARRIVAL — the plane enters frame from off in the distance (upper-left),
// descending along its approach, and decelerates onto the runway, coming to rest
// exactly at the icon's home pose. The wrapper uses overflow:visible so the craft
// is seen flying in from outside the box. Filled Phosphor airplane-landing glyph.
const PLANE =
  "M229.84,191.7,53.21,142.24A40.12,40.12,0,0,1,24,103.72V48A16,16,0,0,1,45.06,32.82l5.47,1.82a8,8,0,0,1,5,4.87L66.13,68.88,96,77.39V48a16,16,0,0,1,21.06-15.18l5.47,1.82a8,8,0,0,1,4.85,4.5l22.5,53.63,60.84,17A40.13,40.13,0,0,1,240,148.32V184a8,8,0,0,1-10.16,7.7ZM224,148.32a24.09,24.09,0,0,0-17.58-23.13l-64.57-18a8,8,0,0,1-5.23-4.61L114,48.67,112,48V88a8,8,0,0,1-10.19,7.7l-44-12.54a8,8,0,0,1-5.33-5L41.79,48.59,40,48v55.72a24.09,24.09,0,0,0,17.53,23.12L224,173.45Z";
const RUNWAY = "M256,216a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16H248A8,8,0,0,1,256,216Z";

const arrival: Variants = {
  normal: { x: 0, y: 0, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [-220, 0],
    // Follow-through: the craft settles onto the runway with a small weight-transfer
    // dip and nose-up rebound before coming to rest, rather than stopping dead.
    y: [-150, 3, 0],
    rotate: [4, -1.5, 0],
    opacity: [0, 1],
    transition: {
      duration: 1.2,
      times: [0, 0.82, 1],
      ease: ARRIVE, // fast approach, smooth deceleration into rest
      opacity: { duration: 0.3, ease: "easeOut" },
    },
  },
};

export const AirplaneLandingIcon = forwardRef<IconHandle, IconProps>(function AirplaneLandingIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "visible", ...style }}>
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
        <path d={RUNWAY} />
        <motion.path
          variants={reduced ? undefined : arrival}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.45 }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
