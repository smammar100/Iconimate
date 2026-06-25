"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ANTICIPATE_DIP, ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// A double-thump heartbeat: anticipation dip (the shared wind-up), a strong beat, a
// softer echo, then settle. Anticipation + squash/stretch + secondary action (the echo).
const beat: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, ANTICIPATE_DIP, 1.18, 1.0, 1.12, 1],
    transition: { duration: 0.75, ease: ARRIVE, times: [0, 0.12, 0.32, 0.55, 0.78, 1] },
  },
};

export const HeartIcon = forwardRef<IconHandle, IconProps>(function HeartIcon(
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
          variants={reduced ? undefined : beat}
          style={{ transformBox: "view-box", transformOrigin: "128px 132px" }}
          d="M128 216C112 204 40 160 40 104a48 48 0 0 1 88-26 48 48 0 0 1 88 26c0 56-72 100-88 112Z"
        />
      </motion.svg>
    </div>
  );
});
