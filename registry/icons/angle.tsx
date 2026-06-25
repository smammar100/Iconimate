"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW — the angle constructs itself: the two rays are traced like a pen from the
// far end of the x-axis, into the vertex, and up the y-axis; once the rays land,
// the arc and its top tick pop in to close the measurement.
// Phosphor "angle" glyph (currentColor), split so the rays draw while the arc reveals.

// The arc — the quarter sweep that marks the measured angle.
const ARC =
  "M96,72a8,8,0,0,1,8-8A104.11,104.11,0,0,1,208,168a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88A8,8,0,0,1,96,72Z";
// The little upper-left tick stub — reads as part of the measurement, so it pops in with the ARC.
const TICK = "M64,64H32a8,8,0,0,0,0,16H64Z";
// Centerline of the L, traced as a stroke (width 16 + round caps reproduce the filled bars).
const RAYS_STROKE = "M232,200H72V40";

// Inner corner of the L (the vertex) as a view-box fraction — the arc/tick scale from here.
const VERTEX = { x: 0.281, y: 0.781 };
const ORIGIN = { transformBox: "view-box" as const, originX: VERTEX.x, originY: VERTEX.y };

const DRAW_DUR = 0.55;

const rays: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: 1,
    transition: { duration: DRAW_DUR, ease: SWEEP },
  },
};

const arc: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    // Exaggeration: the arc snaps in past full size then settles (follow-through) as
    // the rays land, giving the measurement a confident "clicks into place" pop.
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: OVERSHOOT_BACK, delay: DRAW_DUR - 0.05 },
  },
};

export const AngleIcon = forwardRef<IconHandle, IconProps>(function AngleIcon(
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
        style={{ overflow: "visible" }}
      >
        <motion.path
          d={RAYS_STROKE}
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={reduced ? undefined : rays}
        />
        <motion.path d={ARC} variants={reduced ? undefined : arc} style={ORIGIN} />
        <motion.path d={TICK} variants={reduced ? undefined : arc} style={ORIGIN} />
      </motion.svg>
    </div>
  );
});
