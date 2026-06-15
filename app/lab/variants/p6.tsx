"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { STAND, BOARD, PLAY_TRI, PLAY_PIVOT } from "../presentation-icon";

// PLAY — a play triangle sits dead-centre in the board and spins one full turn
// about its own middle, like hitting play on the deck. Board and easel hold still.
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 360], transition: { duration: 0.8, ease: ARRIVE } },
};

export const PresV6 = forwardRef<IconHandle, IconProps>(function PresV6(
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
        <path d={BOARD} />
        <motion.path
          variants={reduced ? undefined : spin}
          style={{ transformBox: "view-box", originX: PLAY_PIVOT.x, originY: PLAY_PIVOT.y }}
          d={PLAY_TRI}
        />
      </motion.svg>
    </div>
  );
});
