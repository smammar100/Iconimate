"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BASELINE, BLOCK_LEFT, BLOCK_RIGHT, BLOCKS_BASE } from "../align-bottom-icon";

// EQUALIZER — the blocks pump up and down in height like audio bars, each on its own
// rhythm, scaling from the bottom so they never leave the baseline. Loops.
const eqLeft: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.5, 1, 0.75, 1],
    transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity },
  },
};
const eqRight: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.8, 0.55, 1, 0.7, 1],
    transition: { duration: 1.7, ease: "easeInOut", repeat: Infinity },
  },
};

export const AlignV4 = forwardRef<IconHandle, IconProps>(function AlignV4(
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
        <motion.path variants={reduced ? undefined : eqLeft} style={origin} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : eqRight} style={origin} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
