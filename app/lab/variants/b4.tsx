"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { TOWER_BASE, ANTENNA } from "../control-tower-icon";

// Only the antenna flips a full turn on its vertical axis; the tower holds still beneath it.
const flip: Variants = {
  normal: { rotateY: 0, transformPerspective: 500, transition: RETURN_TRANSITION },
  animate: { rotateY: [0, 360], transformPerspective: 500, transition: { duration: 0.8, ease: ARRIVE } },
};

export const BannerV4 = forwardRef<IconHandle, IconProps>(function BannerV4(
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
        {/* static tower */}
        <path d={TOWER_BASE} />
        {/* the antenna spins on its own vertical axis */}
        <motion.path
          variants={reduced ? undefined : flip}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.156 }}
          d={ANTENNA}
        />
      </motion.svg>
    </div>
  );
});
