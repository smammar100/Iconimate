"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, springPop } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASTERISK_SPOKES, ASTERISK_W } from "../asterisk-icon";

// v1 — SPIN IN. The whole asterisk spins up: it scales from nothing while rotating to
// true, with a springy settle. Clean and satisfying, but the three spokes move as one
// rigid star — nothing reads as the parts assembling.
const spin: Variants = {
  normal: { scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: { scale: [0, 1], rotate: [-150, 0], transition: springPop },
};

export const Asterisk1 = forwardRef<IconHandle, IconProps>(function Asterisk1(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const center = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
        <motion.g variants={reduced ? undefined : spin} style={center}>
          {ASTERISK_SPOKES.map((s, i) => (
            <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
              <rect x={-s.len / 2} y={-ASTERISK_W / 2} width={s.len} height={ASTERISK_W} rx={ASTERISK_W / 2} />
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
