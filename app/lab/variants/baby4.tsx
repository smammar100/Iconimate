"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY } from "../baby-icon";

// v4 — PEEKABOO. The face rises up from below the frame and fades in, as if popping up
// into view — then, on the way to rest, a whisper of overshoot before it settles. A
// warmer entrance than the plain pop: travel + fade instead of scale.
const CENTER = { transformBox: "view-box" as const, transformOrigin: "128px 128px" };

const peekaboo: Variants = {
  normal: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  animate: {
    y: [40, -6, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.6, times: [0, 0.72, 1], ease: [0.16, 1, 0.3, 1] },
  },
};

export const Baby4 = forwardRef<IconHandle, IconProps>(function Baby4({ size = 28, style, ...props }, ref) {
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
      >
        <motion.path variants={reduced ? undefined : peekaboo} style={CENTER} d={BABY} />
      </motion.svg>
    </div>
  );
});
