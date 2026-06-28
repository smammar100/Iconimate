"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared BOUNCE engine for the two-arrow swap/sort pair (arrows-down-up / -left-right).
// Both arrows fly out of the bounding box (clipped away), hold a beat off-frame, then
// re-enter past rest and settle with an overshoot. `pathPos` is the arrow pointing in
// the +axis direction (down for "y" / right for "x"); `pathNeg` the −axis one (up /
// left). Principles: FOLLOW-THROUGH + EXAGGERATION (the overshoot), TIMING (the brief
// off-frame hold). Reduced-motion: paths render static (variants omitted).

// Travel far enough that each arrow fully clears the bounding box before it returns.
const H = 240;
const TRANSITION = {
  duration: 1.0,
  times: [0, 0.32, 0.46, 0.8, 1],
  ease: ["easeIn", "linear", "easeOut", "easeInOut"],
} as const;

export function makeArrowsBounce(pathPos: string, pathNeg: string, axis: "x" | "y") {
  const pos: Variants = {
    normal: { [axis]: 0, transition: RETURN_TRANSITION },
    animate: { [axis]: [0, -H, -H, 16, 0], transition: TRANSITION },
  };
  const neg: Variants = {
    normal: { [axis]: 0, transition: RETURN_TRANSITION },
    animate: { [axis]: [0, H, H, -16, 0], transition: TRANSITION },
  };
  return forwardRef<IconHandle, IconProps>(function ArrowsBounceIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path d={pathPos} variants={reduced ? undefined : pos} />
          <motion.path d={pathNeg} variants={reduced ? undefined : neg} />
        </motion.svg>
      </div>
    );
  });
}
