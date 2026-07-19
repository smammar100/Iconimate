"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FAULT — a faulty charge on a dead cell. The battery shudders while a charge
// bolt flickers into the empty interior trying to hold — and dies out anyway.
// The bolt rides inside the shudder group so it rattles with the cell, its own
// flicker layered on top; the two run on one clock so each bolt stutter lands
// on a shake kick.
//
// The Phosphor "battery-empty" glyph is the case outline + its interior hole
// plus the right terminal; the bolt is ADDED line-art ink (the charging cell's
// own lightning mark) at opacity 0 in the normal state, so the resting render
// is pixel-identical to the empty glyph. Nothing is filled.
//
// Bounds: the terminal nub ends at x=256 exactly, so the shudder is rotate + y
// ONLY — any positive x would clip it against the viewBox (the wrapper clips).
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
// Empty at rest — the reduced-motion render is CASE + NUB, no bolt.
const EMPTY = CASE + NUB;
// The lightning mark (same as the charging cell), centered in the interior.
const BOLT =
  "M138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z";

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOLT_C = { transformBox: "view-box" as const, originX: 116 / 256, originY: 126 / 256 };

const DUR = 1.3;

const shudder: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2, 1.5, -1.3, 0.9, -0.5, 0.2, 0],
    y: [0, 1.4, -1.1, 0.8, -0.5, 0.3, -0.1, 0],
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

export const BatteryEmptyIcon = forwardRef<IconHandle, IconProps>(
  function BatteryEmptyIcon({ size = 28, style, ...props }, ref) {
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
