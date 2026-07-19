"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Charging icon (Phosphor "battery-charging"), 5 candidates.
 *
 * The glyph splits at its own subpath boundaries into three independent
 * actors — CASE (outline + interior hole), NUB (the right-side terminal), and
 * BOLT (the lightning mark) — whose union is byte-identical to the original.
 * Added elements follow the house rule from the bathtub set: line-art STROKES
 * only (round-cap capsules for charge pips / energy dashes), never fills, and
 * the glyph itself is never redrawn.
 *
 * Geometry (256 grid): case x8..224 y56..200 (interior x24..208 y72..184);
 * bolt bbox ≈ x92..139, y85..168, center ≈ (116,126); nub x240..256 y88..168.
 * Bounds: the nub ENDS AT x=256 exactly — whole-glyph motion must never add
 * positive x (the wrapper clips), so shakes use rotate + y only.
 */
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BOLT =
  "M138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z";

const BOLT_C = AT(116, 126);
const GLYPH_C = AT(128, 128);

/* ── 1. STRIKE ───────────────────────────────────────────────────────────────
   The bolt is the star: a quick anticipation shrink, then it pops back with
   overshoot and a snap of rotation — power just hit. The case answers with a
   barely-there squash. */
const strikeBolt: Variants = {
  normal: { scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.72, 1.22, 0.96, 1],
    rotate: [0, -6, 8, -3, 0],
    transition: { duration: 0.7, ease: OVERSHOOT, times: [0, 0.25, 0.55, 0.8, 1] },
  },
};
const strikeCase: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.97, 1.01, 1],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.5, 0.62, 0.82, 1] },
  },
};

const BatteryStrikeIcon = forwardRef<IconHandle, IconProps>(
  function BatteryStrikeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : strikeCase} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
          <motion.path d={BOLT} variants={reduced ? undefined : strikeBolt} style={BOLT_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. PULSE ────────────────────────────────────────────────────────────────
   The charging heartbeat: the bolt breathes twice — swell, relax, swell —
   while the nub blips in sympathy half a beat later, like current passing
   through the terminal. */
const pulseBolt: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.14, 1, 1.14, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.22, 0.5, 0.72, 1] },
  },
};
const pulseNub: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.25, 1, 1.25, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.32, 0.6, 0.82, 1] },
  },
};

const BatteryPulseIcon = forwardRef<IconHandle, IconProps>(
  function BatteryPulseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <motion.path d={NUB} variants={reduced ? undefined : pulseNub} style={AT(248, 128)} />
          <motion.path d={BOLT} variants={reduced ? undefined : pulseBolt} style={BOLT_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. CHARGE ───────────────────────────────────────────────────────────────
   The level fills: four capsule pips (round-cap strokes, no fill) light up in
   sequence around the bolt — left pair, then right pair — and the bolt gives a
   satisfied pop when the last one lands. Charged. */
const PIPS = [
  { x: 44, delay: 0.0 },
  { x: 66, delay: 0.18 },
  { x: 166, delay: 0.36 },
  { x: 188, delay: 0.54 },
];
const pip = (delay: number): Variants => ({
  normal: { opacity: 0, scaleY: 0.4, transition: { duration: 0 } },
  animate: {
    opacity: [0, 1],
    scaleY: [0.4, 1.12, 1],
    transition: { duration: 0.34, ease: "easeOut", delay, times: [0, 0.7, 1] },
  },
});
const chargeBolt: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // Pops as the final pip lands (last delay 0.54 + 0.34 ≈ 0.88).
    scale: [1, 1, 1.16, 1],
    transition: { duration: 1.3, ease: "easeOut", times: [0, 0.66, 0.8, 1] },
  },
};

