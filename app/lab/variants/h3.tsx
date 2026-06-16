"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIGN_CENTER_HORIZONTAL } from "../align-center-horizontal-icon";

// SWAY (loop) — a gentle horizontal rock around the center axis, like a balance
// settling. Subtle and infinite; the glyph stays whole and centered.
const sway: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -5, 0, 5, 0],
    transition: { duration: 1.7, ease: SWEEP, repeat: Infinity },
  },
};

export const AlignCH3 = forwardRef<IconHandle, IconProps>(function AlignCH3(
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
        <motion.path variants={reduced ? undefined : sway} d={ALIGN_CENTER_HORIZONTAL} />
      </motion.svg>
    </div>
  );
});
