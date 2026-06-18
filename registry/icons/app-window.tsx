"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BLINK — the two title-bar dots blink shut and open like a pair of eyes, a quick
// double wink pivoted on their own line so they close in place; the frame holds.
// Phosphor "app-window" glyph (currentColor): FRAME (border) + two DOTS.
const FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";
const DOT1 = "M80,84A12,12,0,1,1,68,72,12,12,0,0,1,80,84Z";
const DOT2 = "M120,84a12,12,0,1,1-12-12A12,12,0,0,1,120,84Z";

// Pivot on the dots' own line (y≈84) so they blink in place.
const DOTS_ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.328 };

const blink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.12, 1, 0.12, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.12, 0.3, 0.42, 0.6] },
  },
};

export const AppWindowIcon = forwardRef<IconHandle, IconProps>(function AppWindowIcon(
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
        <path d={FRAME} />
        <motion.g variants={reduced ? undefined : blink} style={DOTS_ORIGIN}>
          <path d={DOT1} />
          <path d={DOT2} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
