"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { FACE, EARS, HANDS, ALARM_PIVOT } from "../alarm-icon";

// WIND-UP — the hands whirl two fast turns and decelerate to rest, like winding
// the clock or fast-forwarding time. A single satisfying spin, dial held still.
const windup: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 720], transition: { duration: 0.95, ease: ARRIVE } },
};

export const AlarmV5 = forwardRef<IconHandle, IconProps>(function AlarmV5(
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
        <path d={FACE} />
        <path d={EARS} />
        <motion.path
          variants={reduced ? undefined : windup}
          style={{ transformBox: "view-box", originX: ALARM_PIVOT.x, originY: ALARM_PIVOT.y }}
          d={HANDS}
        />
      </motion.svg>
    </div>
  );
});
