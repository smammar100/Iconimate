"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ADD — the plus is the star. It scales up from nothing with an overshoot while
// spinning a quarter turn into place (invisible at the ends thanks to the +'s
// 4-fold symmetry, so it reads as a crisp snap rather than a full turn), and the
// cell answers with a tiny confirming squash as it lands. "Added."
//
// The glyph splits at its own subpath boundaries into PLUS / CASE / NUB (union
// byte-identical). Nothing is added and nothing is filled — only the glyph's own
// ink moves.
//
// Bounds: the nub ends at x=256 exactly, so the cell's confirm squash is scaleY
// ONLY (never scaleX/+x, or the nub clips against the box). The plus scales about
// its own center (120,128), well inside the interior.
const PLUS =
  "M152,128a8,8,0,0,1-8,8H124v20a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h20V100a8,8,0,0,1,16,0v20h20A8,8,0,0,1,152,128Z";
const CASE =
  "M224,80v96a24,24,0,0,1-24,24H32A24,24,0,0,1,8,176V80A24,24,0,0,1,32,56H200A24,24,0,0,1,224,80Zm-16,0a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8Z";
const NUB = "M248,88a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,248,88Z";
// Full glyph, for the reduced-motion static render.
const BATTERY = CASE + PLUS + NUB;

const PLUS_C = { transformBox: "view-box" as const, originX: 120 / 256, originY: 0.5 };
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
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Confirm squash as the plus lands (~0.55 of the timeline).
    scaleY: [1, 1, 0.97, 1.02, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.5, 0.64, 0.84, 1] },
  },
};

export const BatteryPlusIcon = forwardRef<IconHandle, IconProps>(
  function BatteryPlusIcon({ size = 28, style, ...props }, ref) {
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
            <path d={CASE} />
            <path d={NUB} />
          </motion.g>
          <motion.path d={PLUS} variants={plus} style={PLUS_C} />
        </motion.svg>
      </div>
    );
  },
);
