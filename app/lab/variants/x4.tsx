"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIEN, ALIEN_PIVOT } from "../alien-icon";

// FLOAT — the head levitates, rising and settling on a gentle loop, like it's
// hovering a few inches off the ground.
const float: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, 0],
    transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
  },
};

export const AlienV4 = forwardRef<IconHandle, IconProps>(function AlienV4(
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
          variants={reduced ? undefined : float}
          style={{ transformBox: "view-box", originX: ALIEN_PIVOT.x, originY: ALIEN_PIVOT.y }}
          d={ALIEN}
        />
      </motion.svg>
    </div>
  );
});
