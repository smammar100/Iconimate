"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// One-shot strike: a quick anticipation dip, then a sharp flash — scale snaps up while the
// opacity blinks and the whole bolt jitters, all front-loaded by `times` so it cracks, not glides.
const bolt: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.22, 1],
    rotate: [0, -6, 4, 0],
    opacity: [1, 0.45, 1, 1],
    transition: { duration: 0.55, ease: ARRIVE, times: [0, 0.22, 0.5, 1] },
  },
};

export const BoltIcon = forwardRef<IconHandle, IconProps>(function BoltIcon(
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
        fill="none"
        stroke="currentColor"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path
          variants={reduced ? undefined : bolt}
          style={{ transformBox: "view-box", transformOrigin: "128px 128px" }}
          d="M160 40 92 138h38l-34 78 68-98h-38z"
        />
      </motion.svg>
    </div>
  );
});
