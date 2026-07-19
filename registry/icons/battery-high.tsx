"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LEVEL UP — the meter charges from empty. This is the nearly-full cell (THREE
// bars at x-centers 56/96/136; no rightmost bar). Each bar resets to nothing,
// then pops up from the base in turn, left → right, with an overshoot as it
// lands.
//
// The bars are the glyph's own subpaths (CASE + BARS + NUB recompose the
// original exactly), so nothing is added and nothing is filled. The stagger
// lives in each bar's `times`, NOT a `delay`: a delay would hold the bar full
// until its slot then snap to empty (backwards). Base-anchored, so bars grow up
// from the bottom like a real level.
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BARS = [
  { d: "M64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 56 },
  { d: "M104,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 96 },
  { d: "M144,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 136 },
];
// Full glyph (all subpaths), for the reduced-motion static render.
const BATTERY = CASE + BARS.map((b) => b.d).join("") + NUB;

const levelUp = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 0, 1.18, 1, 1],
    transition: {
      duration: 1.6,
      ease: OVERSHOOT_BACK,
      times: [0, 0.1 + i * 0.18, 0.22 + i * 0.18, 0.32 + i * 0.18, 1],
    },
  },
});

export const BatteryHighIcon = forwardRef<IconHandle, IconProps>(
  function BatteryHighIcon({ size = 28, style, ...props }, ref) {
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
          <path d={CASE} />
          <path d={NUB} />
          {BARS.map((b, i) => (
            <motion.path
              key={i}
              d={b.d}
              variants={levelUp(i)}
              style={{ transformBox: "view-box", originX: b.cx / 256, originY: 160 / 256 }}
            />
          ))}
        </motion.svg>
      </div>
    );
  },
);
