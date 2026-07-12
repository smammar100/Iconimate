"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows In (minimize / collapse), 5 animation candidates.
 *
 * Four corner arrows pointing inward. Splitting the glyph into its four sub-arrows lets
 * each move along its own diagonal. One candidate is the requested "come in from their
 * directions": the arrows fly out to their corners, off the bounding box, then return.
 * Each is grounded in a Disney principle.
 */
// Four corner arrows (relative moves resolved to absolute). Sign = its outward diagonal.
const TR = "M144,104V64a8,8,0,0,1,16,0V84.69l42.34-42.35a8,8,0,0,1,11.32,11.32L171.31,96H192a8,8,0,0,1,0,16H152A8,8,0,0,1,144,104Z";
const BL = "M104,144H64a8,8,0,0,0,0,16H84.69L42.34,202.34a8,8,0,0,0,11.32,11.32L96,171.31V192a8,8,0,0,0,16,0V152A8,8,0,0,0,104,144Z";
const BR = "M171.31,160H192a8,8,0,0,0,0-16H152a8,8,0,0,0-8,8v40a8,8,0,0,0,16,0V171.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z";
const TL = "M104,56a8,8,0,0,0-8,8V84.69L53.66,42.34A8,8,0,0,0,42.34,53.66L84.69,96H64a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V64A8,8,0,0,0,104,56Z";
const ARROWS: { d: string; sx: number; sy: number }[] = [
  { d: TR, sx: 1, sy: -1 },
  { d: BL, sx: -1, sy: 1 },
  { d: BR, sx: 1, sy: 1 },
  { d: TL, sx: -1, sy: -1 },
];
// Scale about the glyph centre (view-box 128,128); harmless for translate variants.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const OFF = 90; // travel to clear the bounding box toward a corner
const A = 16; // small inward nudge

function makeIcon(variantFor: (sx: number, sy: number, i: number) => Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsInIcon({ size = 28, style, ...props }, ref) {
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
          {ARROWS.map(({ d, sx, sy }, i) => (
            <motion.path key={i} d={d} variants={reduced ? undefined : variantFor(sx, sy, i)} style={CENTER} />
          ))}
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. CONVERGE  (requested) — the four arrows fly out to their corners (off the
   bounding box), hold a beat, then come back in from those directions. Staging. ───── */
const ConvergeIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, sx * OFF, sx * OFF, 0],
    y: [0, sy * OFF, sy * OFF, 0],
    transition: { duration: 1.0, times: [0, 0.35, 0.5, 1], ease: ["easeIn", "linear", ARRIVE] },
  },
}));

/* ── 2. PULL-IN — each arrow nudges toward the centre and back — the collapse gesture.
   Slow in & out. ─────────────────────────────────────────────────────────────────── */
const PullInIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -sx * A, 0], y: [0, -sy * A, 0], transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.45, 1] } },
}));

/* ── 3. STAGGER — the arrows pull in one after another, corner by corner. Staging /
   Overlapping action. ────────────────────────────────────────────────────────────── */
const StaggerIcon = makeIcon((sx, sy, i) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -sx * A, 0],
    y: [0, -sy * A, 0],
    transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.45, 1], delay: i * 0.1 },
  },
}));

/* ── 4. SPRING — each arrow pulls in, overshoots back out a touch, then settles.
   Follow-through. ────────────────────────────────────────────────────────────────── */
const SpringIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -sx * A, sx * A * 0.35, 0],
    y: [0, -sy * A, sy * A * 0.35, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.45, 0.72, 1] },
  },
}));

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tactile tap. Appeal. ──── */
const PulseIcon = makeIcon(() => ({
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
}));

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof ConvergeIcon }[] = [
  {
    name: "Converge",
    principle: "Staging",
    blurb: "Requested — arrows fly out to their corners off-frame, then come back in",
    Component: ConvergeIcon,
  },
  { name: "Pull-in", principle: "Slow in & out", blurb: "Each arrow nudges toward the centre and back", Component: PullInIcon },
  {
    name: "Stagger",
    principle: "Staging",
    blurb: "The arrows pull in one after another, corner by corner",
    Component: StaggerIcon,
  },
  {
    name: "Spring",
    principle: "Follow-through",
    blurb: "Each pulls in, overshoots back a touch, then settles",
    Component: SpringIcon,
  },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsInLabPage() {
  return <VariantGrid title="Arrows In" variants={VARIANTS} cycleMs={3000} playMs={1800} />;
}
