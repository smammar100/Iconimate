"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// STATIC — charging with cause and effect. Three energy dashes stream in from
// the left wall toward the bolt, and EACH ARRIVAL rattles the cell: a flicker
// dip on the bolt plus a micro-shiver of the whole battery, synced to the
// impacts (~0.36, 0.51, 0.67 of the timeline). After the third lands, the
// charge steadies bright.
//
// The Phosphor "battery-charging" glyph splits at its own subpath boundaries
// into three untouched actors:
//   CASE — the rounded battery outline + its interior hole.
//   NUB  — the right-side terminal.
//   BOLT — the lightning mark.
// CASE + NUB + BOLT recompose the original glyph exactly. The dashes are ADDED
// line-art ink (round-cap capsule strokes, no fills) at opacity 0 in the
// normal state, so the resting render stays pixel-identical.
//
// Bounds: the NUB ends at x=256 exactly, so the shiver is rotate + y ONLY —
// any positive x would clip it against the viewBox (the wrapper clips).
// The dashes travel x36..102, well inside the case.
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BOLT =
  "M138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z";
// Full original glyph, for the reduced-motion static render.
const BATTERY = CASE + NUB + BOLT;

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOLT_C = { transformBox: "view-box" as const, originX: 116 / 256, originY: 126 / 256 };

const DUR = 1.4;

// Energy dashes: from just inside the left wall (x36) to the bolt's edge.
const DASHES = [
  { y: 108, delay: 0.0 },
  { y: 128, delay: 0.22 },
  { y: 148, delay: 0.44 },
];
const dash = (delay: number): Variants => ({
  normal: { x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    x: [0, 52],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn", delay, times: [0, 0.15, 0.8, 1] },
  },
});
const shiver: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    // One micro-shake per arrival; the third rings longest, then settles.
    rotate: [0, 0, -1.2, 0.9, 0, -1.2, 0.9, 0, -1.5, 1, -0.4, 0],
    y: [0, 0, 1.6, -1.2, 0, 1.6, -1.2, 0, 2, -1.4, 0.5, 0],
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
    // A flicker dip + small swell per arrival; steady bright after the third.
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

export const BatteryChargingIcon = forwardRef<IconHandle, IconProps>(
  function BatteryChargingIcon({ size = 28, style, ...props }, ref) {
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
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
