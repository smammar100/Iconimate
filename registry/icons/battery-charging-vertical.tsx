"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// STATIC — the battery-charging "static" motion, rotated 90° for the portrait
// cell. Three energy dashes rise from the base toward the bolt (charge flowing
// to the top terminal), and each arrival rattles the cell: a flicker dip on the
// bolt plus a micro-shiver of the whole battery, synced to the impacts. After
// the third lands, the charge steadies bright.
//
// The Phosphor "battery-charging-vertical" glyph splits at its own subpath
// boundaries into three untouched actors:
//   CASE — the rounded battery outline + its interior hole.
//   NUB  — the top terminal.
//   BOLT — the lightning mark.
// CASE + NUB + BOLT recompose the original glyph exactly. The dashes are ADDED
// line-art ink (round-cap capsule strokes, no fills) at opacity 0 in the normal
// state, so the resting render stays pixel-identical.
//
// Direction is the only thing that differs from the horizontal cell: dashes
// rise (−y) instead of streaming right (+x), and the shiver is rotate + X only,
// because the NUB sits at the TOP edge (y=0) — any negative y would clip it
// (mirror of the horizontal cell, whose nub was at the right edge x=256, so it
// shivered rotate + y). Rotation is trimmed to ±1.2° so the top nub corner
// never crosses y=0 by more than a subpixel under the center pivot.
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const NUB = "M96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Z";
const BOLT =
  "M150.81,131.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L131.06,144H112a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L124.94,128H144A8,8,0,0,1,150.81,131.79Z";
// Full original glyph, for the reduced-motion static render.
const BATTERY = CASE + NUB + BOLT;

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOLT_C = { transformBox: "view-box" as const, originX: 0.5, originY: 136 / 256 };

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
    y: [0, -46],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn", delay, times: [0, 0.15, 0.8, 1] },
  },
});
const shiver: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
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
    // Per-property transitions: one shared keyframe timeline would stall each
    // channel at the other's boundaries.
    opacity: [1, 1, 0.4, 1, 0.45, 1, 0.35, 1, 1],
    scale: [1, 1, 1.05, 1, 1.06, 1, 1.1, 1.02, 1],
    transition: {
      duration: DUR,
      opacity: { ease: "linear", times: [0, 0.34, 0.39, 0.49, 0.54, 0.64, 0.69, 0.8, 1] },
      scale: { ease: "easeOut", times: [0, 0.34, 0.4, 0.5, 0.55, 0.65, 0.71, 0.85, 1] },
    },
  },
};

export const BatteryChargingVerticalIcon = forwardRef<IconHandle, IconProps>(
  function BatteryChargingVerticalIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BATTERY} />
          </svg>
        </div>
      );
    }

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          initial="normal"
          animate={controls}
          style={{ overflow: "visible" }}
        >
          <motion.g variants={shiver} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={bolt} style={BOLT_C} />
            {/* Dashes ride inside the shiver group so impacts shake them too.
                The wrapper <g> carries placement — Motion writes
                style.transform, which overrides a transform attribute on the
                same element. */}
            {DASHES.map((d, i) => (
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
        </motion.svg>
      </div>
    );
  },
);
