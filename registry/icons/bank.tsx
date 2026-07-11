"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CONSTRUCT + $ — the bank builds itself: the ground slab lays down, the four
// columns rise from it left to right, the beam settles across them, the
// pediment lands with a soft overshoot — and once the last stone is placed, a
// dollar sign pops into the central bay and holds. Open for business.
//
// The Phosphor "bank" glyph is rebuilt from primitives that match it 1:1 so
// each architectural piece moves on its own:
//   PEDIMENT — roof band with its inner triangle punched even-odd.
//   COLUMNS  — four plain 16×64 rects (x48/96/144/192, y104–168).
//   BEAM     — the rounded entablature bar (y168–184).
//   GROUND   — the glyph's own rounded ground slab subpath (y200–216).
// The dollar sign is hidden at rest, so the resting glyph stays exact.
const PEDIMENT =
  "M232,104H24a8,8,0,0,1-4.19-14.81l104-64a8,8,0,0,1,8.38,0l104,64A8,8,0,0,1,232,104ZM52.26,88H203.74L128,41.39Z";
const COLUMNS = ["M48,104h16v64H48Z", "M96,104h16v64H96Z", "M144,104h16v64H144Z", "M192,104h16v64H192Z"];
const BEAM = "M32,168H224a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16Z";
const GROUND = "M248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z";
const DOLLAR_S =
  "M138.5,125.5c0-6-4.5-9.5-10.5-9.5s-10.5,3.5-10.5,8.5c0,11,21,8.5,21,19.5c0,5-4.5,8.5-10.5,8.5s-10.5-3.5-10.5-9.5";
const DOLLAR_BAR = "M128,108v52";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const FOUNDATION = AT(128, 208);
const ROOFLINE = AT(128, 104);

const ground: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [0, 1], transition: { duration: 0.28, ease: SWEEP } },
};
const column = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1],
    transition: { duration: 0.3, ease: SWEEP, delay: 0.24 + i * 0.09 },
  },
});
const beam: Variants = {
  normal: { opacity: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1],
    y: [-14, 0],
    transition: { duration: 0.3, ease: ARRIVE, delay: 0.72 },
  },
};
const pediment: Variants = {
  normal: { opacity: 1, y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1, 1],
    y: [-20, 2, 0],
    scale: [0.92, 1.02, 1],
    transition: { duration: 0.45, ease: ARRIVE, times: [0, 0.7, 1], delay: 1.0 },
  },
};
const dollar: Variants = {
  normal: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
  animate: {
    // pop in once the pediment lands, then HOLD — this keyframe is the longest
    // animation in the variant, so the hover-replay loop waits for it and the
    // dollar stays on screen for over a second each cycle.
    scale: [0, 1.25, 1, 1],
    opacity: [0, 1, 1, 1],
    transition: { duration: 1.3, ease: ARRIVE, times: [0, 0.16, 0.27, 1], delay: 1.45 },
  },
};

export const BankIcon = forwardRef<IconHandle, IconProps>(function BankIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={PEDIMENT} fillRule="evenodd" />
          {COLUMNS.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d={BEAM} />
          <path d={GROUND} />
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
        <motion.path d={GROUND} variants={ground} style={FOUNDATION} />
        {COLUMNS.map((d, i) => (
          <motion.path key={d} d={d} variants={column(i)} style={AT(56 + i * 48, 168)} />
        ))}
        <motion.path d={BEAM} variants={beam} />
        <motion.path d={PEDIMENT} fillRule="evenodd" variants={pediment} style={ROOFLINE} />
        {/* Dollar sign in the central bay — pops once the pediment has landed. */}
        <motion.g variants={dollar} style={AT(128, 134)}>
          <path d={DOLLAR_S} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
          <path d={DOLLAR_BAR} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
        </motion.g>
      </motion.svg>
    </div>
  );
});
