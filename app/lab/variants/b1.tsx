"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { TOWER } from "../control-tower-icon";

// Knocked into a pendulum swing from its hang point, settling with diminishing amplitude.
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 13, -9, 5, -2, 0], transition: { duration: 1, ease: "easeInOut" } },
};

export const BannerV1 = forwardRef<IconHandle, IconProps>(function BannerV1(
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
          variants={reduced ? undefined : swing}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.09 }}
          d={TOWER}
        />
      </motion.svg>
    </div>
  );
});
