"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Warning Vertical icon (Phosphor "battery-warning-vertical").
 *
 * The portrait sibling of battery-warning, carrying its v8 "Rattle": the whole
 * cell buzzes while the "!" whips harder about its own foot. Rattle is
 * rotation-only, so adapting it to the vertical glyph is purely a matter of
 * re-anchoring the pivots — no scale/translate to flip. The glyph splits at its
 * own subpath boundaries into NUB / CASE / STEM / DOT (union byte-identical);
 * nothing is added and nothing is filled.
 *
 * Geometry (256 grid): case x56..200; NUB y0..16 at the TOP; the "!" sits on the
 * centre line — stem x120..136 y96..144, dot centre (128,172) r12 — so it pivots
 * about its foot (128,184). Cell motion is rotation ONLY, so the top nub stays in
 * bounds (a scaleY/-y would clip it against y=0).
 */
const NUB = "M96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const STEM = "M120,136V96a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Z";
const DOT = "M128,160a12,12,0,1,0,12,12A12,12,0,0,0,128,160Z";

const GLYPH_C = AT(128, 128); // whole-glyph centre — for the buzz
const EXCL_BASE = AT(128, 184); // foot of the "!" — for the shake

/* ── RATTLE (Buzz + Shake) — battery-warning's v8, vertical ────────────────────
   The whole cell buzzes (rapid, decaying, about its centre) while the "!" whips
   harder about its foot, counter-rotating the case for a mechanical rattle. */
const buzz: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4, 4, -3.5, 3.5, -2, 2, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1] },
  },
};
const excl: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 9, -7, 7, -4, 4, 0],
    transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.14, 0.29, 0.43, 0.57, 0.71, 0.86, 1] },
  },
};

const BatteryRattleVerticalIcon = forwardRef<IconHandle, IconProps>(
  function BatteryRattleVerticalIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : buzz} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
            <motion.g variants={reduced ? undefined : excl} style={EXCL_BASE}>
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

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryRattleVerticalIcon }[] = [
  { name: "Rattle", blurb: "v8 — the cell buzzes while the '!' whips about its foot (vertical)", Component: BatteryRattleVerticalIcon },
];

export default function BatteryWarningVerticalLabPage() {
  return <VariantGrid title="Battery Warning Vertical" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
