"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASTERISK_SPOKES, ASTERISK_W } from "../asterisk-icon";

// v5 — SUPERNOVA. The works. The spokes fire out from the center one by one, each
// overshooting its length on an elastic ease and flashing thicker as it lands (the
// twinkle). Underneath, the whole star spins ~200° and pops past full size before
// rocking back to rest. Stagger + elastic + spin + overshoot, choreographed into one
// burst. The keeper.
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const SPOKE_ORIGIN = { transformBox: "fill-box" as const, originX: 0.5, originY: 0.5 };

const supernova: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-200, 0],
    scale: [0.4, 1.08, 1],
    transition: {
      rotate: { duration: 0.8, ease: ELASTIC },
      scale: { duration: 0.8, ease: ARRIVE, times: [0, 0.72, 1] },
    },
  },
};
const shoot = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1.12, 1], // overshoot the length, then settle
    scaleY: [0.5, 1.45, 1], // glint as the arm lands
    opacity: [0, 1, 1],
    transition: { duration: DUR.slow, ease: ELASTIC, delay: staged(i, 0.12), times: [0, 0.62, 1] },
  },
});

export const Asterisk5 = forwardRef<IconHandle, IconProps>(function Asterisk5(
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
        <motion.g variants={reduced ? undefined : supernova} style={CENTER}>
          {ASTERISK_SPOKES.map((s, i) => (
            <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
              <motion.rect
                x={-s.len / 2}
                y={-ASTERISK_W / 2}
                width={s.len}
                height={ASTERISK_W}
                rx={ASTERISK_W / 2}
                variants={reduced ? undefined : shoot(i)}
                style={SPOKE_ORIGIN}
              />
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
