"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SUPERNOVA — the asterisk bursts into being. The spokes fire out from the center one
// by one, each overshooting its length on an elastic ease and flashing thicker as it
// lands (a glint). Underneath, the whole star spins ~200° and pops past full size
// before rocking back to rest. The Phosphor `asterisk` is one filled outline, but its
// cap geometry is exactly three round-capped capsules — a vertical bar and two
// diagonals at ±31° — so we rebuild it as three rotatable rects whose union is pixel-
// identical, letting each spoke grow from the center on its own.
const W = 16; // spoke width
const SPOKES = [
  { len: 176, angle: 90 }, // vertical
  { len: 186.59, angle: 30.9638 }, // "\"
  { len: 186.59, angle: -30.9638 }, // "/"
];
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
    scaleX: [0, 1.12, 1],
    scaleY: [0.5, 1.45, 1],
    opacity: [0, 1, 1],
    transition: { duration: DUR.slow, ease: ELASTIC, delay: staged(i, 0.12), times: [0, 0.62, 1] },
  },
});

export const AsteriskIcon = forwardRef<IconHandle, IconProps>(function AsteriskIcon(
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
          {SPOKES.map((s, i) => (
            <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
              <motion.rect
                x={-s.len / 2}
                y={-W / 2}
                width={s.len}
                height={W}
                rx={W / 2}
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
