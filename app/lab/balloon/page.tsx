"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Balloon icon, 5 animation candidates.
 *
 * The Phosphor "balloon" glyph is a hot-air-balloon envelope with a tied
 * nozzle below and a gloss arc inside the upper right. Split for motion:
 *   BASE  — envelope + nozzle, the glyph's own subpaths untouched.
 *   SHINE — the gloss arc, the glyph's own subpath untouched, so it can
 *           twinkle independently.
 * BASE + SHINE is byte-identical to the original path.
 */
const BASE =
  "M128,16a88.1,88.1,0,0,0-88,88c0,23.43,9.4,49.42,25.13,69.5,12.08,15.41,26.5,26,41.91,31.09L96.65,228.85A8,8,0,0,0,104,240h48a8,8,0,0,0,7.35-11.15L149,204.59c15.4-5.07,29.83-15.68,41.91-31.09C206.6,153.42,216,127.43,216,104A88.1,88.1,0,0,0,128,16Zm11.87,208H116.13l6.94-16.19c1.64.12,3.28.19,4.93.19s3.29-.07,4.93-.19Zm38.4-60.37C163.94,181.93,146.09,192,128,192s-35.94-10.07-50.27-28.37C64.12,146.27,56,124,56,104a72,72,0,0,1,144,0C200,124,191.88,146.27,178.27,163.63Z";
const SHINE =
  "M177.32,103.89A8.52,8.52,0,0,1,176,104a8,8,0,0,1-7.88-6.68,41.29,41.29,0,0,0-33.43-33.43,8,8,0,1,1,2.64-15.78,57.5,57.5,0,0,1,46.57,46.57A8,8,0,0,1,177.32,103.89Z";

const TETHER = AT(128, 240); // bottom of the nozzle — where a string would tie
const HEART = AT(128, 104); // center of the envelope
const GLOSS = AT(158, 74); // center of the shine arc

/* ── 1. FLOAT ────────────────────────────────────────────────────────────────
   Buoyant idle: the balloon bobs gently on the air, drifting up and settling
   with the faintest tilt — never quite still. */
const float: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, -3, -7, 0],
    rotate: [0, -2, 1.5, -1, 0],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.28, 0.52, 0.76, 1] },
  },
};

const BalloonFloatIcon = forwardRef<IconHandle, IconProps>(
  function BalloonFloatIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : float} style={HEART}>
            <path d={BASE} />
            <path d={SHINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. DRIFT ────────────────────────────────────────────────────────────────
   Tethered in a breeze: the balloon leans side to side about the nozzle, a
   decaying pendulum from the tie point. */
const drift: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 5.5, -3.5, 1.5, 0],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.2, 0.45, 0.68, 0.86, 1] },
  },
};

const BalloonDriftIcon = forwardRef<IconHandle, IconProps>(
  function BalloonDriftIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : drift} style={TETHER}>
            <path d={BASE} />
            <path d={SHINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. BREATHE ──────────────────────────────────────────────────────────────
   Fresh air in the envelope: the balloon swells and relaxes about its center
   — a soft inflate pulse. */
const breathe: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.07, 0.98, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.35, 0.62, 0.82, 1] },
  },
};

const BalloonBreatheIcon = forwardRef<IconHandle, IconProps>(
  function BalloonBreatheIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : breathe} style={HEART}>
            <path d={BASE} />
            <path d={SHINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 4. GLEAM ────────────────────────────────────────────────────────────────
   Sunlight catches the envelope: the gloss arc twinkles — shrinks away, then
   blooms back — while the balloon holds a proud stillness. */
const gleam: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0, 1.25, 1],
    opacity: [1, 0, 1, 1],
    transition: { duration: 0.85, ease: ARRIVE, times: [0, 0.3, 0.7, 1] },
  },
};
const gleamBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.5, 1] },
  },
};

const BalloonGleamIcon = forwardRef<IconHandle, IconProps>(
  function BalloonGleamIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : gleamBody} style={HEART}>
            <path d={BASE} />
            <motion.path d={SHINE} variants={reduced ? undefined : gleam} style={GLOSS} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. ASCEND ───────────────────────────────────────────────────────────────
   Liftoff: the balloon rises with a slight lean into the climb, hangs at
   altitude for a beat, then eases back down to its mooring. */
const ascend: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -16, -14, 0],
    rotate: [0, 2.5, 1.5, 0],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.35, 0.6, 1] },
  },
};

const BalloonAscendIcon = forwardRef<IconHandle, IconProps>(
  function BalloonAscendIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : ascend} style={HEART}>
            <path d={BASE} />
            <path d={SHINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. ASCEND + FLOAT ───────────────────────────────────────────────────────
   The full flight: liftoff with a lean into the climb, then a buoyant bob at
   altitude — riding the air rather than hanging still — before easing back
   down to the mooring. */
const AF_DUR = 1.9;
const ascendFloat: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // climb → bob (down/up/down at altitude) → descend
    y: [0, -16, -11, -15, -11, 0],
    rotate: [0, 2.5, -1.5, 1.5, -1, 0],
    transition: {
      duration: AF_DUR,
      ease: "easeInOut",
      times: [0, 0.22, 0.42, 0.6, 0.78, 1],
    },
  },
};

const BalloonAscendFloatIcon = forwardRef<IconHandle, IconProps>(
  function BalloonAscendFloatIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : ascendFloat} style={HEART}>
            <path d={BASE} />
            <path d={SHINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BalloonFloatIcon }[] = [
  { name: "Float", blurb: "Buoyant idle bob — never quite still", Component: BalloonFloatIcon },
  { name: "Drift", blurb: "Leans in the breeze about the nozzle", Component: BalloonDriftIcon },
  { name: "Breathe", blurb: "Soft inflate pulse from the center", Component: BalloonBreatheIcon },
  { name: "Gleam", blurb: "The gloss arc twinkles away and blooms back", Component: BalloonGleamIcon },
  { name: "Ascend", blurb: "Lifts off, hangs at altitude, eases back down", Component: BalloonAscendIcon },
  { name: "Ascend + Float", blurb: "Lifts off, bobs on the air at altitude, descends", Component: BalloonAscendFloatIcon },
];

export default function BalloonLabPage() {
  return <VariantGrid title="Balloon" variants={VARIANTS} cycleMs={2600} playMs={1400} />;
}
