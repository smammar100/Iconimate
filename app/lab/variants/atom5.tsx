"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM_NUCLEUS, ATOM_ORBITS } from "../atom-icon";

// v5 — REACTOR. The works. The rings spin up and overshoot past true on an elastic
// settle, the nucleus pops and pulses with energy, and the core fires off two
// shockwave pings that ripple outward — the atom doesn't just appear, it goes critical.
// Pings live just outside the rings and only expand, so they never wash over the glyph.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const SPIN = 0.8;

const orbits: Variants = {
  normal: { rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-340, 0], scale: [0.5, 1], opacity: [0, 1], transition: { duration: SPIN, ease: ELASTIC } },
};
const nucleus: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.5, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: ELASTIC, delay: 0.3, times: [0, 0.62, 1] },
  },
};
// Shockwaves — invisible at rest; fire from the core after the spin, rippling outward
// from just outside the rings (scale ≥ 1.05) so they never cross the glyph.
const ping = (delay: number): Variants => ({
  normal: { scale: 1, opacity: 0, transition: { duration: 0.2 } },
  animate: { scale: [1.05, 1.75], opacity: [0.5, 0], transition: { duration: 0.7, ease: "easeOut", delay } },
});

export const Atom5 = forwardRef<IconHandle, IconProps>(function Atom5({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

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
        {[SPIN - 0.06, SPIN + 0.14].map((d, i) => (
          <motion.circle
            key={i}
            cx={128}
            cy={128}
            r={104}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            vectorEffect="non-scaling-stroke"
            variants={ping(d)}
            style={CENTER}
          />
        ))}
        <motion.path variants={orbits} style={CENTER} d={ATOM_ORBITS} />
        <motion.path variants={nucleus} style={CENTER} d={ATOM_NUCLEUS} />
      </motion.svg>
    </div>
  );
});
