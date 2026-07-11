"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ASCEND + FLOAT — the full flight. Liftoff with a lean into the climb, then
// a buoyant bob at altitude — riding the air rather than hanging still — with
// gentle counter-tilts, before easing back down to the mooring.
//
// The Phosphor "balloon" glyph splits into its own untouched subpaths:
//   BASE  — envelope + tied nozzle.
//   SHINE — the gloss arc inside the upper right.
// BASE + SHINE is byte-identical to the original path; the whole balloon
// moves as one body about the envelope's center.
const BASE =
  "M128,16a88.1,88.1,0,0,0-88,88c0,23.43,9.4,49.42,25.13,69.5,12.08,15.41,26.5,26,41.91,31.09L96.65,228.85A8,8,0,0,0,104,240h48a8,8,0,0,0,7.35-11.15L149,204.59c15.4-5.07,29.83-15.68,41.91-31.09C206.6,153.42,216,127.43,216,104A88.1,88.1,0,0,0,128,16Zm11.87,208H116.13l6.94-16.19c1.64.12,3.28.19,4.93.19s3.29-.07,4.93-.19Zm38.4-60.37C163.94,181.93,146.09,192,128,192s-35.94-10.07-50.27-28.37C64.12,146.27,56,124,56,104a72,72,0,0,1,144,0C200,124,191.88,146.27,178.27,163.63Z";
const SHINE =
  "M177.32,103.89A8.52,8.52,0,0,1,176,104a8,8,0,0,1-7.88-6.68,41.29,41.29,0,0,0-33.43-33.43,8,8,0,1,1,2.64-15.78,57.5,57.5,0,0,1,46.57,46.57A8,8,0,0,1,177.32,103.89Z";

// Pivot at the envelope's center.
const HEART = { transformBox: "view-box" as const, originX: 0.5, originY: 104 / 256 };

const flight: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // climb → bob (down/up/down at altitude) → descend
    y: [0, -16, -11, -15, -11, 0],
    rotate: [0, 2.5, -1.5, 1.5, -1, 0],
    transition: {
      duration: 1.9,
      ease: "easeInOut",
      times: [0, 0.22, 0.42, 0.6, 0.78, 1],
    },
  },
};

export const BalloonIcon = forwardRef<IconHandle, IconProps>(function BalloonIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BASE} />
          <path d={SHINE} />
        </svg>
      </div>
    );
  }

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
        <motion.g variants={flight} style={HEART}>
          <path d={BASE} />
          <path d={SHINE} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
