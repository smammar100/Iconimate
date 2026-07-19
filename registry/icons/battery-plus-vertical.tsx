"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ADD (vertical) — battery-plus's Add motion, rotated for the portrait glyph.
// The plus is the star: it scales up from nothing with an overshoot while
// spinning a quarter turn into place (invisible at the ends thanks to the +'s
// 4-fold symmetry, so it reads as a crisp snap rather than a full turn), and the
// cell answers with a tiny confirming squash as it lands. "Added."
//
// The glyph splits at its own subpath boundaries into NUB / CASE / PLUS (union
// byte-identical). Nothing is added and nothing is filled — only the glyph's own
// ink moves.
//
// Direction is the only change from the horizontal cell. There the nub ends at
// x=256, so the confirm squash was scaleY; HERE the nub sits at the TOP (y=0),
// so the squash is scaleX ONLY (never scaleY/-y, or the nub clips against y=0).
// The plus scales about its own center (128,140), well inside the interior, and
// its spin is rotation-symmetric, so it is identical to the horizontal version.
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const PLUS =
  "M156,132H136V112a8,8,0,0,0-16,0v20H100a8,8,0,0,0,0,16h20v20a8,8,0,0,0,16,0V148h20a8,8,0,0,0,0-16Z";
// Full glyph, for the reduced-motion static render.
const BATTERY = NUB + CASE + PLUS;

const PLUS_C = { transformBox: "view-box" as const, originX: 0.5, originY: 140 / 256 };
const GLYPH_C = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const plus: Variants = {
  normal: { scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.2, 0.95, 1],
    rotate: [-90, 8, -2, 0],
    transition: { duration: 0.72, ease: OVERSHOOT_BACK, times: [0, 0.55, 0.8, 1] },
  },
};
const cell: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Confirm squash as the plus lands (~0.55 of the timeline). scaleX only — the
    // nub is at the top, so a vertical squash would clip it against y=0.
    scaleX: [1, 1, 0.97, 1.02, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.5, 0.64, 0.84, 1] },
  },
};

export const BatteryPlusVerticalIcon = forwardRef<IconHandle, IconProps>(
  function BatteryPlusVerticalIcon({ size = 28, style, ...props }, ref) {
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
          <motion.g variants={cell} style={GLYPH_C}>
            <path d={NUB} />
            <path d={CASE} />
          </motion.g>
          <motion.path d={PLUS} variants={plus} style={PLUS_C} />
        </motion.svg>
      </div>
    );
  },
);
