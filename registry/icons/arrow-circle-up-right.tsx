"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SCROLL_LOOP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SCROLL — the arrow rides a wheel inside the static ring, looping toward where it
// points (up-right). Principles: ARCS (travel) + SECONDARY ACTION (scale & opacity track
// the travel — small/faint behind, full at centre, small/faint ahead) + TIMING
// (symmetric easeInOut cadence via the shared SCROLL_LOOP token).
const RING =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z";
const ARROW =
  "M168,96v48a8,8,0,0,1-16,0V115.31l-50.34,50.35a8,8,0,0,1-11.32-11.32L140.69,104H112a8,8,0,0,1,0-16h48A8,8,0,0,1,168,96Z";

const scroll: Variants = {
  normal: { x: 0, y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [-33, 0, 33],
    y: [33, 0, -33],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: SCROLL_LOOP,
  },
};

export const ArrowCircleUpRightIcon = forwardRef<IconHandle, IconProps>(function ArrowCircleUpRightIcon(
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
        <path d={RING} />
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : scroll}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
        />
      </motion.svg>
    </div>
  );
});
