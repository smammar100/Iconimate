"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALARM, ALARM_PIVOT } from "../alarm-icon";

// PULSE — the clock breathes, swelling and shrinking on a calm loop, like a quiet
// reminder waiting to be noticed.
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.1, 1],
    transition: { duration: 1.1, ease: "easeInOut", repeat: Infinity },
  },
};

export const AlarmV3 = forwardRef<IconHandle, IconProps>(function AlarmV3(
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
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: ALARM_PIVOT.x, originY: ALARM_PIVOT.y }}
          d={ALARM}
        />
      </motion.svg>
    </div>
  );
});
