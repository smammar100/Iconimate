"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BASELINE, BLOCK_LEFT, BLOCK_RIGHT, BLOCKS_BASE } from "../align-bottom-icon";

// RISE — the mirror of the drop: the blocks slide up into place from below the line
// and decelerate to rest, the right one trailing the left. Content arriving and
// snapping to the bottom edge.
const riseLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [54, 0], transition: { duration: 0.5, ease: ARRIVE } },
};
const riseRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [54, 0], transition: { duration: 0.5, ease: ARRIVE, delay: 0.1 } },
};

export const AlignV5 = forwardRef<IconHandle, IconProps>(function AlignV5(
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
        <motion.path variants={reduced ? undefined : riseLeft} style={origin} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : riseRight} style={origin} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
