"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BASELINE, BLOCK_LEFT, BLOCK_RIGHT, BLOCKS_BASE } from "../align-bottom-icon";

// GROW — the blocks rise up out of the baseline, springing to full height from their
// bottom edge (so they stay bottom-aligned), the right one trailing the left. Like
// bars building from the floor.
const GROW: Transition = { type: "spring", stiffness: 360, damping: 13, mass: 0.8 };
const growLeft: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: { scaleY: [0, 1], transition: GROW },
};
const growRight: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: { scaleY: [0, 1], transition: { ...GROW, delay: 0.09 } },
};

export const AlignV2 = forwardRef<IconHandle, IconProps>(function AlignV2(
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
        <motion.path variants={reduced ? undefined : growLeft} style={origin} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : growRight} style={origin} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
