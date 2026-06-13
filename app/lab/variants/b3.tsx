"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { TOWER } from "../control-tower-icon";

// Hoisted up the pole: rises from below, overshoots, and settles — fading in as it climbs.
const hoist: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [44, -6, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.7, 1] },
  },
};

export const BannerV3 = forwardRef<IconHandle, IconProps>(function BannerV3(
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
          variants={reduced ? undefined : hoist}
          style={{ transformBox: "view-box", transformOrigin: "128px 128px" }}
          d={TOWER}
        />
      </motion.svg>
    </div>
  );
});
