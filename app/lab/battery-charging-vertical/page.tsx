"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Charging Vertical (Phosphor "battery-charging-vertical").
 *
 * The SAME "static" motion as battery-charging, rotated 90° to match the
 * portrait cell — direction is the only thing that changes:
 *   dashes — stream BOTTOM → UP toward the bolt (charge flowing to the top
 *            terminal), where the horizontal cell streamed left → right.
 *   shiver — rotate + X only, because the terminal NUB sits at the TOP edge
 *            (y=0); any negative y would clip it. (Horizontal used rotate + Y
 *            because its nub was at the right edge, x=256.)
 *   flicker — directionless, unchanged.
 *
 * Glyph splits at its own subpath boundaries into CASE / NUB / BOLT (union
 * byte-identical). Dashes are added line-art strokes (no fills) at opacity 0 in
 * the normal state. Bolt bbox ≈ x105..151, y100..172, center ≈ (128,136).
 */
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const NUB = "M96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Z";
const BOLT =
  "M150.81,131.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L131.06,144H112a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L124.94,128H144A8,8,0,0,1,150.81,131.79Z";

const GLYPH_C = AT(128, 128);
const BOLT_C = AT(128, 136);

const DUR = 1.4;

// Energy dashes: vertical capsules rising from the base toward the bolt.
const DASHES = [
  { x: 110, delay: 0.0 },
  { x: 128, delay: 0.22 },
  { x: 146, delay: 0.44 },
];
const dash = (delay: number): Variants => ({
  normal: { y: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    // From near the base (y204) up to the bolt's foot (~y158): −46.
    y: [0, -46],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn", delay, times: [0, 0.15, 0.8, 1] },
  },
});
const shiver: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    // One micro-shake per arrival; the third rings longest, then settles.
    // Rotation trimmed vs. the horizontal cell so the top nub corner never
    // crosses y=0 by more than a subpixel under the pivot at center.
    rotate: [0, 0, -1, 0.7, 0, -1, 0.7, 0, -1.2, 0.8, -0.3, 0],
    x: [0, 0, 1.6, -1.2, 0, 1.6, -1.2, 0, 2, -1.4, 0.5, 0],
    transition: {
      duration: DUR,
      ease: "easeInOut",
      times: [0, 0.34, 0.38, 0.44, 0.5, 0.53, 0.59, 0.65, 0.69, 0.77, 0.87, 1],
    },
  },
};
const bolt: Variants = {
  normal: { opacity: 1, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 1, 0.4, 1, 0.45, 1, 0.35, 1, 1],
    scale: [1, 1, 1.05, 1, 1.06, 1, 1.1, 1.02, 1],
    transition: {
      duration: DUR,
      opacity: { ease: "linear", times: [0, 0.34, 0.39, 0.49, 0.54, 0.64, 0.69, 0.8, 1] },
      scale: { ease: "easeOut", times: [0, 0.34, 0.4, 0.5, 0.55, 0.65, 0.71, 0.85, 1] },
    },
  },
};

const BatteryVerticalStaticIcon = forwardRef<IconHandle, IconProps>(
  function BatteryVerticalStaticIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : shiver} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={reduced ? undefined : bolt} style={BOLT_C} />
            {!reduced &&
              DASHES.map((d, i) => (
                // Wrapper <g> for placement; Motion overrides transform attrs.
                <g key={i} transform={`translate(${d.x} 204)`}>
                  <motion.path
                    d="M0,-14 l0,14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeLinecap="round"
                    variants={dash(d.delay)}
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

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryVerticalStaticIcon }[] = [
  { name: "Static", blurb: "Same static motion, rotated 90° — pulses rise, cell rattles, steadies", Component: BatteryVerticalStaticIcon },
];

export default function BatteryChargingVerticalLabPage() {
  return <VariantGrid title="Battery Charging Vertical" variants={VARIANTS} cycleMs={2800} playMs={1500} />;
}
