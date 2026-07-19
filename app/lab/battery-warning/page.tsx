"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Warning icon (Phosphor "battery-warning"), candidates.
 *
 * A battery with a warning "!" inside — low/fault alert — so the exclamation is
 * the star. The glyph splits at its own subpath boundaries into NUB / CASE /
 * STEM / DOT (union byte-identical). Nothing is added and nothing is filled —
 * only the glyph's own ink moves.
 *
 * Geometry (256 grid): case x8..224; NUB x240..256 (ENDS AT x=256 — whole-glyph
 * moves use rotate/scaleY only, never scaleX/+x, or the nub clips against the
 * box). Exclamation: stem x108..124 y96..124; dot center (116,156) r12; the "!"
 * as a whole spans y96..168, pivoting cleanly about its base (116,168).
 */
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const CASE =
  "M224,80v96a24,24,0,0,1-24,24H32A24,24,0,0,1,8,176V80A24,24,0,0,1,32,56H200A24,24,0,0,1,224,80Zm-16,0a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8Z";
const STEM = "M116,132a8,8,0,0,0,8-8V96a8,8,0,0,0-16,0v28A8,8,0,0,0,116,132Z";
const DOT = "M116,144a12,12,0,1,0,12,12A12,12,0,0,0,116,144Z";

const EXCL_BASE = AT(116, 168); // pivot at the foot of the "!" — for the shake
const EXCL_C = AT(116, 130); // centre of the "!" — for flash / scale
const STEM_TOP = AT(116, 96); // top of the stem — grows down from here
const DOT_C = AT(116, 156); // dot centre
const GLYPH_C = AT(128, 128); // whole-glyph centre — for the buzz

/* ── 1. SHAKE — the "!" wags an alarm ─────────────────────────────────────────
   The headline read for a warning: the exclamation rocks side to side about its
   foot, fast and decaying, like a head shaking "no". Cell stays put. */
const shakeExcl: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 9, -7, 7, -4, 4, 0],
    transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.14, 0.29, 0.43, 0.57, 0.71, 0.86, 1] },
  },
};

const BatteryShakeIcon = forwardRef<IconHandle, IconProps>(
  function BatteryShakeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={NUB} />
          <path d={CASE} />
          <motion.g variants={reduced ? undefined : shakeExcl} style={EXCL_BASE}>
            <path d={STEM} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. FLASH — the "!" blinks like a warning light ───────────────────────────
   The exclamation pulses bright/dim with a small swell, the classic hazard
   beacon. Two sharp beats, settling lit. */
const flashExcl: Variants = {
  normal: { opacity: 1, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.15, 1, 0.15, 1],
    scale: [1, 1.14, 1, 1.14, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.22, 0.5, 0.72, 1] },
  },
};

const BatteryFlashIcon = forwardRef<IconHandle, IconProps>(
  function BatteryFlashIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={NUB} />
          <path d={CASE} />
          <motion.g variants={reduced ? undefined : flashExcl} style={EXCL_C}>
            <path d={STEM} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. POP — the "!" is stamped in, stem then dot ────────────────────────────
   The warning materialises: the stem grows down from the top with an overshoot,
   then the dot pops in beneath it a beat later. "Alert raised." */
const popStem: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.15, 1, 1],
    transition: { duration: 0.8, ease: OVERSHOOT, times: [0, 0.4, 0.55, 1] },
  },
};
const popDot: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // Holds hidden until the stem has landed (~0.45), then pops.
    scale: [0, 0, 1.35, 1],
    transition: { duration: 0.8, ease: OVERSHOOT, times: [0, 0.45, 0.75, 1] },
  },
};

const BatteryPopIcon = forwardRef<IconHandle, IconProps>(
  function BatteryPopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={NUB} />
          <path d={CASE} />
          <motion.path d={STEM} variants={reduced ? undefined : popStem} style={STEM_TOP} />
          <motion.path d={DOT} variants={reduced ? undefined : popDot} style={DOT_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. BOUNCE — the dot hops against the stem ────────────────────────────────
   Playful but still reads as "attention": the dot springs up toward the stem and
   drops back, twice, with a soft squash on landing. The stem gives a tiny recoil. */
const bounceDot: Variants = {
  normal: { y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -16, 0, -9, 0],
    scale: [1, 1, 0.86, 1, 1],
    transition: { duration: 1.0, ease: "easeOut", times: [0, 0.3, 0.5, 0.75, 1] },
  },
};
const bounceStem: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Small recoil each time the dot lands.
    scaleY: [1, 1, 0.94, 1, 0.97, 1],
    transition: { duration: 1.0, ease: "easeOut", times: [0, 0.28, 0.52, 0.7, 0.85, 1] },
  },
};

