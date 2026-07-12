"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows Horizontal (double-headed resize arrow), 5 animation candidates.
 *
 * A single horizontal double-arrow; the natural motion lives on the X axis — stretch,
 * squash, sway. "Rubber Band" is the requested motion: an elastic horizontal stretch
 * that snaps back with a few diminishing wobbles. Each candidate is grounded in a
 * Disney principle and scales about the centre.
 */
const GLYPH =
  "M237.66,133.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,136H43.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L43.31,120H212.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,133.66Z";
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

function makeIcon(v: Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsHorizontalIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
          <motion.path d={GLYPH} variants={reduced ? undefined : v} style={CENTER} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. RUBBER BAND  (requested) — stretches wide along X, then snaps back through a few
   diminishing wobbles, like a released elastic. Squash & stretch / elasticity. ─────── */
const rubberBand: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 1.32, 0.9, 1.1, 0.97, 1],
    transition: { duration: 0.95, times: [0, 0.25, 0.5, 0.7, 0.86, 1], ease: "easeOut" },
  },
};
const RubberBandIcon = makeIcon(rubberBand);

/* ── 2. STRETCH — a single clean horizontal expand and return. Slow in & out. ──────── */
const stretch: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [1, 1.25, 1], transition: { duration: 0.7, ease: ARRIVE, times: [0, 0.5, 1] } },
};
const StretchIcon = makeIcon(stretch);

/* ── 3. SWAY — the whole arrow rocks left then right and back. Arcs / overlapping. ──── */
const sway: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -14, 14, 0], transition: { duration: 0.8, ease: SWEEP, times: [0, 0.33, 0.66, 1] } },
};
const SwayIcon = makeIcon(sway);

/* ── 4. RECOIL — squashes inward first (anticipation), then springs wide and settles.
   Anticipation + Follow-through. ─────────────────────────────────────────────────── */
const recoil: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [1, 0.78, 1.2, 1], transition: { duration: 0.75, times: [0, 0.3, 0.62, 1], ease: ["easeIn", "easeOut", "easeOut"] } },
};
const RecoilIcon = makeIcon(recoil);

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tactile tap. Appeal. ──── */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = makeIcon(pulse);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof RubberBandIcon }[] = [
  {
    name: "Rubber Band",
    principle: "Squash & stretch",
    blurb: "Requested — stretches wide, then snaps back through diminishing wobbles",
    Component: RubberBandIcon,
  },
  { name: "Stretch", principle: "Slow in & out", blurb: "A single clean horizontal expand and return", Component: StretchIcon },
  { name: "Sway", principle: "Arcs", blurb: "The whole arrow rocks left, then right, and back", Component: SwayIcon },
  {
    name: "Recoil",
    principle: "Anticipation",
    blurb: "Squashes inward first, then springs wide and settles",
    Component: RecoilIcon,
  },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsHorizontalLabPage() {
  return <VariantGrid title="Arrows Horizontal" variants={VARIANTS} cycleMs={2900} playMs={1700} />;
}
