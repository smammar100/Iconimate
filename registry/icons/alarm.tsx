"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING — the whole clock rattles hard on its base, the way an alarm jumps when it
// goes off: a quick decaying shake that loops with a short rest between bursts.
// Filled Phosphor alarm glyph (currentColor); the body shakes about the dial centre.
const ALARM =
  "M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM61.66,37.66l-32,32A8,8,0,0,1,18.34,58.34l32-32A8,8,0,0,1,61.66,37.66Zm176,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,69.66ZM184,128a8,8,0,0,1,0,16H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v48Z";

const ALARM_PIVOT = { x: 0.5, y: 0.531 };

const ring: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -12, 12, -9, 9, -5, 5, 0],
    transition: { duration: 0.7, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.45 },
  },
};

export const AlarmIcon = forwardRef<IconHandle, IconProps>(function AlarmIcon(
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
