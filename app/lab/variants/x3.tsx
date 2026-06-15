"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIEN, ALIEN_PIVOT } from "../alien-icon";

// BOB — the whole head tilts curiously side to side, the way a creature cocks its
// head at something new. A slow, easy loop.
const bob: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 9, 0],
    transition: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
  },
};

export const AlienV3 = forwardRef<IconHandle, IconProps>(function AlienV3(
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
          variants={reduced ? undefined : bob}
          style={{ transformBox: "view-box", originX: ALIEN_PIVOT.x, originY: ALIEN_PIVOT.y }}
          d={ALIEN}
        />
      </motion.svg>
    </div>
  );
});
