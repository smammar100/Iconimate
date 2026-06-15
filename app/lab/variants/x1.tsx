"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { HEAD, EYES, MOUTH, LEFT_EYE_FILL, RIGHT_EYE_FILL, EYE_LINE, EYE_GLOW } from "../alien-icon";

// GLOW — at rest the eyes are hollow outlines, in the icon's own colour. On hover
// the almonds flood with green and bloom a soft glow that breathes. The green is
// painted directly (not currentColor), so it lights up identically on light and
// dark surfaces; only the head/mouth track the theme.
const glow: Variants = {
  normal: { opacity: 0, scale: 0.85, filter: "drop-shadow(0 0 0px rgba(34,197,94,0))", transition: { duration: 0.22 } },
  animate: {
    opacity: 1,
    scale: 1,
    filter: [
      "drop-shadow(0 0 2px rgba(34,197,94,0.65))",
      "drop-shadow(0 0 9px rgba(34,197,94,0.95))",
      "drop-shadow(0 0 2px rgba(34,197,94,0.65))",
    ],
    transition: {
      opacity: { duration: 0.22 },
      scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      filter: { duration: 1.5, ease: "easeInOut", repeat: Infinity },
    },
  },
};

// Reduced motion: still fill + light the eyes, just hold the glow steady (no pulse).
const glowReduced: Variants = {
  normal: { opacity: 0 },
  animate: { opacity: 1, filter: "drop-shadow(0 0 5px rgba(34,197,94,0.9))" },
};

export const AlienV1 = forwardRef<IconHandle, IconProps>(function AlienV1(
  { size = 28, style, ...props },
  ref,
) {
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
        <path d={HEAD} />
        <path d={EYES} />
        <path d={MOUTH} />
        <motion.g
          variants={reduced ? glowReduced : glow}
          fill={EYE_GLOW}
          style={{ transformBox: "view-box", originX: EYE_LINE.x, originY: EYE_LINE.y }}
        >
          <path d={LEFT_EYE_FILL} />
          <path d={RIGHT_EYE_FILL} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
