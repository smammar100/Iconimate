"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WIND — the arrow winds back a few degrees (clockwise anticipation), then whips
// a full counter-clockwise turn and settles with a little overshoot. Turns about
// the ring's center (128,128). Mirror of arrow-clockwise.
const GLYPH =
  "M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z";

const wind: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Anticipation (the +28° wind-back), follow-through + slow-in/out via OVERSHOOT_BACK
    // (the spin eases past -360° then settles — exaggeration on the landing).
    rotate: [0, 28, -360],
    transition: { duration: 0.9, ease: OVERSHOOT_BACK, times: [0, 0.22, 1] },
  },
};

export const ArrowCounterClockwiseIcon = forwardRef<IconHandle, IconProps>(
  function ArrowCounterClockwiseIcon({ size = 28, style, ...props }, ref) {
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
            d={GLYPH}
            variants={reduced ? undefined : wind}
            style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
          />
        </motion.svg>
      </div>
    );
  },
);
