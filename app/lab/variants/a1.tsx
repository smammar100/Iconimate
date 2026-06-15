"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALARM, ALARM_PIVOT } from "../alarm-icon";

// RING — the whole clock rattles hard on its base, the way an alarm jumps when it
// goes off: a quick decaying shake that loops with a short rest between bursts.
const ring: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -12, 12, -9, 9, -5, 5, 0],
    transition: { duration: 0.7, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.45 },
  },
};

export const AlarmV1 = forwardRef<IconHandle, IconProps>(function AlarmV1(
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
          variants={reduced ? undefined : ring}
          style={{ transformBox: "view-box", originX: ALARM_PIVOT.x, originY: ALARM_PIVOT.y }}
          d={ALARM}
        />
      </motion.svg>
    </div>
  );
});
