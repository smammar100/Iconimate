"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASTERISK_SPOKES, ASTERISK_W } from "../asterisk-icon";

// v3 — RADIAL BURST. The staggered shoot-out from v2, but the whole star also spins
// into place as the spokes unfurl — they sweep out on an arc instead of straight,
// which reads as a burst of energy rather than a tidy assembly.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const SPOKE_ORIGIN = { transformBox: "fill-box" as const, originX: 0.5, originY: 0.5 };
const burst: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [-120, 0], transition: { duration: DUR.slow, ease: OVERSHOOT_BACK } },
};
const grow = (i: number): Variants => ({
  normal: { scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: staged(i, 0.1) },
  },
});

export const Asterisk3 = forwardRef<IconHandle, IconProps>(function Asterisk3(
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
        <motion.g variants={reduced ? undefined : burst} style={CENTER}>
          {ASTERISK_SPOKES.map((s, i) => (
            <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
              <motion.rect
                x={-s.len / 2}
                y={-ASTERISK_W / 2}
                width={s.len}
                height={ASTERISK_W}
                rx={ASTERISK_W / 2}
                variants={reduced ? undefined : grow(i)}
                style={SPOKE_ORIGIN}
              />
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
