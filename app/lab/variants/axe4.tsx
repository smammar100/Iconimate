"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE, AXE_PIVOT } from "../axe-icon";

// v4 — CHOP + RECOIL. The chop, but it hits something: at the bottom of the swing the
// blade jolts to a hard stop, kicks back up, then rocks down again with diminishing
// bounces before settling — the impact reading as real resistance. A tiny jolt down at
// the moment of contact sells the hit.
const PIVOT = { transformBox: "view-box" as const, originX: AXE_PIVOT.x / 256, originY: AXE_PIVOT.y / 256 };
const chop: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -24, 16, -6, 3, 0],
    y: [0, 0, 4, 0, 0, 0], // the jolt on contact
    transition: { duration: 0.78, times: [0, 0.28, 0.5, 0.66, 0.83, 1], ease: ["easeOut", "easeIn", "easeOut", "easeInOut", "easeOut"] },
  },
};

export const Axe4 = forwardRef<IconHandle, IconProps>(function Axe4({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : chop} style={PIVOT} d={AXE} />
      </motion.svg>
    </div>
  );
});
