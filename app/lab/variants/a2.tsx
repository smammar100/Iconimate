"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { FACE, EARS, HANDS, ALARM_PIVOT } from "../alarm-icon";

// TICK — the dial and feet hold still while the hands sweep a full turn around the
// centre, like time running. Loops at a steady clock pace.
const tick: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: 360, transition: { duration: 3, ease: "linear", repeat: Infinity } },
};

export const AlarmV2 = forwardRef<IconHandle, IconProps>(function AlarmV2(
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
          variants={reduced ? undefined : tick}
          style={{ transformBox: "view-box", originX: ALARM_PIVOT.x, originY: ALARM_PIVOT.y }}
          d={HANDS}
        />
      </motion.svg>
    </div>
  );
});
