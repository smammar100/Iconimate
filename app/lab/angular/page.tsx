"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Angular logo, 5 animation candidates.
 *
 * The Phosphor "angular-logo" glyph splits cleanly into the SHIELD (the badge ring)
 * and the LETTER_A mark inside it. Everything pivots about the badge centre.
 */
const SHIELD =
  "M227.08,64.62l-96-40a7.93,7.93,0,0,0-6.16,0l-96,40a8,8,0,0,0-4.85,8.44l16,120a8,8,0,0,0,4.35,6.1l80,40a8,8,0,0,0,7.16,0l80-40a8,8,0,0,0,4.35-6.1l16-120A8,8,0,0,0,227.08,64.62ZM200.63,186.74,128,223.06,55.37,186.74,40.74,77,128,40.67,215.26,77Z";
const LETTER_A =
  "M121,84.12l-40,72a8,8,0,1,0,14,7.76L106,144H150l11,19.88a8,8,0,1,0,14-7.76l-40-72a8,8,0,0,0-14,0ZM141.07,128H114.93L128,104.47Z";

/** Badge centre as a view-box fraction — the pivot for every transform. */
const CENTER = { x: 0.5, y: 0.5 };
const ORIGIN = { transformBox: "view-box" as const, originX: CENTER.x, originY: CENTER.y };
/** Same, with perspective for the 3-D rotations (flip / tilt). */
const ORIGIN_3D = { ...ORIGIN, transformPerspective: 620 };

/* ── 1. STAMP ────────────────────────────────────────────────────────────────
   The badge squashes and pops about its centre — a confident stamp / tap. */
const stamp: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.88, 1.06, 1],
    transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

const AngularStampIcon = forwardRef<IconHandle, IconProps>(
  function AngularStampIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : stamp} style={ORIGIN}>
            <path d={SHIELD} />
            <path d={LETTER_A} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. FLIP ─────────────────────────────────────────────────────────────────
   The badge flips a full turn on its Y axis, like a spinning coin. */
const flip: Variants = {
  normal: { rotateY: 0, transition: RETURN_TRANSITION },
  animate: { rotateY: [0, 360], transition: { duration: 0.85, ease: SWEEP } },
};

const AngularFlipIcon = forwardRef<IconHandle, IconProps>(
  function AngularFlipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : flip} style={ORIGIN_3D}>
            <path d={SHIELD} />
            <path d={LETTER_A} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. LETTER ───────────────────────────────────────────────────────────────
   The shield holds while the "A" springs up out of the badge centre. */
const letter: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.4, 1.12, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: OVERSHOOT },
  },
};

const AngularLetterIcon = forwardRef<IconHandle, IconProps>(
  function AngularLetterIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={SHIELD} />
          <motion.path d={LETTER_A} variants={reduced ? undefined : letter} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. PULSE ────────────────────────────────────────────────────────────────
   A slow, even breathing scale — a "live / online" badge (loops). */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.08, 1],
    transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity },
  },
};

const AngularPulseIcon = forwardRef<IconHandle, IconProps>(
  function AngularPulseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pulse} style={ORIGIN}>
            <path d={SHIELD} />
            <path d={LETTER_A} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. TILT ─────────────────────────────────────────────────────────────────
   A playful 3-D parallax tilt that wheels around and settles flat. */
const tilt: Variants = {
  normal: { rotateX: 0, rotateY: 0, transition: RETURN_TRANSITION },
  animate: {
    rotateX: [0, -14, 10, 0],
    rotateY: [0, 16, -10, 0],
    transition: { duration: 1.1, ease: "easeInOut" },
  },
};

const AngularTiltIcon = forwardRef<IconHandle, IconProps>(
  function AngularTiltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : tilt} style={ORIGIN_3D}>
            <path d={SHIELD} />
            <path d={LETTER_A} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AngularStampIcon }[] = [
  { name: "Stamp", blurb: "Squash-and-pop tap response", Component: AngularStampIcon },
  { name: "Flip", blurb: "Full coin-flip on the Y axis", Component: AngularFlipIcon },
  { name: "Letter", blurb: "The A springs out of the shield", Component: AngularLetterIcon },
  { name: "Pulse", blurb: "Slow breathing scale (loops)", Component: AngularPulseIcon },
  { name: "Tilt", blurb: "3-D parallax tilt & settle", Component: AngularTiltIcon },
];

export default function AngularLabPage() {
  return <VariantGrid title="Angular" variants={VARIANTS} cycleMs={2600} playMs={1400} />;
}