const BatteryChargeIcon = forwardRef<IconHandle, IconProps>(
  function BatteryChargeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          <motion.path d={BOLT} variants={reduced ? undefined : chargeBolt} style={BOLT_C} />
          {!reduced &&
            PIPS.map((p, i) => (
              // Wrapper <g> carries placement — Motion's style.transform would
              // override a transform attribute on the same element.
              <g key={i} transform={`translate(${p.x} 128)`}>
                <motion.path
                  d="M0,-26 l0,52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={14}
                  strokeLinecap="round"
                  variants={pip(p.delay)}
                  style={{ transformBox: "view-box", originX: p.x / 256, originY: 0.5 }}
                />
              </g>
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── 4. JOLT ─────────────────────────────────────────────────────────────────
   Current stabilizing: the bolt flickers like a faulty tube — three rapid
   dips — while the whole battery shivers, then everything steadies bright.
   The shake is rotate + y ONLY: the nub ends at x=256 exactly, so any
   positive x would clip it against the box. */
const joltAll: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -1.5, 1.5, -1, 0.5, 0],
    y: [0, 2, -2, 1.5, -0.5, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.72, 1] },
  },
};
const joltBolt: Variants = {
  normal: { opacity: 1, transition: { duration: 0 } },
  animate: {
    opacity: [1, 0.35, 1, 0.3, 0.9, 0.4, 1],
    transition: { duration: 0.9, ease: "linear", times: [0, 0.12, 0.24, 0.38, 0.52, 0.64, 0.8] },
  },
};

const BatteryJoltIcon = forwardRef<IconHandle, IconProps>(
  function BatteryJoltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : joltAll} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={reduced ? undefined : joltBolt} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. FLOW ─────────────────────────────────────────────────────────────────
   Energy streams in: three capsule dashes glide from inside the left wall
   toward the bolt and are absorbed, the bolt swelling a touch with each
   arrival — charge flowing into the cell. */
const DASHES = [
  { y: 108, delay: 0.0 },
  { y: 128, delay: 0.22 },
  { y: 148, delay: 0.44 },
];
const dash = (delay: number): Variants => ({
  normal: { x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    // From just inside the left wall (x36) to the bolt's edge (x88): +52.
    x: [0, 52],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn", delay, times: [0, 0.15, 0.8, 1] },
  },
});
const flowBolt: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // Three small swells timed to the dash arrivals (~0.5, 0.72, 0.94).
    scale: [1, 1.07, 1, 1.07, 1, 1.09, 1],
    transition: { duration: 1.3, ease: "easeOut", times: [0, 0.4, 0.5, 0.57, 0.66, 0.75, 1] },
  },
};

const BatteryFlowIcon = forwardRef<IconHandle, IconProps>(
  function BatteryFlowIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          <motion.path d={BOLT} variants={reduced ? undefined : flowBolt} style={BOLT_C} />
          {!reduced &&
            DASHES.map((d, i) => (
              // Wrapper <g> for placement; Motion overrides transform attrs.
              <g key={i} transform={`translate(36 ${d.y})`}>
                <motion.path
                  d="M0,0 l14,0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={10}
                  strokeLinecap="round"
                  variants={dash(d.delay)}
                />
              </g>
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── 6. SURGE (Jolt → Strike, in sequence) ───────────────────────────────────
   The two gestures as one story: power arrives dirty — the bolt flickers and
   the whole battery shivers (Jolt, first half) — then the current locks in and
   the bolt strikes home with the anticipation-shrink → overshoot pop (Strike,
   second half), the case answering with its little squash. The shiver stays
   rotate + y only (the nub ends at x=256; any +x would clip). Flicker and pop
   share the bolt element via per-property transitions — keyframing them on one
   timeline would stall each channel at the other's boundaries. */
const SURGE_DUR = 1.25;
const surgeAll: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -1.5, 1.5, -1, 0.5, 0, 0],
    y: [0, 2, -2, 1.5, -0.5, 0, 0],
    transition: { duration: SURGE_DUR, ease: "easeInOut", times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] },
  },
};
const surgeBolt: Variants = {
  normal: { opacity: 1, scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.35, 1, 0.3, 1, 1],
    scale: [1, 1, 0.72, 1.22, 0.96, 1],
    rotate: [0, 0, -6, 8, -3, 0],
    transition: {
      duration: SURGE_DUR,
      opacity: { ease: "linear", times: [0, 0.08, 0.2, 0.32, 0.44, 1] },
      scale: { ease: OVERSHOOT, times: [0, 0.45, 0.58, 0.78, 0.9, 1] },
      rotate: { ease: OVERSHOOT, times: [0, 0.45, 0.58, 0.78, 0.9, 1] },
    },
  },
};
const surgeCase: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Squash answers the pop's landing (~0.78 of the timeline).
    scaleY: [1, 1, 0.97, 1.01, 1],
    transition: { duration: SURGE_DUR, ease: "easeOut", times: [0, 0.72, 0.82, 0.92, 1] },
  },
};

