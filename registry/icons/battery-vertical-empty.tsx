"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FAULT — the battery-empty "fault" motion, rotated for the portrait cell. The
// battery shudders while a charge bolt flickers into the empty interior trying
// to hold — and dies out anyway. The bolt rides inside the shudder group so it
// rattles with the cell, its flicker layered on top; the two share one clock so
// each bolt stutter lands on a shake kick.
//
// The Phosphor "battery-vertical-empty" glyph is the case outline + its hole
// plus the top terminal; the bolt is ADDED line-art ink (the vertical charging
// cell's lightning mark) at opacity 0 in the normal state, so the resting
// render is pixel-identical to the empty glyph. Nothing is filled.
//
// Direction is the only thing that differs from the horizontal empty cell: the
// shudder is rotate + X only, because the NUB sits at the TOP edge (y=0) — any
// negative y would clip it (mirror of the horizontal cell, whose nub was at the
// right edge x=256, so it shuddered rotate + y). Rotation is trimmed so the top
// nub corner never crosses y=0 by more than a subpixel under the center pivot.
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
// Empty at rest — the reduced-motion render is CASE + NUB, no bolt.
const EMPTY = CASE + NUB;
// The vertical lightning mark (from the charging-vertical cell), centered.
const BOLT =
  "M150.81,131.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L131.06,144H112a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L124.94,128H144A8,8,0,0,1,150.81,131.79Z";

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOLT_C = { transformBox: "view-box" as const, originX: 0.5, originY: 136 / 256 };

const DUR = 1.3;

const shudder: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
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

export const BatteryVerticalEmptyIcon = forwardRef<IconHandle, IconProps>(
  function BatteryVerticalEmptyIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={EMPTY} />
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
          <motion.g variants={shudder} style={GLYPH_C}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BOLT} variants={bolt} style={BOLT_C} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
