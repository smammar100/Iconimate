"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS } from "../asclepius-icon";

// v2 — RISE. Instead of scaling uniformly, the staff grows upward from its foot:
// scaleY is anchored at the base, so the symbol is raised into place like a standard
// being planted. Direction gives it meaning the blob snap never had.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const rise: Variants = {
  normal: { scaleY: 1, scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.32, 1.05, 1],
    scaleX: [0.92, 1.01, 1],
    opacity: [0, 1, 1],
    transition: { duration: DUR.slow, ease: ARRIVE, times: [0, 0.7, 1] },
  },
};

export const Asclepius2 = forwardRef<IconHandle, IconProps>(function Asclepius2(
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
      >
        <motion.path variants={reduced ? undefined : rise} style={FOOT} d={ASCLEPIUS} />
      </motion.svg>
    </div>
  );
});
