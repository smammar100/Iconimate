"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AVOCADO } from "../avocado-icon";

// v4 — JIGGLE. The avocado plops in like the soft fruit it is: it lands wide and
// short, then squashes and stretches through a damping wobble, anchored at its base so
// it settles onto a surface. Volume is preserved — when it's tall it's thin, when it's
// short it's wide — so it reads as springy, not just scaled.
const BASE = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const jiggle: Variants = {
  normal: { scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.62, 1.18, 0.92, 1.05, 0.98, 1],
    scaleX: [1.32, 0.9, 1.07, 0.96, 1.02, 1],
    opacity: [0, 1, 1, 1, 1, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.26, 0.48, 0.68, 0.85, 1] },
  },
};

export const Avocado4 = forwardRef<IconHandle, IconProps>(function Avocado4({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : jiggle} style={BASE} d={AVOCADO} />
      </motion.svg>
    </div>
  );
});
