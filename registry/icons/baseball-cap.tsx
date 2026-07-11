"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// GUST AWAY — the wind steals it. Streaks blow in from the left, the cap
// flutters, rips up and away spinning, hangs flapping at the corner — then
// gets yanked back on elastically and slams down in a puff of dust.
//
// The cap is the original Phosphor path, untouched; the wind streaks and
// landing dust are extra actors hidden at rest, so the resting glyph stays
// exact.
const CAP =
  "M128,24h0A104.12,104.12,0,0,0,24,128v56a24,24,0,0,0,24,24,24.11,24.11,0,0,0,14.18-4.64C74.33,194.53,95.6,184,128,184s53.67,10.52,65.81,19.35A24,24,0,0,0,232,184V128A104.12,104.12,0,0,0,128,24Zm88,104v8.87a166,166,0,0,0-40.94-18.22A167,167,0,0,0,146.19,41.9,88.14,88.14,0,0,1,216,128ZM128,44.27a152.47,152.47,0,0,1,30.4,70.46,170.85,170.85,0,0,0-60.84,0A153.31,153.31,0,0,1,128,44.27ZM109.81,41.9a167,167,0,0,0-28.87,76.76A166,166,0,0,0,40,136.88V128A88.14,88.14,0,0,1,109.81,41.9ZM211.66,191.11a8,8,0,0,1-8.44-.69C189.16,180.2,164.7,168,128,168S66.84,180.2,52.78,190.42a8,8,0,0,1-8.44.69A7.77,7.77,0,0,1,40,184V156.07a152,152,0,0,1,176,0V184A7.77,7.77,0,0,1,211.66,191.11Z";

// Flight pivots about the glyph center (smallest swing radius, keeps every
// frame inside the viewBox); the landing squash pivots where the cap sits.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const HEAD = { transformBox: "view-box" as const, originX: 0.5, originY: 208 / 256 };

const HIDDEN = { opacity: 0, transition: { duration: 0.1 } };

// Flight — excursion, tilt, and a slight scale-down for depth; bounded so the
// cap never leaves the 256 viewBox (max reach ≈ r·0.88 + 16px translate).
const flight: Variants = {
  normal: { x: 0, y: 0, rotate: 0, scale: 1, transition: { duration: 0 } },
  animate: {
    x: [0, 2, 12, 16, 14, 0, 0, 0],
    y: [0, -3, -14, -18, -16, 0, 0, 0],
    rotate: [0, -5, 12, 9, 14, 0, 0, 0],
    scale: [1, 1, 0.9, 0.88, 0.9, 1, 1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      times: [0, 0.1, 0.28, 0.4, 0.52, 0.72, 0.85, 1],
    },
  },
};
// Landing squash — grounded at the head line.
const land: Variants = {
  normal: { scaleY: 1, transition: { duration: 0 } },
  animate: {
    scaleY: [1, 1, 0.88, 1.05, 1],
    transition: { duration: 1.5, ease: "easeOut", times: [0, 0.68, 0.76, 0.86, 1] },
  },
};
const wind = (delay: number): Variants => ({
  normal: HIDDEN,
  animate: {
    opacity: [0, 1, 0],
    x: [-16, 26],
    transition: { duration: 0.45, ease: "easeOut", times: [0, 0.4, 1], delay },
  },
});
const dust = (dx: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0.3],
    x: [0, dx],
    y: [0, -10],
    transition: { duration: 0.4, ease: "easeOut", delay },
  },
});

const WIND_STREAKS: [number, number][] = [
  [70, 0.02],
  [96, 0.12],
  [122, 0.22],
];
const DUST_PUFFS: [number, number][] = [
  [-26, 1.06],
  [26, 1.06],
  [-16, 1.12],
  [16, 1.12],
];

export const BaseballCapIcon = forwardRef<IconHandle, IconProps>(function BaseballCapIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={CAP} />
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
        {/* wind streaks */}
        {WIND_STREAKS.map(([y, d], i) => (
          <motion.path
            key={i}
            d={`M24,${y}h40`}
            fill="none"
            stroke="currentColor"
            strokeWidth={9}
            strokeLinecap="round"
            variants={wind(d)}
          />
        ))}
        {/* landing dust */}
        {DUST_PUFFS.map(([dx, d], i) => (
          <motion.circle key={i} cx={128 + dx * 2.4} cy={212} r={6} variants={dust(dx, d)} />
        ))}
        <motion.g variants={flight} style={CENTER}>
          <motion.g variants={land} style={HEAD}>
            <path d={CAP} />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
