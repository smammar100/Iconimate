"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { STAND, BOARD, BOARD_BASE } from "../presentation-icon";

// REVEAL — the easel holds still while the board unfurls upward from its base,
// the way a slide snaps onto the screen. Content arriving.
const board: Variants = {
  normal: { scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.04, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.55, ease: ARRIVE },
  },
};

export const PresV1 = forwardRef<IconHandle, IconProps>(function PresV1(
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
        <path d={STAND} />
        <motion.path
          variants={reduced ? undefined : board}
          style={{ transformBox: "view-box", originX: BOARD_BASE.x, originY: BOARD_BASE.y }}
          d={BOARD}
        />
      </motion.svg>
    </div>
  );
});
