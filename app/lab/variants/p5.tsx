"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { STAND, BOARD, BOARD_PIVOT } from "../presentation-icon";

// FLIP — the board spins a full turn on its vertical axis, flashing to the next
// slide, while the easel underneath stays planted. One clean reveal.
const flip: Variants = {
  normal: { rotateY: 0, transition: RETURN_TRANSITION },
  animate: { rotateY: [0, 360], transition: { duration: 0.7, ease: ARRIVE } },
};

export const PresV5 = forwardRef<IconHandle, IconProps>(function PresV5(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", perspective: 320, ...style }}>
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
          variants={reduced ? undefined : flip}
          style={{ transformBox: "view-box", originX: BOARD_PIVOT.x, originY: BOARD_PIVOT.y }}
          d={BOARD}
        />
      </motion.svg>
    </div>
  );
});
