"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LOW ALERT — Level Up + Blink. The story of a dying cell: its single bar fills
// up from empty (levels up, pops in from the base with overshoot), then the
// WHOLE CELL flashes twice — the low-battery warning — settling bright.
//
// Two coordinated layers: an outer group carries the blink (opacity, held at
// full through the fill so the bar arrives first), the inner bar carries the
// level-up (scaleY). CASE + BAR + NUB recompose the original glyph exactly, so
// nothing is added and nothing is filled — only the glyph's own ink moves. No
// transforms on the whole glyph, so there is no bounds concern.
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BAR = "M64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
// Full glyph (CASE + BAR + NUB), for the reduced-motion static render.
const BATTERY = CASE + BAR + NUB;

const BAR_ANCHOR = { transformBox: "view-box" as const, originX: 56 / 256, originY: 160 / 256 };

// Phase 1: the bar fills from empty (0..~0.36 of the timeline).
const bar: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.2, 1, 1],
    transition: { duration: 1.7, ease: OVERSHOOT_BACK, times: [0, 0.24, 0.36, 1] },
  },
};
// Phase 2: the whole cell blinks the low-battery warning — bright through the
// fill, then two dips, settling bright.
const cell: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 1, 0.28, 1, 0.28, 1],
    transition: { duration: 1.7, ease: "easeInOut", times: [0, 0.46, 0.58, 0.72, 0.84, 1] },
  },
};

export const BatteryLowIcon = forwardRef<IconHandle, IconProps>(
  function BatteryLowIcon({ size = 28, style, ...props }, ref) {
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
          <motion.g variants={cell}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BAR} variants={bar} style={BAR_ANCHOR} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
