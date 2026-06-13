"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { TOWER } from "../control-tower-icon";

// STATE icon: a slow cloth ripple in the wind — the bottom sways while the hang point holds.
const wave: Variants = {
  normal: { skewX: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    skewX: [0, -7, 7, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};

export const BannerV2 = forwardRef<IconHandle, IconProps>(function BannerV2(
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
          variants={reduced ? undefined : wave}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.09 }}
          d={TOWER}
        />
      </motion.svg>
    </div>
  );
});
