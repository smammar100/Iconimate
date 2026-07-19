"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Full icon (Phosphor "battery-full"), 5 candidates designed as a
 * deliberate ESCALATION — each adds a dimension the previous one lacks:
 *   1 Blink   — opacity only
 *   2 Pulse   — + scale + rhythm
 *   3 Wave    — + direction + stagger
 *   4 Fill    — + physics + narrative (dip & spring)
 *   5 Charge  — + multi-layer choreography (bars fill, then the cell confirms)
 *
 * The four level bars are the glyph's own subpaths (union byte-identical), so
 * nothing is added and nothing is filled — the animations only move existing
 * ink. Geometry: bars at x-centers 56/96/136/176 (y96..160, base y160); nub
 * x240..256 (ENDS AT x=256 — whole-glyph moves use y + scaleY only, never
 * scaleX or +x, or the nub clips against the box).
 */
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BARS = [
  { d: "M64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 56 },
  { d: "M104,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 96 },
  { d: "M144,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 136 },
  { d: "M184,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 176 },
];

/* Shell: static case + nub, bars supplied by a per-bar variant factory. `pivotY`
   picks the bar's transform origin — center (128) for symmetric pulses, base
   (160) for grow-from-the-bottom fills. */
function BarShell({
  reduced,
  variant,
  pivotY = 128,
}: {
  reduced: boolean;
  variant: (i: number) => Variants;
  pivotY?: number;
}) {
  return (
    <>
      <path d={CASE} />
      <path d={NUB} />
      {BARS.map((b, i) => (
        <motion.path
          key={i}
          d={b.d}
          variants={reduced ? undefined : variant(i)}
          style={AT(b.cx, pivotY)}
        />
      ))}
    </>
  );
}

function makeIcon(variant: (i: number) => Variants, pivotY?: number) {
  return forwardRef<IconHandle, IconProps>(function BatteryFullIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <BarShell reduced={reduced} variant={variant} pivotY={pivotY} />
        </Svg>
      </div>
    );
  });
}

/* ── 1. BLINK — opacity only ─────────────────────────────────────────────────
   The floor: the level dims and brightens once. Nothing moves. */
const blink = (): Variants => ({
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.3, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.4, 1] },
  },
});
const BatteryBlinkIcon = makeIcon(blink);

/* ── 2. PULSE — + scale + rhythm ─────────────────────────────────────────────
   Better: the bars gain life — a calm double breath, all together. */
const pulse = (): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.14, 1, 1.14, 1],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
});
const BatteryPulseIcon = makeIcon(pulse);

/* ── 3. WAVE — + direction + stagger ─────────────────────────────────────────
   Better: the pulse gains travel — a highlight sweeps left → right, each bar
   popping as it passes. Now the eye follows a direction. */
const wave = (i: number): Variants => ({
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.8, ease: "easeInOut", delay: i * 0.13, times: [0, 0.4, 1] },
  },
});
const BatteryWaveIcon = makeIcon(wave);

/* ── 4. FILL — + physics + narrative ─────────────────────────────────────────
   Better: it tells a story with weight — each bar dips low, then springs back
   up past its mark and settles, left → right. Grows from the base. */
const fill = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.2, 1.16, 1],
    transition: { duration: 0.85, ease: OVERSHOOT, delay: i * 0.14, times: [0, 0.32, 0.72, 1] },
  },
});
const BatteryFillIcon = makeIcon(fill, 160);

/* ── 5. CHARGE — + multi-layer choreography (the hero) ───────────────────────
   Best: two coordinated layers. The bars spring-fill left → right from the
   base (the charge climbing the meter), and as the last one lands the WHOLE
   cell answers with a confident settle — a tiny squash-and-recover pulse that
   reads as "topped up, confirmed". Whole-glyph move is scaleY + y only (the nub
   is at the right edge). */
const CHARGE_DUR = 1.35;
const chargeBar = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Fill window ≈ 0..0.62 of the timeline (last bar delay 0.18 + span),
    // leaving room for the cell's confirm afterward.
    scaleY: [1, 0.18, 1.18, 1, 1],
    transition: {
      duration: CHARGE_DUR,
      ease: OVERSHOOT,
      times: [0, 0.14 + i * 0.06, 0.34 + i * 0.06, 0.5 + i * 0.06, 1],
    },
  },
});
const chargeCell: Variants = {
  normal: { scaleY: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    // The confirm: holds still while the bars fill, then a squash-recover
    // once the last bar has landed (~0.72 onward).
    scaleY: [1, 1, 0.94, 1.04, 1],
    y: [0, 0, 3, -2, 0],
    transition: { duration: CHARGE_DUR, ease: OVERSHOOT, times: [0, 0.72, 0.82, 0.92, 1] },
  },
};

const BatteryChargeIcon = forwardRef<IconHandle, IconProps>(
  function BatteryChargeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* Outer group = the whole-cell confirm; squash about the base. */}
          <motion.g variants={reduced ? undefined : chargeCell} style={AT(128, 200)}>
            <path d={CASE} />
            <path d={NUB} />
            {BARS.map((b, i) => (
              <motion.path
                key={i}
                d={b.d}
                variants={reduced ? undefined : chargeBar(i)}
                style={AT(b.cx, 160)}
              />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. LEVEL UP — bars fill in one by one ───────────────────────────────────
   The meter charges from empty: all bars reset to nothing, then each pops up
   from the base in turn, left → right, with a little overshoot as it lands.
   The stagger lives in each bar's `times` (not `delay`) so every bar sits at 0
   from the first frame and waits its turn — a `delay` would leave it full until
   its slot, then jump to empty. Base-anchored (grow from the bottom). */
const levelUp = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Hold empty → pop → settle → hold full, each bar shifted 0.18 later.
    scaleY: [0, 0, 1.18, 1, 1],
    transition: {
      duration: 1.6,
      ease: OVERSHOOT,
      times: [0, 0.1 + i * 0.18, 0.22 + i * 0.18, 0.32 + i * 0.18, 1],
    },
  },
});
const BatteryLevelUpIcon = makeIcon(levelUp, 160);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryBlinkIcon }[] = [
  { name: "1 · Blink", blurb: "Opacity only — the level dims and brightens once", Component: BatteryBlinkIcon },
  { name: "2 · Pulse", blurb: "+ scale & rhythm — the bars breathe twice together", Component: BatteryPulseIcon },
  { name: "3 · Wave", blurb: "+ direction & stagger — a highlight sweeps left → right", Component: BatteryWaveIcon },
  { name: "4 · Fill", blurb: "+ physics — each bar dips and springs back, in sequence", Component: BatteryFillIcon },
  { name: "5 · Charge", blurb: "+ choreography — bars fill, then the whole cell confirms", Component: BatteryChargeIcon },
  { name: "6 · Level Up", blurb: "Empty, then bars pop in one by one, left → right", Component: BatteryLevelUpIcon },
];

export default function BatteryFullLabPage() {
  return <VariantGrid title="Battery Full" variants={VARIANTS} cycleMs={2900} playMs={1800} />;
}
