"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY } from "../baby-icon";

// v3 — GIGGLE. A quick playful head-shake: the face rocks left–right a few times with
// decaying amplitude, pivoting on the chin so the crown swings widest — the wobble of a
// baby squirming with a laugh. Rotations are small (±9°→±3°) and settle to centre.
const CHIN = { transformBox: "view-box" as const, transformOrigin: "128px 224px" };

const giggle: Variants = {
  normal: { rotate: 0, transition: { duration: 0.35, ease: "easeOut" } },
  animate: {
    rotate: [0, -9, 7, -5, 3, 0],
    transition: {
      duration: 0.9,
      times: [0, 0.18, 0.42, 0.64, 0.84, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

export const Baby3 = forwardRef<IconHandle, IconProps>(function Baby3({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : giggle} style={CHIN} d={BABY} />
      </motion.svg>
    </div>
  );
});
