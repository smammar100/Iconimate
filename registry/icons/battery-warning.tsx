"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RATTLE — a purely kinetic alarm. The whole cell buzzes (a rapid, decaying
// shudder about its centre) while the warning "!" whips harder about its own
// foot, so the mark counter-rotates the case for a mechanical "rattling" read.
//
// The glyph splits at its own subpath boundaries into NUB / CASE / STEM / DOT
// (union byte-identical). Nothing is added and nothing is filled — only the
// glyph's own ink moves.
//
// Two pivots, two layers: an outer group buzzes the whole glyph about (128,128),
// an inner group shakes the "!" about its foot (116,168). Cell motion is
// rotation ONLY — the nub ends at x=256, so any scaleX/+x would clip it against
// the box; a small-angle rotation keeps it in bounds.
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const CASE =
  "M224,80v96a24,24,0,0,1-24,24H32A24,24,0,0,1,8,176V80A24,24,0,0,1,32,56H200A24,24,0,0,1,224,80Zm-16,0a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8Z";
const STEM = "M116,132a8,8,0,0,0,8-8V96a8,8,0,0,0-16,0v28A8,8,0,0,0,116,132Z";
const DOT = "M116,144a12,12,0,1,0,12,12A12,12,0,0,0,116,144Z";
// Full glyph, for the reduced-motion static render.
const BATTERY = NUB + CASE + STEM + DOT;

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const EXCL_BASE = { transformBox: "view-box" as const, originX: 116 / 256, originY: 168 / 256 };

// Whole-cell buzz — rapid, decaying, about the centre.
const buzz: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4, 4, -3.5, 3.5, -2, 2, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1] },
  },
};
// The "!" whips harder about its foot, against the buzz.
const excl: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 9, -7, 7, -4, 4, 0],
    transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.14, 0.29, 0.43, 0.57, 0.71, 0.86, 1] },
  },
};

export const BatteryWarningIcon = forwardRef<IconHandle, IconProps>(
  function BatteryWarningIcon({ size = 28, style, ...props }, ref) {
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
          <motion.g variants={buzz} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
            <motion.g variants={excl} style={EXCL_BASE}>
              <path d={STEM} />
              <path d={DOT} />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
