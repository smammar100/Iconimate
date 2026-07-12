"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrow Elbow Down-Left, 6 animation candidates.
 *
 * The shaft drops from the top-right, elbows, and points down-left. "Shoot" is the
 * shipped motion: load back up-right, then fire down-left and glide home. The rest
 * explore the same down-left axis with different energy.
 */
const ARROW =
  "M200,32V176a8,8,0,0,1-8,8H67.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48a8,8,0,0,1,11.32,11.32L67.31,168H184V32a8,8,0,0,1,16,0Z";
// Tail (top of the shaft) and tip (the arrowhead) in normalized view-box space.
const TAIL = { x: 200 / 256, y: 32 / 256 };
const CENTER = { x: 0.5, y: 0.5 };

/* ── 1. SHOOT  (shipped) ───────────────────────────────────────────────────────
   Loads back up-right along its axis, then fires down-left past rest and glides
   home — a single fired shot. */
const shoot: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 11, -46, 0],
    y: [0, -11, 46, 0],
    transition: { duration: 0.7, times: [0, 0.22, 0.46, 1], ease: ["easeInOut", "easeOut", ARRIVE] },
  },
};
const ShootIcon = forwardRef<IconHandle, IconProps>(function ShootIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : shoot} />
      </Svg>
    </div>
  );
});

/* ── 2. GLIDE ──────────────────────────────────────────────────────────────────
   A calm one-way slide down-left and back — a gentle directional nudge. */
const glide: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -22, 0], y: [0, 22, 0], transition: { duration: 0.7, ease: SWEEP, times: [0, 0.45, 1] } },
};
const GlideIcon = forwardRef<IconHandle, IconProps>(function GlideIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : glide} />
      </Svg>
    </div>
  );
});

/* ── 3. RECOIL ─────────────────────────────────────────────────────────────────
   Heavy anticipation: a big wind back up-right, then a snappy release down-left. */
const recoil: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 26, -34, 0],
    y: [0, -26, 34, 0],
    transition: { duration: 0.8, times: [0, 0.4, 0.62, 1], ease: ["easeOut", "easeIn", ARRIVE] },
  },
};
const RecoilIcon = forwardRef<IconHandle, IconProps>(function RecoilIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : recoil} />
      </Svg>
    </div>
  );
});

/* ── 4. STRETCH ────────────────────────────────────────────────────────────────
   The glyph stretches toward its tip and snaps back — a launch felt as elongation,
   anchored at the tail. */
const stretch: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.86, 1.18, 0.96, 1],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] },
  },
};
const StretchIcon = forwardRef<IconHandle, IconProps>(function StretchIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : stretch}
          style={{ transformBox: "view-box", originX: TAIL.x, originY: TAIL.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 5. NUDGE ──────────────────────────────────────────────────────────────────
   A quick repeating down-left tap — a subtle "go this way" idle. */
const nudge: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -9, 0],
    y: [0, 9, 0],
    transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2 },
  },
};
const NudgeIcon = forwardRef<IconHandle, IconProps>(function NudgeIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : nudge} />
      </Svg>
    </div>
  );
});

/* ── 6. PULSE ──────────────────────────────────────────────────────────────────
   A tactile uniform squash-and-pop about the center — a tap acknowledgement. */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.86, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = forwardRef<IconHandle, IconProps>(function PulseIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof ShootIcon }[] = [
  { name: "Shoot", blurb: "Shipped — loads back, then fires down-left and glides home", Component: ShootIcon },
  { name: "Glide", blurb: "Calm one-way slide down-left and back", Component: GlideIcon },
  { name: "Recoil", blurb: "Heavy wind-back, snappy release", Component: RecoilIcon },
  { name: "Stretch", blurb: "Elongates toward the tip from the tail", Component: StretchIcon },
  { name: "Nudge", blurb: "Quick repeating down-left tap — idle", Component: NudgeIcon },
  { name: "Pulse", blurb: "Uniform squash-and-pop tap response", Component: PulseIcon },
];

export default function ArrowElbowDownLeftLabPage() {
  return <VariantGrid title="Arrow Elbow Down-Left" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
