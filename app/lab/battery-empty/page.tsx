"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Empty icon (Phosphor "battery-empty"), 5 candidates.
 *
 * The glyph is a battery with an EMPTY interior, so the stories are about
 * absence: draining, warning, failing to charge, running down. Per the house
 * rule: the glyph is NEVER altered (renders pixel-identical) and NOTHING is
 * filled — the "level" is line-art STROKE capsule bars, and everything added is
 * opacity 0 in the normal state so rest stays empty and exact.
 *
 * Geometry (256 grid): case x8..224 y56..200, interior x24..208 y72..184
 * (center ≈ 116,128); nub x240..256 y88..168 (ENDS AT x=256 — whole-glyph
 * shakes use rotate + y only, never +x, or the nub clips against the box).
 */
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
// Reused lightning mark (same as the charging cell), centered in the interior.
const BOLT =
  "M138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z";

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOLT_C = { transformBox: "view-box" as const, originX: 116 / 256, originY: 126 / 256 };
const BAR = "M0,-22 l0,44";

/* ── 1. DRAIN ────────────────────────────────────────────────────────────────
   Four level bars flash in full, then deplete right → left down to empty —
   the charge running out. */
const DRAIN_BARS = [52, 92, 132, 172];
const drainBar = (i: number): Variants => ({
  normal: { opacity: 0, scaleY: 1, transition: { duration: 0 } },
  animate: {
    // All snap in, hold, then fade out one by one from the right (last index
    // leaves first). Drain window 0.4..0.95, staggered by reversed index.
    opacity: [0, 1, 1, 0],
    scaleY: [1, 1, 1, 0.6],
    transition: {
      duration: 1.5,
      times: [0, 0.15, 0.42 + (3 - i) * 0.12, 0.55 + (3 - i) * 0.12],
      ease: "easeInOut",
    },
  },
});

const BatteryDrainIcon = forwardRef<IconHandle, IconProps>(
  function BatteryDrainIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          {!reduced &&
            DRAIN_BARS.map((x, i) => (
              <g key={i} transform={`translate(${x} 128)`}>
                <motion.path
                  d={BAR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={14}
                  strokeLinecap="round"
                  variants={drainBar(i)}
                  style={{ transformBox: "view-box", originX: x / 256, originY: 0.5 }}
                />
              </g>
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── 2. BLINK ────────────────────────────────────────────────────────────────
   Low-battery warning: the whole cell flashes three times, fast, with a tiny
   nervous shake (rotate + y — the nub is at the right edge). */
const blink: Variants = {
  normal: { opacity: 1, rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.25, 1, 0.25, 1, 0.25, 1],
    rotate: [0, -1, 1, -1, 1, -0.5, 0],
    y: [0, 1, -1, 1, -1, 0.5, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 1] },
  },
};

const BatteryBlinkIcon = forwardRef<IconHandle, IconProps>(
  function BatteryBlinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : blink} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. BOLT ─────────────────────────────────────────────────────────────────
   Reaching for charge: a lightning bolt flickers into the empty cell, struggles
   to hold, and dies out — no juice yet. */
const boltTry: Variants = {
  normal: { opacity: 0, scale: 0.7, transition: { duration: 0 } },
  animate: {
    opacity: [0, 0.9, 0.3, 0.9, 0.2, 0.6, 0],
    scale: [0.7, 1.05, 0.95, 1.05, 0.9, 1, 0.85],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.18, 0.32, 0.48, 0.62, 0.78, 1] },
  },
};

const BatteryBoltIcon = forwardRef<IconHandle, IconProps>(
  function BatteryBoltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          {!reduced && <motion.path d={BOLT} variants={boltTry} style={BOLT_C} />}
        </Svg>
      </div>
    );
  },
);

/* ── 4. SHUDDER ──────────────────────────────────────────────────────────────
   Out of energy: a weak dying rattle — a quick shudder that fades to stillness.
   Rotate + y only (nub at the right edge). */
const shudder: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2, 1.6, -1.2, 0.8, -0.4, 0.15, 0],
    y: [0, 1.5, -1.2, 0.9, -0.6, 0.3, -0.1, 0],
    transition: { duration: 0.85, ease: "easeOut", times: [0, 0.12, 0.26, 0.4, 0.55, 0.7, 0.85, 1] },
  },
};

const BatteryShudderIcon = forwardRef<IconHandle, IconProps>(
  function BatteryShudderIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : shudder} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. TRY-FILL ─────────────────────────────────────────────────────────────
   A failed charge: one bar creeps in from the left, reaches only a quarter, and
   drops back to nothing — can't take a charge. */
