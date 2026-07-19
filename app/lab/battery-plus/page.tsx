"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Plus icon (Phosphor "battery-plus"), candidates.
 *
 * The glyph is a battery with a "+" inside — add battery / add power — so the
 * plus is the star. It splits at its own subpath boundaries into PLUS / CASE /
 * NUB (union byte-identical). The plus has 4-fold symmetry, so a 90° spin starts
 * and ends looking identical — the rotation only reads mid-transition, which
 * makes for a clean spin-in.
 *
 * Geometry (256 grid): plus center ≈ (120,128), spans x88..152 y100..156; case
 * x8..224; nub x240..256 (ENDS AT x=256 — whole-glyph moves use y + scaleY
 * only, never scaleX/+x, or the nub clips against the box).
 */
const PLUS =
  "M152,128a8,8,0,0,1-8,8H124v20a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h20V100a8,8,0,0,1,16,0v20h20A8,8,0,0,1,152,128Z";
const CASE =
  "M224,80v96a24,24,0,0,1-24,24H32A24,24,0,0,1,8,176V80A24,24,0,0,1,32,56H200A24,24,0,0,1,224,80Zm-16,0a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8Z";
const NUB = "M248,88a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,248,88Z";

const PLUS_C = AT(120, 128);
const GLYPH_C = AT(128, 128);

/* ── 1. ADD — the plus spins in and pops ─────────────────────────────────────
   The headline: the plus scales up from nothing with an overshoot while spinning
   a quarter turn into place (invisible at the ends thanks to the +'s symmetry,
   so it reads as a snap), and the cell gives a tiny confirming squash as it
   lands. "Added." */
const addPlus: Variants = {
  normal: { scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.2, 0.95, 1],
    rotate: [-90, 8, -2, 0],
    transition: { duration: 0.72, ease: OVERSHOOT, times: [0, 0.55, 0.8, 1] },
  },
};
const addCell: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Confirm squash as the plus lands (~0.55 of the timeline).
    scaleY: [1, 1, 0.97, 1.02, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.5, 0.64, 0.84, 1] },
  },
};

const BatteryAddIcon = forwardRef<IconHandle, IconProps>(
  function BatteryAddIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : addCell} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
          <motion.path d={PLUS} variants={reduced ? undefined : addPlus} style={PLUS_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. PULSE — the plus breathes ────────────────────────────────────────────
   Calmer: the plus swells and relaxes twice, a steady "power available" beat. */
const pulsePlus: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.18, 1, 1.18, 1],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
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
          <path d={NUB} />
          <motion.path d={PLUS} variants={reduced ? undefined : pulsePlus} style={PLUS_C} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. STAMP — the plus is stamped in ───────────────────────────────────────
   Punchy: the plus drops in oversized and squashes onto the cell, which recoils
   with a squash of its own — like a "+" being stamped down. */
const stampPlus: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1.5, 1.5, 0.86, 1.06, 1],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.2, 0.42, 0.7, 1] },
  },
};
const stampCell: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.93, 1.03, 1],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.36, 0.46, 0.68, 1] },
  },
};

const BatteryStampIcon = forwardRef<IconHandle, IconProps>(
  function BatteryStampIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : stampCell} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
          <motion.path d={PLUS} variants={reduced ? undefined : stampPlus} style={PLUS_C} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryAddIcon }[] = [
  { name: "Add", blurb: "The plus spins in and pops; the cell confirms with a squash", Component: BatteryAddIcon },
  { name: "Pulse", blurb: "The plus breathes twice — a steady 'power available' beat", Component: BatteryPulseIcon },
  { name: "Stamp", blurb: "The plus drops in oversized and stamps down onto the cell", Component: BatteryStampIcon },
];

export default function BatteryPlusLabPage() {
  return <VariantGrid title="Battery Plus" variants={VARIANTS} cycleMs={2800} playMs={1500} />;
}
