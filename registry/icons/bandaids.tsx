"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CHECK-UP — the full once-over in one gesture. The cross quarter-spins onto
// its own 90° symmetry, flexes through a squash-and-stretch as it lands, and
// the center dot answers with a lub-dub heartbeat once everything is still.
//
// The Phosphor "bandaids" glyph splits into its own untouched subpaths:
//   CROSS — the crossed strips (outline + pad interiors + center diamond).
//   DOT   — the r12 center dot, riding inside the spinning group so its beat
//           happens in the landed frame.
// CROSS + DOT is byte-identical to the original path.
const CROSS =
  "M184.57,128l27.71-27.72a40,40,0,1,0-56.56-56.56L128,71.43,100.28,43.72a40,40,0,1,0-56.56,56.56L71.43,128,43.72,155.72a40,40,0,1,0,56.56,56.56L128,184.57l27.72,27.71a40,40,0,1,0,56.56-56.56ZM167,55A24,24,0,1,1,201,89l-27.72,27.72L139.31,82.75Zm-5.09,73L128,161.94,94.06,128,128,94.06ZM55,89h0A24,24,0,1,1,89,55l27.72,27.72L82.75,116.69ZM89,201A24,24,0,1,1,55,167l27.72-27.72,33.94,33.94Zm112,0A24,24,0,0,1,167,201l-27.72-27.72,33.94-33.94L201,167A24,24,0,0,1,201,201Z";
const DOT = "M116,128a12,12,0,1,1,12,12A12,12,0,0,1,116,128Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const DUR = 1.5;
const cross: Variants = {
  normal: { rotate: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    // spin (0–40%) → flex on landing (40–70%) → hold while the dot beats
    rotate: [0, 90, 90, 90, 90],
    scaleX: [1, 1, 1.09, 0.96, 1],
    scaleY: [1, 1, 0.92, 1.05, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.4, 0.52, 0.64, 0.78] },
  },
};
const dot: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // still through the spin/flex, then lub-dub
    scale: [1, 1, 1.7, 1, 1.45, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.62, 0.74, 0.84, 0.92, 1] },
  },
};

export const BandaidsIcon = forwardRef<IconHandle, IconProps>(function BandaidsIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={CROSS} />
          <path d={DOT} />
        </svg>
      </div>
    );
  }

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
        <motion.g variants={cross} style={CENTER}>
          <path d={CROSS} />
          <motion.path d={DOT} variants={dot} style={CENTER} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
