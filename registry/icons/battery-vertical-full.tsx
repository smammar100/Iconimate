"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LEVEL UP (vertical) — the same level-up motion as battery-full, rotated 90°
// for the portrait cell. Direction is the only thing that changes: the meter
// fills BOTTOM → TOP (charge rising up the cell) instead of left → right, and
// each horizontal bar fills FROM THE LEFT (scaleX) instead of up from the base
// (scaleY). Four bars: all reset to empty, then each slides in from the left in
// turn, bottom bar first, with an overshoot as it lands.
//
// CASE + NUB + BARS recompose the glyph exactly (the bars are the glyph's own
// rounded-rect subpaths, rebuilt in absolute form), so nothing is added and
// nothing is filled. The stagger lives in each bar's `times`, not a `delay`
// (a delay would hold the bar full until its slot then snap to empty). No
// whole-glyph transform, so the top nub is never clipped.
const NUB = "M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Z";
const CASE =
  "M200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z";
// Bottom → top, so the bottom bar (index 0) fills first as the charge rises.
const BARS = [
  { d: "M160,192H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", cy: 200 },
  { d: "M160,152H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", cy: 160 },
  { d: "M160,112H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", cy: 120 },
  { d: "M160,72H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", cy: 80 },
];
const BATTERY = NUB + CASE + BARS.map((b) => b.d).join("");

const levelUp = (i: number): Variants => ({
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 0, 1.18, 1, 1],
    transition: {
      duration: 1.6,
      ease: OVERSHOOT_BACK,
      times: [0, 0.1 + i * 0.18, 0.22 + i * 0.18, 0.32 + i * 0.18, 1],
    },
  },
});

export const BatteryVerticalFullIcon = forwardRef<IconHandle, IconProps>(
  function BatteryVerticalFullIcon({ size = 28, style, ...props }, ref) {
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
          <path d={NUB} />
          <path d={CASE} />
          {BARS.map((b, i) => (
            <motion.path
              key={i}
              d={b.d}
              variants={levelUp(i)}
              style={{ transformBox: "view-box", originX: 96 / 256, originY: b.cy / 256 }}
            />
          ))}
        </motion.svg>
      </div>
    );
  },
);
