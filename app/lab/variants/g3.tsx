"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BASELINE, BLOCK_LEFT, BLOCK_RIGHT, BLOCKS_BASE } from "../align-bottom-icon";

// NUDGE — a soft attention wave: each block lifts off the line and settles back, the
// right one just after the left, looping. Bottoms touch back down each cycle.
const nudgeLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -18, 0], transition: { duration: 1.1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.3 } },
};
const nudgeRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -18, 0], transition: { duration: 1.1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.3, delay: 0.16 } },
};

export const AlignV3 = forwardRef<IconHandle, IconProps>(function AlignV3(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY: BLOCKS_BASE };
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
        <path d={BASELINE} />
        <motion.path variants={reduced ? undefined : nudgeLeft} style={origin} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : nudgeRight} style={origin} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