const BatteryBounceIcon = forwardRef<IconHandle, IconProps>(
  function BatteryBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={NUB} />
          <path d={CASE} />
          <motion.path d={STEM} variants={reduced ? undefined : bounceStem} style={STEM_TOP} />
          <motion.path d={DOT} variants={reduced ? undefined : bounceDot} style={DOT_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. BUZZ — the whole cell vibrates in alarm ───────────────────────────────
   The most urgent read: the entire battery buzzes — a rapid, decaying rotation
   about its centre — as if the alert is going off. Small angles keep the nub in
   bounds; rotation only, never scaleX/+x. */
const buzzGlyph: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4, 4, -3.5, 3.5, -2, 2, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1] },
  },
};

const BatteryBuzzIcon = forwardRef<IconHandle, IconProps>(
  function BatteryBuzzIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : buzzGlyph} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
            <path d={STEM} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. ALARM (Shake + Flash) — v1 × v2 ───────────────────────────────────────
   The two attention reads stacked: the "!" rocks about its foot (v1's shake)
   while it blinks bright/dim with a swell (v2's flash). Nested groups keep each
   its own pivot — outer rotates about the foot (116,168), inner scales/fades
   about the centre (116,130) — so neither distorts the other. One coordinated
   ~1.1s burst: the flash beats twice as the shake decays, settling lit and still. */
const alarmShake: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 9, -7, 7, -4, 4, 0],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.12, 0.26, 0.4, 0.54, 0.68, 0.84, 1] },
  },
};
const alarmFlash: Variants = {
  normal: { opacity: 1, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0.15, 1, 0.15, 1],
    scale: [1, 1.14, 1, 1.14, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.22, 0.5, 0.72, 1] },
  },
};

const BatteryAlarmIcon = forwardRef<IconHandle, IconProps>(
  function BatteryAlarmIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={NUB} />
          <path d={CASE} />
          <motion.g variants={reduced ? undefined : alarmShake} style={EXCL_BASE}>
            <motion.g variants={reduced ? undefined : alarmFlash} style={EXCL_C}>
              <path d={STEM} />
              <path d={DOT} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. FULL ALARM (Buzz + Shake + Flash) — v6 × v5 ───────────────────────────
   Everything at once, layered by scope. The whole cell buzzes (v5) — a rapid
   decaying shudder about its centre — while inside it the "!" rocks about its
   foot AND flashes bright/dim (v6). Three nested groups, three pivots: buzz about
   (128,128), shake about (116,168), flash about (116,130), so the transforms
   compose cleanly without fighting. Durations differ on purpose — the buzz snaps
   through in 0.7s up front, the "!" keeps shaking/flashing to 1.1s, so the alert
   escalates then rings out. Rotation only on the cell — the x=256 nub stays in
   bounds. */
const BatteryFullAlarmIcon = forwardRef<IconHandle, IconProps>(
  function BatteryFullAlarmIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : buzzGlyph} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
            <motion.g variants={reduced ? undefined : alarmShake} style={EXCL_BASE}>
              <motion.g variants={reduced ? undefined : alarmFlash} style={EXCL_C}>
                <path d={STEM} />
                <path d={DOT} />
              </motion.g>
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 8. RATTLE (Buzz + Shake) — v1 × v5 ───────────────────────────────────────
   The two rotations, no flash — a purely kinetic alarm. The whole cell buzzes
   (v5) while the "!" rocks harder about its own foot (v1), so the mark whips
   against the shudder of the case. Two pivots: buzz about (128,128), shake about
   (116,168). Cell motion is rotation-only, so the x=256 nub stays in bounds. */
const BatteryRattleIcon = forwardRef<IconHandle, IconProps>(
  function BatteryRattleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : buzzGlyph} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
            <motion.g variants={reduced ? undefined : shakeExcl} style={EXCL_BASE}>
              <path d={STEM} />
              <path d={DOT} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryShakeIcon }[] = [
  { name: "Shake", blurb: "The '!' rocks side to side about its foot — a head shaking 'no'", Component: BatteryShakeIcon },
  { name: "Flash", blurb: "The '!' blinks bright/dim with a swell, a hazard beacon", Component: BatteryFlashIcon },
  { name: "Pop", blurb: "The stem stamps in from the top, then the dot pops beneath", Component: BatteryPopIcon },
  { name: "Bounce", blurb: "The dot springs up toward the stem and drops back, twice", Component: BatteryBounceIcon },
  { name: "Buzz", blurb: "The whole cell vibrates in alarm — a rapid, decaying shudder", Component: BatteryBuzzIcon },
  { name: "Alarm", blurb: "v1 × v2 — the '!' shakes about its foot while it flashes bright/dim", Component: BatteryAlarmIcon },
  { name: "Full Alarm", blurb: "v6 × v5 — the cell buzzes while the '!' shakes and flashes", Component: BatteryFullAlarmIcon },
  { name: "Rattle", blurb: "v1 × v5 — the cell buzzes while the '!' whips about its foot", Component: BatteryRattleIcon },
];

export default function BatteryWarningLabPage() {
  return <VariantGrid title="Battery Warning" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
