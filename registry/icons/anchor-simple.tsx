"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SWAY — same pendulum as the full Anchor: the glyph hangs from its top ring and
// rocks evenly side to side, easing to rest on hover-out.
// Filled Phosphor anchor-simple glyph (currentColor); pivots about the ring centre (128, 64).
const ANCHOR_SIMPLE =
  "M224,112H200a8,8,0,0,0,0,16h15.64A88.15,88.15,0,0,1,136,207.63V95a32,32,0,1,0-16,0V207.63A88.15,88.15,0,0,1,40.36,128H56a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8,104,104,0,0,0,208,0A8,8,0,0,0,224,112ZM112,64a16,16,0,1,1,16,16A16,16,0,0,1,112,64Z";

const ANCHOR_SIMPLE_PIVOT = { x: 0.5, y: 0.25 };

const sway: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 11, 0, -11, 0],
    transition: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
  },
};

export const AnchorSimpleIcon = forwardRef<IconHandle, IconProps>(function AnchorSimpleIcon(
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
          variants={reduced ? undefined : sway}
          style={{ transformBox: "view-box", originX: ANCHOR_SIMPLE_PIVOT.x, originY: ANCHOR_SIMPLE_PIVOT.y }}
          d={ANCHOR_SIMPLE}
        />
      </motion.svg>
    </div>
  );
});
