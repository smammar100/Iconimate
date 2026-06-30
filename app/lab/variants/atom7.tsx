"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM_NUCLEUS, ATOM_ORBITS } from "../atom-icon";

// v7 — SPIN. The reactor (v5) stripped to its core gesture: the rings spin up and
// overshoot past true on an elastic settle, and the nucleus simply scales in to land
// at the center. No core pulse, no shockwave pings — just the clean elastic spin.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const orbits: Variants = {
  normal: { rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-340, 0], scale: [0.5, 1], opacity: [0, 1], transition: { duration: 0.8, ease: ELASTIC } },
};
const nucleus: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0, 1], opacity: [0, 1], transition: { duration: 0.34, ease: [0.34, 1.56, 0.64, 1], delay: 0.34 } },
};

export const Atom7 = forwardRef<IconHandle, IconProps>(function Atom7({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : orbits} style={CENTER} d={ATOM_ORBITS} />
        <motion.path variants={reduced ? undefined : nucleus} style={CENTER} d={ATOM_NUCLEUS} />
      </motion.svg>
    </div>
  );
});
