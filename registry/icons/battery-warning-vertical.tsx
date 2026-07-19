"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RATTLE (vertical) — battery-warning's Rattle, re-anchored for the portrait
// glyph. A purely kinetic alarm: the whole cell buzzes (a rapid, decaying
// shudder about its centre) while the warning "!" whips harder about its own
// foot, counter-rotating the case for a mechanical "rattling" read.
//
// The glyph splits at its own subpath boundaries into NUB / CASE / STEM / DOT
// (union byte-identical). Nothing is added and nothing is filled — only the
// glyph's own ink moves.
//
// Rattle is rotation-only, so adapting it to the vertical glyph is purely a
// matter of re-anchoring: the "!" pivots about its foot at (128,184) here, and
// the cell buzzes about (128,128). Rotation only — the nub sits at the TOP
// (y=0), so any scaleY/-y would clip it; a small-angle rotation stays in bounds.
const NUB = "M96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const STEM = "M120,136V96a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Z";
const DOT = "M128,160a12,12,0,1,0,12,12A12,12,0,0,0,128,160Z";
// Full glyph, for the reduced-motion static render.
const BATTERY = NUB + CASE + STEM + DOT;

const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const EXCL_BASE = { transformBox: "view-box" as const, originX: 0.5, originY: 184 / 256 };

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

export const BatteryWarningVerticalIcon = forwardRef<IconHandle, IconProps>(
  function BatteryWarningVerticalIcon({ size = 28, style, ...props }, ref) {
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
