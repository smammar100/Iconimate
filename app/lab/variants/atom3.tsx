"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM_NUCLEUS, ATOM_ORBITS } from "../atom-icon";

// v3 — ENERGIZE. The rings draw themselves on: a thick stroked circle is "drawn"
// around the center as a mask (pathLength 0 → 1), revealing the orbits in an angular
// sweep, and the nucleus ignites at the core with an overshoot pop once the sweep
// passes through. The atom powers up rather than just spinning in.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const sweep: Variants = {
  normal: { pathLength: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], transition: { duration: 0.72, ease: SWEEP } },
};
const nucleus: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.4, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.46, ease: [0.34, 1.56, 0.64, 1], delay: 0.3, times: [0, 0.6, 1] },
  },
};

export const Atom3 = forwardRef<IconHandle, IconProps>(function Atom3({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = useId();

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={ATOM_ORBITS} />
          <path d={ATOM_NUCLEUS} />
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
      >
        <defs>
          <mask id={maskId}>
            <motion.circle cx={128} cy={128} r={62} fill="none" stroke="#fff" strokeWidth={136} variants={sweep} />
          </mask>
        </defs>
        <path d={ATOM_ORBITS} mask={`url(#${maskId})`} />
        <motion.path variants={nucleus} style={CENTER} d={ATOM_NUCLEUS} />
      </motion.svg>
    </div>
  );
});