const BatterySurgeIcon = forwardRef<IconHandle, IconProps>(
  function BatterySurgeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : surgeAll} style={GLYPH_C}>
            <motion.g variants={reduced ? undefined : surgeCase} style={GLYPH_C}>
              <path d={CASE} />
              <path d={NUB} />
            </motion.g>
            <motion.path d={BOLT} variants={reduced ? undefined : surgeBolt} style={BOLT_C} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. STATIC (Flow → Jolt, cause and effect) ───────────────────────────────
   The two gestures wired together: the energy dashes stream in (Flow), and
   EACH ARRIVAL rattles the cell — a flicker dip on the bolt plus a micro-
   shiver of the whole battery, synced to the three impacts (~0.36, 0.51, 0.67
   of the timeline) — until the third lands and the charge steadies bright.
   Shiver is rotate + y only (the nub ends at x=256; +x would clip). */
const STATIC_DUR = 1.4;
// Dash arrivals as fractions of STATIC_DUR: delays 0/0.22/0.44s + 0.5s flight.
const staticDash = (delay: number): Variants => ({
  normal: { x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    x: [0, 52],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn", delay, times: [0, 0.15, 0.8, 1] },
  },
});
const staticAll: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    // Three micro-shakes, one per arrival, each smaller recovery than the last
    // shake is strong — the third impact rings the longest, then settles.
    rotate: [0, 0, -1.2, 0.9, 0, -1.2, 0.9, 0, -1.5, 1, -0.4, 0],
    y: [0, 0, 1.6, -1.2, 0, 1.6, -1.2, 0, 2, -1.4, 0.5, 0],
    transition: {
      duration: STATIC_DUR,
      ease: "easeInOut",
      times: [0, 0.34, 0.38, 0.44, 0.5, 0.53, 0.59, 0.65, 0.69, 0.77, 0.87, 1],
    },
  },
};
const staticBolt: Variants = {
  normal: { opacity: 1, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // A flicker dip + small swell per arrival; steady bright after the third.
    opacity: [1, 1, 0.4, 1, 0.45, 1, 0.35, 1, 1],
    scale: [1, 1, 1.05, 1, 1.06, 1, 1.1, 1.02, 1],
    transition: {
      duration: STATIC_DUR,
      opacity: { ease: "linear", times: [0, 0.34, 0.39, 0.49, 0.54, 0.64, 0.69, 0.8, 1] },
      scale: { ease: "easeOut", times: [0, 0.34, 0.4, 0.5, 0.55, 0.65, 0.71, 0.85, 1] },
    },
  },
};

const BatteryStaticIcon = forwardRef<IconHandle, IconProps>(
  function BatteryStaticIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : staticAll} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={reduced ? undefined : staticBolt} style={BOLT_C} />
            {/* Dashes ride inside the shiver group so impacts shake them too. */}
            {!reduced &&
              DASHES.map((d, i) => (
                // Wrapper <g> for placement; Motion overrides transform attrs.
                <g key={i} transform={`translate(36 ${d.y})`}>
                  <motion.path
                    d="M0,0 l14,0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeLinecap="round"
                    variants={staticDash(d.delay)}
                  />
                </g>
              ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryStrikeIcon }[] = [
  { name: "Strike", blurb: "The bolt shrinks, then pops back with a snap", Component: BatteryStrikeIcon },
  { name: "Pulse", blurb: "Charging heartbeat — bolt breathes, nub blips", Component: BatteryPulseIcon },
  { name: "Charge", blurb: "Capsule pips light up in sequence; bolt pops when full", Component: BatteryChargeIcon },
  { name: "Jolt", blurb: "Bolt flickers, battery shivers, current steadies", Component: BatteryJoltIcon },
  { name: "Flow", blurb: "Energy dashes stream in and feed the bolt", Component: BatteryFlowIcon },
  { name: "Surge", blurb: "Flickers & shivers, then the bolt strikes home", Component: BatterySurgeIcon },
  { name: "Static", blurb: "Each incoming pulse rattles the cell until the charge steadies", Component: BatteryStaticIcon },
];

export default function BatteryChargingLabPage() {
  return <VariantGrid title="Battery Charging" variants={VARIANTS} cycleMs={2800} playMs={1500} />;
}
