"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPIN + BOUNCE — frame-studied from a reference clip that layers two
// synchronized motions plus a flourish:
//   bounce — pure deformation, no travel: tall stretch (wind-up), wide squash
//            (contact) at mid-timeline, counter-stretch recovery, settle.
//   spin   — one full revolution, launching after the wind-up and crossing
//            180° right at the squash; single-segment on purpose — per-segment
//            easing would halt the rotation at every keyframe (visible stutter).
//   whips  — two arc streaks orbit just outside the rim on a lazier curve, so
//            they lag the ball mid-flight like elastic tails and converge by
//            the end; visible only while the spin is fast, gone at rest.
//
// The ball glyph is untouched Phosphor "basketball"; the streaks are extra ink
// with opacity 0 in the normal state, so the rest render is pixel-identical.
// Bounds (the wrapper clips): scaleY 1.08 about y232 puts the top at 7.4;
// scaleX 1.12 puts the sides at 11.5/244.5. The streaks sit OUTSIDE the squash
// group on purpose — squashed, their r120 outer edge would cross x=0;
// undeformed they orbit at 8..248. Everything stays inside the 256 box.
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM60,72.17A87.2,87.2,0,0,1,79.63,120H40.37A87.54,87.54,0,0,1,60,72.17ZM136,120V40.37a87.59,87.59,0,0,1,48.68,20.37A103.06,103.06,0,0,0,160.3,120Zm-16,0H95.7A103.06,103.06,0,0,0,71.32,60.74,87.59,87.59,0,0,1,120,40.37ZM79.63,136A87.2,87.2,0,0,1,60,183.83,87.54,87.54,0,0,1,40.37,136Zm16.07,0H120v79.63a87.59,87.59,0,0,1-48.68-20.37A103.09,103.09,0,0,0,95.7,136Zm40.3,0h24.3a103.09,103.09,0,0,0,24.38,59.26A87.59,87.59,0,0,1,136,215.63Zm40.37,0h39.26A87.54,87.54,0,0,1,196,183.83,87.2,87.2,0,0,1,176.37,136Zm0-16A87.2,87.2,0,0,1,196,72.17,87.54,87.54,0,0,1,215.63,120Z";

// Arcs of the r114 circle about (128,128): lower-left 100°→150°, upper-right
// 280°→330° (θ increasing = clockwise in y-down coords, hence sweep=1).
const STREAK_A = "M108.2,240.3 A114,114 0 0 1 29.3,185";
const STREAK_B = "M147.8,15.7 A114,114 0 0 1 226.7,71";

const FLOOR = { transformBox: "view-box" as const, originX: 0.5, originY: 232 / 256 };
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const DUR = 1.25;

const bounce: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.08, 1, 0.85, 1.04, 0.98, 1],
    scaleX: [1, 0.94, 1, 1.12, 0.97, 1.01, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.14, 0.3, 0.44, 0.62, 0.8, 1] },
  },
};
const spin: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    // ONE segment, one bezier: slow launch out of the wind-up, fastest through
    // the middle (≈180° lands near the squash), long drain. Keyframing this
    // would stop the rotation dead at every boundary.
    rotate: [0, 360],
    transition: { duration: DUR, ease: [0.55, 0.08, 0.25, 1] },
  },
};
const trail: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 360],
    transition: { duration: DUR, ease: [0.72, 0.05, 0.22, 1] },
  },
};
const streak: Variants = {
  normal: { opacity: 0, pathLength: 0.3, transition: { duration: 0 } },
  animate: {
    // Whips exist only while the spin is fast: grow in, stretch long, snap out.
    opacity: [0, 0, 1, 1, 0.6, 0],
    pathLength: [0.15, 0.15, 1, 1, 0.4, 0.15],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.18, 0.32, 0.55, 0.72, 0.85] },
  },
};

export const BasketballIcon = forwardRef<IconHandle, IconProps>(
  function BasketballIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BALL} />
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
          <motion.g variants={bounce} style={FLOOR}>
            <motion.g variants={spin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
          <motion.g variants={trail} style={CENTER}>
            <motion.path d={STREAK_A} variants={streak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
            <motion.path d={STREAK_B} variants={streak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
