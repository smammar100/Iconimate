"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Angle icon, 5 animation candidates.
 *
 * The Phosphor "Angle" glyph is one path with two subpaths: the swept ARC near
 * the top, and the L-shaped AXES (the two rays). We split them so motion can
 * treat the measured angle and its rays independently. The natural pivot for an
 * "opening angle" is the inner corner of the L — the vertex.
 */
const ARC =
  "M96,72a8,8,0,0,1,8-8A104.11,104.11,0,0,1,208,168a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88A8,8,0,0,1,96,72Z";
// The two long rays (the L), with the upper-left tick stub removed so it can move on its own.
const RAYS =
  "M240,192H80V32a8,8,0,0,0-16,0V200a8,8,0,0,0,8,8H240a8,8,0,0,0,0-16Z";
// The little upper-left tick stub — reads as part of the angle's measurement, so it
// animates with the ARC rather than sitting static on the rays.
const TICK = "M64,64H32a8,8,0,0,0,0,16H64Z";

// Centerline of the L for the "Draw" variant — traced as a stroke so the rays can be
// drawn directionally: from the far end of the x-axis, into the vertex, up the y-axis.
// Width 16 + round caps reproduce the filled-bar silhouette.
const RAYS_STROKE = "M232,200H72V40";

/** Inner corner of the L (where the two rays meet), as a view-box fraction. */
const VERTEX = { x: 0.281, y: 0.781 };

const ORIGIN = { transformBox: "view-box" as const, originX: VERTEX.x, originY: VERTEX.y };

/* ── 1. MEASURE ──────────────────────────────────────────────────────────────
   The rays hold still while the arc grows out of the vertex — the angle being
   measured / filled in. */
const measureArc: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

const AngleMeasureIcon = forwardRef<IconHandle, IconProps>(
  function AngleMeasureIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={RAYS} />
          <motion.path d={ARC} variants={reduced ? undefined : measureArc} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : measureArc} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. HINGE ────────────────────────────────────────────────────────────────
   The whole glyph swings open a few degrees about the vertex and springs back —
   like opening an angle on a carpenter's bevel. */
const hinge: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -9, 0], transition: { duration: 0.7, ease: OVERSHOOT } },
};

const AngleHingeIcon = forwardRef<IconHandle, IconProps>(
  function AngleHingeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hinge} style={ORIGIN}>
            <path d={RAYS} />
            <path d={ARC} />
            <path d={TICK} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. SWEEP ────────────────────────────────────────────────────────────────
   The arc rotates about the vertex, sweeping in toward its resting angle and
   back out — a protractor reading taken over and over. */
const sweep: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-22, 0],
    transition: { duration: 0.9, ease: SWEEP, repeat: Infinity, repeatType: "reverse" },
  },
};

const AngleSweepIcon = forwardRef<IconHandle, IconProps>(
  function AngleSweepIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={RAYS} />
          <motion.path d={ARC} variants={reduced ? undefined : sweep} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : sweep} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. POP ──────────────────────────────────────────────────────────────────
   A tactile squash-and-pop of the whole icon about the vertex — a confident
   tap response. */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.06, 1],
    transition: { duration: 0.46, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

const AnglePopIcon = forwardRef<IconHandle, IconProps>(
  function AnglePopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pop} style={ORIGIN}>
            <path d={RAYS} />
            <path d={ARC} />
            <path d={TICK} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. DRAW ─────────────────────────────────────────────────────────────────
   The two rays extend out of the vertex first, then the arc pops in to close
   the measurement — the icon constructing itself. */
const DRAW_DUR = 0.55;
const drawStroke: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: 1,
    transition: { duration: DRAW_DUR, ease: SWEEP },
  },
};
const drawArc: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: ARRIVE, delay: DRAW_DUR - 0.05 },
  },
};

const AngleDrawIcon = forwardRef<IconHandle, IconProps>(
  function AngleDrawIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path
            d={RAYS_STROKE}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={reduced ? undefined : drawStroke}
          />
          <motion.path d={ARC} variants={reduced ? undefined : drawArc} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : drawArc} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AngleMeasureIcon }[] = [
  { name: "Measure", blurb: "Arc grows from the vertex", Component: AngleMeasureIcon },
  { name: "Hinge", blurb: "Whole angle swings open & springs back", Component: AngleHingeIcon },
  { name: "Sweep", blurb: "Arc sweeps in like a protractor read (loops)", Component: AngleSweepIcon },
  { name: "Pop", blurb: "Squash-and-pop tap response", Component: AnglePopIcon },
  { name: "Draw", blurb: "Rays extend, then the arc pops in", Component: AngleDrawIcon },
];

export default function AngleLabPage() {
  return <VariantGrid title="Angle" variants={VARIANTS} cycleMs={2600} playMs={1400} />;
}
