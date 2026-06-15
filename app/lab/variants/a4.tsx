"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALARM, ALARM_PIVOT } from "../alarm-icon";

// JOLT — the clock physically hops in place, a frantic little buzz that skitters
// left-right and bounces, like the thing is trying to wake you. Loops with a rest.
const jolt: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -7, 7, -6, 6, -3, 3, 0],
    y: [0, 2, -2, 3, -3, 1, -1, 0],
    transition: { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 },
  },
};

export const AlarmV4 = forwardRef<IconHandle, IconProps>(function AlarmV4(
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
          variants={reduced ? undefined : jolt}
          style={{ transformBox: "view-box", originX: ALARM_PIVOT.x, originY: ALARM_PIVOT.y }}
          d={ALARM}
        />
      </motion.svg>
    </div>
  );
});
