"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SUPERNOVA — the same burst as `asterisk`, on the five-spoke simple star. This glyph
// is FIVE rays meeting at the center (72° apart, top pointing up) — not through-lines
// — so each spoke is a capsule from the center out to its tip. We rebuild it as five
// rotatable rects anchored at the center, growing outward from the inner end. They
// fire out one by one with elastic overshoot + a glint, while the whole star spins
// ~200° and pops past full size before settling. Recombined, pixel-identical at rest.
const W = 16; // spoke width
const CX = 128;
const CY = 126; // centroid of the five tips
// Each ray: `len` is the capsule length from the center to its rounded tip, `angle`
// the direction in degrees (0 = +x / right, −90 = up). Tips: top, up-right, up-left,
// down-right, down-left.
const SPOKES = [
  { len: 94, angle: -90 }, // top
  { len: 93.44, angle: -20.556 }, // up-right
  { len: 93.44, angle: -159.444 }, // up-left
  { len: 100.8, angle: 52.868 }, // down-right
  { len: 100.8, angle: 127.132 }, // down-left
];
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
// Grow from the inner (center) end: originX 0 = the rect's left edge, which sits at
// the center after the group's translate.
const SPOKE_ORIGIN = { transformBox: "fill-box" as const, originX: 0, originY: 0.5 };

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
    transition: { duration: DUR.slow, ease: ELASTIC, delay: staged(i, 0.1), times: [0, 0.62, 1] },
  },
});

export const AsteriskSimpleIcon = forwardRef<IconHandle, IconProps>(function AsteriskSimpleIcon(
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
            <g key={i} transform={`translate(${CX} ${CY}) rotate(${s.angle})`}>
              <motion.rect
                x={0}
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
