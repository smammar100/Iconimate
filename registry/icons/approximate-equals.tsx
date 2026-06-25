"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// NUDGE — a tactile beat: the two sine strokes lean toward each other and spring
// back, the "≈" acknowledging a near-match. STAGING: the top wave leads, the
// bottom trails a beat behind, so the pair reads as overlapping action rather
// than one rigid block. Phosphor "approximate equals" glyph (currentColor),
// split into the two waves so each can move on its own.

const WAVE_BOTTOM =
  "M222.16,153.26a8,8,0,0,1-1,11.25c-17.36,14.38-32.86,19.49-47,19.49-18.58,0-34.82-8.81-49.93-17-25.35-13.75-47.24-25.63-79.07.74a8,8,0,1,1-10.22-12.3c40.17-33.27,70.32-16.92,96.93-2.48,25.35,13.75,47.24,25.62,79.07-.75A8,8,0,0,1,222.16,153.26Z";
const WAVE_TOP =
  "M45.16,103.8c31.83-26.37,53.72-14.5,79.07-.75,15.11,8.2,31.35,17,49.93,17,14.14,0,29.64-5.11,47-19.49a8,8,0,1,0-10.22-12.3c-31.83,26.37-53.72,14.49-79.07.74-26.61-14.43-56.76-30.79-96.93,2.48A8,8,0,0,0,45.11,103.8Z";

const nudgeTop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 7, 0], transition: { duration: 0.5, ease: OVERSHOOT_BACK } },
};
const nudgeBottom: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -7, 0], transition: { duration: 0.5, ease: OVERSHOOT_BACK, delay: staged(1) } },
};

export const ApproximateEqualsIcon = forwardRef<IconHandle, IconProps>(
  function ApproximateEqualsIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

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
          <motion.path d={WAVE_TOP} variants={reduced ? undefined : nudgeTop} />
          <motion.path d={WAVE_BOTTOM} variants={reduced ? undefined : nudgeBottom} />
        </motion.svg>
      </div>
    );
  },
);
