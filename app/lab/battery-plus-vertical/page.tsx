"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Plus Vertical icon (Phosphor "battery-plus-vertical"), candidate.
 *
 * The portrait sibling of battery-plus. Same headline: the plus is the star. The
 * glyph splits at its own subpath boundaries into NUB / CASE / PLUS (union
 * byte-identical). The plus has 4-fold symmetry, so a 90° spin starts and ends
 * looking identical — the rotation only reads mid-transition, a clean spin-in.
 *
 * Geometry (256 grid): plus center ≈ (128,140), spans x100..156 y112..168; case
 * x56..200 y32..248; nub y0..16 at the TOP (ENDS AT y=0 — whole-glyph moves and
 * the cell squash use x + scaleX only, never scaleY/-y, or the nub clips at y=0).
 * This is the only change from the horizontal cell (there the nub was at x=256,
 * so its confirm squash was scaleY; here it is scaleX).
 */
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const PLUS =
  "M156,132H136V112a8,8,0,0,0-16,0v20H100a8,8,0,0,0,0,16h20v20a8,8,0,0,0,16,0V148h20a8,8,0,0,0,0-16Z";

const PLUS_C = AT(128, 140);
const GLYPH_C = AT(128, 128);

/* ── ADD — the plus spins in and pops ────────────────────────────────────────
   The plus scales up from nothing with an overshoot while spinning a quarter
   turn into place (invisible at the ends thanks to the +'s symmetry, so it reads
   as a snap), and the cell gives a tiny confirming squash — scaleX here, so the
   top nub stays put — as it lands. "Added." */
const addPlus: Variants = {
  normal: { scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.2, 0.95, 1],
    rotate: [-90, 8, -2, 0],
    transition: { duration: 0.72, ease: OVERSHOOT, times: [0, 0.55, 0.8, 1] },
  },
};
const addCell: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Confirm squash as the plus lands (~0.55 of the timeline). scaleX, not
    // scaleY — the nub is at the top, so a vertical squash would clip it.
    scaleX: [1, 1, 0.97, 1.02, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.5, 0.64, 0.84, 1] },
  },
};

const BatteryAddVerticalIcon = forwardRef<IconHandle, IconProps>(
  function BatteryAddVerticalIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : addCell} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
          </motion.g>
          <motion.path d={PLUS} variants={reduced ? undefined : addPlus} style={PLUS_C} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryAddVerticalIcon }[] = [
  { name: "Add", blurb: "The plus spins in and pops; the cell confirms with a scaleX squash", Component: BatteryAddVerticalIcon },
];

export default function BatteryPlusVerticalLabPage() {
  return <VariantGrid title="Battery Plus Vertical" variants={VARIANTS} cycleMs={2800} playMs={1500} />;
}