const tryFill: Variants = {
  normal: { opacity: 0, x: 0, transition: { duration: 0 } },
  animate: {
    // Grows in near the left wall, edges right a little, then collapses back.
    opacity: [0, 1, 1, 0],
    x: [0, 6, 10, 0],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.3, 0.6, 0.95] },
  },
};
const tryFillScale: Variants = {
  normal: { scaleY: 0.5, transition: { duration: 0 } },
  animate: {
    scaleY: [0.5, 1, 1, 0.4],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.3, 0.6, 0.95] },
  },
};

const BatteryTryFillIcon = forwardRef<IconHandle, IconProps>(
  function BatteryTryFillIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          {!reduced && (
            // Outer <g> translates (x drift); inner path scales (fill height).
            <motion.g variants={tryFill} transform="translate(52 128)">
              <motion.path
                d={BAR}
                fill="none"
                stroke="currentColor"
                strokeWidth={14}
                strokeLinecap="round"
                variants={tryFillScale}
                style={{ transformBox: "view-box", originX: 52 / 256, originY: 0.5 }}
              />
            </motion.g>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 6. ALARM (Blink + Shudder) ──────────────────────────────────────────────
   The two whole-glyph warnings fused into one panic: the cell flashes the
   low-battery alert AND rattles, each flash paired with a shake kick, the whole
   thing decaying to bright and still — a device gasping its last warning.
   Rotate + y only (the nub is at the right edge; +x would clip it). */
const alarm: Variants = {
  normal: { opacity: 1, rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.25, 1, 0.28, 1, 0.35, 1],
    rotate: [0, -2.2, 1.6, -1.8, 1.1, -0.6, 0],
    y: [0, 1.6, -1.2, 1.3, -0.8, 0.4, 0],
    transition: { duration: 1.15, ease: "easeInOut", times: [0, 0.14, 0.28, 0.42, 0.56, 0.72, 1] },
  },
};

const BatteryAlarmIcon = forwardRef<IconHandle, IconProps>(
  function BatteryAlarmIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : alarm} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. FAULT (Bolt + Shudder) ───────────────────────────────────────────────
   A faulty charge: the cell shudders while a bolt flickers in trying to hold —
   and dies out anyway. The bolt rides INSIDE the shudder group so it rattles
   with the cell, its own flicker layered on top; the two run on one 1.3s clock
   so each bolt stutter lands on a shake kick. Rotate + y only (nub at the right
   edge). */
const FAULT_DUR = 1.3;
const faultShudder: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2, 1.5, -1.3, 0.9, -0.5, 0.2, 0],
    y: [0, 1.4, -1.1, 0.8, -0.5, 0.3, -0.1, 0],
    transition: { duration: FAULT_DUR, ease: "easeOut", times: [0, 0.12, 0.24, 0.38, 0.52, 0.66, 0.8, 1] },
  },
};
const faultBolt: Variants = {
  normal: { opacity: 0, scale: 0.7, transition: { duration: 0 } },
  animate: {
    opacity: [0, 0.9, 0.3, 0.9, 0.2, 0.6, 0],
    scale: [0.7, 1.05, 0.95, 1.05, 0.9, 1, 0.85],
    transition: { duration: FAULT_DUR, ease: "easeInOut", times: [0, 0.18, 0.32, 0.48, 0.62, 0.78, 1] },
  },
};

const BatteryFaultIcon = forwardRef<IconHandle, IconProps>(
  function BatteryFaultIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : faultShudder} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={reduced ? undefined : faultBolt} style={BOLT_C} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryDrainIcon }[] = [
  { name: "Drain", blurb: "Four bars flash in, then deplete to empty", Component: BatteryDrainIcon },
  { name: "Blink", blurb: "Low-battery warning — flashes three times with a shake", Component: BatteryBlinkIcon },
  { name: "Bolt", blurb: "A charge bolt flickers in, struggles, dies out", Component: BatteryBoltIcon },
  { name: "Shudder", blurb: "Out of energy — a weak dying rattle", Component: BatteryShudderIcon },
  { name: "Try-Fill", blurb: "A bar creeps in a quarter, then drops back to nothing", Component: BatteryTryFillIcon },
  { name: "Alarm", blurb: "Blink + Shudder — flashes and rattles the low-battery panic", Component: BatteryAlarmIcon },
  { name: "Fault", blurb: "Bolt + Shudder — cell rattles as a charge bolt flickers and dies", Component: BatteryFaultIcon },
];

export default function BatteryEmptyLabPage() {
  return <VariantGrid title="Battery Empty" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
