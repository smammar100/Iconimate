"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Vertical Empty (Phosphor "battery-vertical-empty").
 *
 * The SAME "fault" motion as battery-empty, rotated for the portrait cell —
 * direction is the only thing that changes:
 *   shudder — rotate + X only, because the terminal NUB sits at the TOP edge
 *             (y=0); any negative y would clip it. (The horizontal cell used
 *             rotate + y because its nub was at the right edge, x=256.)
 *             Rotation trimmed so the top nub corner never crosses y=0 by more
 *             than a subpixel under the center pivot.
 *   bolt    — the VERTICAL lightning path, centered in the portrait interior.
 *   flicker — directionless, unchanged.
 *
 * Glyph: CASE (outline + hole) + NUB (top terminal); the bolt is ADDED ink at
 * opacity 0 in the normal state, so rest renders the empty glyph exactly.
 * Nothing is filled. Interior x72..184 y48..232 (center ≈ 128,140).
 */
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
// The vertical lightning mark (from the charging-vertical cell), centered.
const BOLT =
  "M150.81,131.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L131.06,144H112a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L124.94,128H144A8,8,0,0,1,150.81,131.79Z";

const GLYPH_C = AT(128, 128);
const BOLT_C = AT(128, 136);

const DUR = 1.3;

const shudder: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    // Decaying rattle synced to the bolt's flicker; rotate + x (nub at top).
    rotate: [0, -1.1, 0.83, -0.72, 0.5, -0.28, 0.11, 0],
    x: [0, 1.4, -1.1, 0.8, -0.5, 0.3, -0.1, 0],
    transition: { duration: DUR, ease: "easeOut", times: [0, 0.12, 0.24, 0.38, 0.52, 0.66, 0.8, 1] },
  },
};
const bolt: Variants = {
  normal: { opacity: 0, scale: 0.7, transition: { duration: 0 } },
  animate: {
    opacity: [0, 0.9, 0.3, 0.9, 0.2, 0.6, 0],
    scale: [0.7, 1.05, 0.95, 1.05, 0.9, 1, 0.85],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.18, 0.32, 0.48, 0.62, 0.78, 1] },
  },
};

const BatteryVerticalEmptyFaultIcon = forwardRef<IconHandle, IconProps>(
  function BatteryVerticalEmptyFaultIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : shudder} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={reduced ? undefined : bolt} style={BOLT_C} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryVerticalEmptyFaultIcon }[] = [
  { name: "Fault", blurb: "Same fault motion, rotated — cell rattles as a bolt flickers and dies", Component: BatteryVerticalEmptyFaultIcon },
];

export default function BatteryVerticalEmptyLabPage() {
  return <VariantGrid title="Battery Vertical Empty" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
