"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LOW ALERT (vertical) — battery-low's Level Up + Blink, rotated 90°. One bar
// (the low charge, at the bottom of the cell). Two coordinated phases: the bar
// LEVELS UP from empty — sliding in FROM THE LEFT (scaleX) instead of up from
// the base — then the WHOLE CELL BLINKS twice, the low-battery warning,
// settling bright.
//
// Direction is the only change from the horizontal cell (there the bar grew up
// with scaleY). Two layers: an outer group carries the blink (opacity, held at
// full through the fill so the bar arrives first), the inner bar carries the
// level-up. CASE + BAR + NUB recompose the glyph exactly; nothing added, nothing
// filled. Opacity blink, no whole-glyph transform, so the top nub is safe.
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
const BAR = "M160,192H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z";
const BATTERY = NUB + CASE + BAR;

const BAR_ANCHOR = { transformBox: "view-box" as const, originX: 96 / 256, originY: 200 / 256 };

// Phase 1: the bar fills from the left (0..~0.36 of the timeline).
const bar: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1.2, 1, 1],
    transition: { duration: 1.7, ease: OVERSHOOT_BACK, times: [0, 0.24, 0.36, 1] },
  },
};
// Phase 2: the whole cell blinks the low-battery warning.
const cell: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 1, 0.28, 1, 0.28, 1],
    transition: { duration: 1.7, ease: "easeInOut", times: [0, 0.46, 0.58, 0.72, 0.84, 1] },
  },
};

export const BatteryVerticalLowIcon = forwardRef<IconHandle, IconProps>(
  function BatteryVerticalLowIcon({ size = 28, style, ...props }, ref) {
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
            <path d={NUB} />
            <path d={CASE} />
            <motion.path d={BAR} variants={bar} style={BAR_ANCHOR} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
