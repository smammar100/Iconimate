"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { TOWER } from "../control-tower-icon";

// A sharp wind gust snaps the cloth sideways and it flaps back to rest.
const gust: Variants = {
  normal: { skewX: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    skewX: [0, -13, 8, -3, 0],
    rotate: [0, 4, -2, 1, 0],
    transition: { duration: 0.7, ease: ARRIVE, times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

export const BannerV5 = forwardRef<IconHandle, IconProps>(function BannerV5(
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
          variants={reduced ? undefined : gust}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.09 }}
          d={TOWER}
        />
      </motion.svg>
    </div>
  );
});
