"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared PLUNGE engine for the downward branching arrows (arrows-merge / arrows-split).
// Anchored at the top, the glyph squashes then stretches down and recoils. The stretch
// peak is capped at 1.1 so the lowest point stays inside the bounding box. `originY` is
// the top anchor in normalized view-box units (top edge / 256). Principles: SQUASH &
// STRETCH, FOLLOW-THROUGH (the recoil settle). Reduced-motion: renders static.
const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.9, 1.1, 0.97, 1],
    transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] },
  },
};

export function makeArrowsPlunge(glyph: string, originY: number) {
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY };
  return forwardRef<IconHandle, IconProps>(function ArrowsPlungeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
          <motion.path d={glyph} variants={reduced ? undefined : plunge} style={origin} />
        </motion.svg>
      </div>
    );
  });
}
