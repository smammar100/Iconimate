"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIGN_CENTER_HORIZONTAL } from "../align-center-horizontal-icon";

// PULSE (loop) — the glyph breathes: a soft scale + brightness pulse on an infinite
// beat, drawing the eye to the centered alignment. Whole-glyph, artwork untouched.
const pulse: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.12, 1],
    opacity: [1, 0.6, 1],
    transition: { duration: 1.2, ease: SWEEP, repeat: Infinity },
  },
};

export const AlignCH4 = forwardRef<IconHandle, IconProps>(function AlignCH4(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
        <motion.path variants={reduced ? undefined : pulse} style={origin} d={ALIGN_CENTER_HORIZONTAL} />
      </motion.svg>
    </div>
  );
});
