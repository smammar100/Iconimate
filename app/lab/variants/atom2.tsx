"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM_NUCLEUS, ATOM_ORBITS } from "../atom-icon";

// v2 — WHIR. The rings spin up — nearly a full turn, easing to rest — while the
// nucleus pops in and gives a little pulse at the core. Separating the nucleus from
// the rings lets the atom read as a machine coming online, not a static badge.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const orbits: Variants = {
  normal: { rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-300, 0], opacity: [0, 1], transition: { duration: 0.8, ease: ARRIVE } },
};
const nucleus: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.35, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.34, times: [0, 0.6, 1] },
  },
};

export const Atom2 = forwardRef<IconHandle, IconProps>(function Atom2({ size = 28, style, ...props }, ref) {
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
