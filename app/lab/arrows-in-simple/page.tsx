"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows In Simple (minimize / collapse, two diagonal arrows), 5 candidates.
 *
 * Two corner arrows — top-right and bottom-left — pointing inward. Split into two
 * sub-paths so each moves along its diagonal. Each candidate is grounded in a Disney
 * principle and the diagonal "in" theme.
 */
const TR = "M213.66,53.66,163.31,104H192a8,8,0,0,1,0,16H144a8,8,0,0,1-8-8V64a8,8,0,0,1,16,0V92.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z";
const BL = "M112,136H64a8,8,0,0,0,0,16H92.69L42.34,202.34a8,8,0,0,0,11.32,11.32L104,163.31V192a8,8,0,0,0,16,0V144A8,8,0,0,0,112,136Z";
const ARROWS: { d: string; sx: number; sy: number }[] = [
  { d: TR, sx: 1, sy: -1 },
  { d: BL, sx: -1, sy: 1 },
];
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const OFF = 90; // clear the bounding box toward a corner
const A = 16; // small inward nudge

function makeIcon(variantFor: (sx: number, sy: number, i: number) => Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsInSimpleIcon({ size = 28, style, ...props }, ref) {
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

/* ── 1. CONVERGE — the two arrows fly out to their corners (off the bounding box), hold,
   then come back in. Staging. ────────────────────────────────────────────────────── */
const ConvergeIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, sx * OFF, sx * OFF, 0],
    y: [0, sy * OFF, sy * OFF, 0],
    transition: { duration: 1.0, times: [0, 0.35, 0.5, 1], ease: ["easeIn", "linear", ARRIVE] },
  },
}));

/* ── 2. PULL-IN — each arrow nudges toward the centre and back. Slow in & out. ─────── */
const PullInIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -sx * A, 0], y: [0, -sy * A, 0], transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.45, 1] } },
}));

/* ── 3. STAGGER — the arrows pull in one after the other. Staging / Overlapping. ───── */
const StaggerIcon = makeIcon((sx, sy, i) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -sx * A, 0],
    y: [0, -sy * A, 0],
    transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.45, 1], delay: i * 0.14 },
  },
}));

/* ── 4. SPRING — each pulls in, overshoots back a touch, settles. Follow-through. ──── */
const SpringIcon = makeIcon((sx, sy) => ({
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -sx * A, sx * A * 0.35, 0],
    y: [0, -sy * A, sy * A * 0.35, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.45, 0.72, 1] },
  },
}));

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tap. Appeal. ─────────── */
const PulseIcon = makeIcon(() => ({
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
}));

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof ConvergeIcon }[] = [
  {
    name: "Converge",
    principle: "Staging",
    blurb: "Arrows fly out to their corners off-frame, then come back in",
    Component: ConvergeIcon,
  },
  { name: "Pull-in", principle: "Slow in & out", blurb: "Each arrow nudges toward the centre and back", Component: PullInIcon },
  { name: "Stagger", principle: "Staging", blurb: "The arrows pull in one after the other", Component: StaggerIcon },
  { name: "Spring", principle: "Follow-through", blurb: "Each pulls in, overshoots back a touch, then settles", Component: SpringIcon },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsInSimpleLabPage() {
  return <VariantGrid title="Arrows In Simple" variants={VARIANTS} cycleMs={3000} playMs={1800} />;
}
