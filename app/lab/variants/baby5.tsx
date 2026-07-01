"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY } from "../baby-icon";

// v5 — BREATHE. A soft, endless double-pulse — the two-beat swell of a tiny sleeping
// chest. Scales up a hair, dips, swells once more, then rests, looping with a calm pause
// between breaths. The quietest of the five: presence without a gesture.
const CENTER = { transformBox: "view-box" as const, transformOrigin: "128px 128px" };

const breathe: Variants = {
  normal: { scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    scale: [1, 1.06, 1.02, 1.07, 1],
    transition: {
      duration: 1.6,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.4,
    },
  },
};

export const Baby5 = forwardRef<IconHandle, IconProps>(function Baby5({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : breathe} style={CENTER} d={BABY} />
      </motion.svg>
    </div>
  );
});
