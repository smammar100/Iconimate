"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows Merge (two arms converge into a downward arrow), 5 candidates.
 *
 * A single connected glyph: two top arms funnel into a central stem and a down arrow.
 * The motion theme is the downward "merge / send down". Each candidate is grounded in a
 * Disney principle. Plunge is anchored at the funnel mouth (top); the rest move/scale
 * about the centre.
 */
const GLYPH =
  "M192,40v64a8,8,0,0,1-2.34,5.66L136,163.31v49.38l18.34-18.35a8,8,0,0,1,11.32,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,212.69V163.31L66.34,109.66A8,8,0,0,1,64,104V40a8,8,0,0,1,16,0v60.69l48,48,48-48V40a8,8,0,0,1,16,0Z";
const TOP = { transformBox: "view-box" as const, originX: 0.5, originY: 40 / 256 };
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

function makeIcon(v: Variants, origin?: typeof CENTER) {
  return forwardRef<IconHandle, IconProps>(function ArrowsMergeIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path d={GLYPH} variants={reduced ? undefined : v} style={origin} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. DROP  (shipped) — a small wind-up, then the whole glyph drops down past rest and
   glides home. Anticipation + Follow-through. ────────────────────────────────────── */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -10, 24, 0], transition: { duration: 0.8, times: [0, 0.22, 0.52, 1], ease: ["easeOut", "easeIn", ARRIVE] } },
};
const DropIcon = makeIcon(drop);

/* ── 2. PLUNGE — anchored at the funnel mouth, the glyph squashes then stretches down
   the stem and recoils — like something pouring through. Squash & stretch. ───────── */
const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: { scaleY: [1, 0.88, 1.12, 0.96, 1], transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] } },
};
const PlungeIcon = makeIcon(plunge, TOP);

/* ── 3. BOB — a calm downward nudge and back. Slow in & out. ───────────────────────── */
const bob: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 16, 0], transition: { duration: 0.7, ease: SWEEP, times: [0, 0.5, 1] } },
};
const BobIcon = makeIcon(bob);

/* ── 4. SPRING — drops down, overshoots back up a touch, then settles. Follow-through. */
const spring: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 26, -5, 0], transition: { duration: 0.7, ease: "easeOut", times: [0, 0.45, 0.7, 1] } },
};
const SpringIcon = makeIcon(spring);

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tap. Appeal. ─────────── */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = makeIcon(pulse, CENTER);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof DropIcon }[] = [
  { name: "Drop", principle: "Anticipation", blurb: "Shipped — winds up, drops down past rest, glides home", Component: DropIcon },
  {
    name: "Plunge",
    principle: "Squash & stretch",
    blurb: "Squashes then stretches down the stem from the mouth, recoils",
    Component: PlungeIcon,
  },
  { name: "Bob", principle: "Slow in & out", blurb: "A calm downward nudge and back", Component: BobIcon },
  { name: "Spring", principle: "Follow-through", blurb: "Drops down, overshoots back a touch, then settles", Component: SpringIcon },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsMergeLabPage() {
  return <VariantGrid title="Arrows Merge" variants={VARIANTS} cycleMs={2900} playMs={1700} />;
}
