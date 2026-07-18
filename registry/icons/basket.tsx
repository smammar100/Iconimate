"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SWING + HOP + SETTLE — one carry gesture with consequences. The basket
// springs up with a stretch, swings like a pendulum while airborne (level again
// before touchdown), lands with a squash — and the impact jostles the contents,
// which drop and jiggle to rest a beat after landing. Three nested motions,
// each about its own pivot: the hop about the base, the swing about the carry
// handle's apex, the contents about their own feet.
//
// The Phosphor "shopping-basket" glyph splits into its own untouched subpaths:
//   SHELL — the basket body, the ^ carry handle, and the top rim.
//   GRIPS — the three rounded content lines inside the basket.
// SHELL + GRIPS is byte-identical to the original path.
const SHELL =
  "M239.93,89.06,224.86,202.12A16.06,16.06,0,0,1,209,216H47a16.06,16.06,0,0,1-15.86-13.88L16.07,89.06A8,8,0,0,1,24,80H68.37L122,18.73a8,8,0,0,1,12,0L187.63,80H232a8,8,0,0,1,7.93,9.06ZM89.63,80h76.74L128,36.15ZM222.86,96H33.14L47,200H209Z";
const GRIPS =
  "M136,120v56a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm36.84-.8-5.6,56A8,8,0,0,0,174.4,184a7.32,7.32,0,0,0,.81,0,8,8,0,0,0,7.95-7.2l5.6-56a8,8,0,0,0-15.92-1.6Zm-89.68,0a8,8,0,0,0-15.92,1.6l5.6,56a8,8,0,0,0,8,7.2,7.32,7.32,0,0,0,.81,0,8,8,0,0,0,7.16-8.76Z";
// Full original glyph (GRIPS + SHELL, in the original's subpath order), for the
// reduced-motion static render.
const BASKET = GRIPS + SHELL;

const BASE = { transformBox: "view-box" as const, originX: 0.5, originY: 208 / 256 };
const APEX = { transformBox: "view-box" as const, originX: 0.5, originY: 36 / 256 };
const GRIP_FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 176 / 256 };

const DUR = 1.3;

// Bounds: the glyph top (handle apex, y≈16.7) must stay ≥0 under stretch-about-
// the-base plus lift, or a clipping ancestor cuts the handle at the hop's peak.
// scaleY 1.02 about y208 puts the top at 12.9; −12 lift lands it at 0.9.
const hop: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Up fast, hang airborne through the middle (while the swing plays), then
    // land with the squash and recover.
    y: [0, -12, -11, -11, 0, 0],
    scaleY: [1, 1.02, 1, 1, 0.9, 1],
    scaleX: [1, 0.98, 1, 1, 1.07, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.24, 0.6, 0.78, 1] },
  },
};
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Swings only while airborne (the middle of the timeline), level by landing.
    rotate: [0, 0, -9, 7, -3.5, 0, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.14, 0.3, 0.46, 0.6, 0.74, 1] },
  },
};
const settle: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Triggered by touchdown: delay ≈ the hop's landing keyframe (DUR × 0.74).
    y: [0, -4, 2, -1, 0],
    scaleY: [1, 0.9, 1.05, 0.98, 1],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.25, 0.5, 0.75, 1], delay: DUR * 0.74 },
  },
};

export const BasketIcon = forwardRef<IconHandle, IconProps>(
  function BasketIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BASKET} />
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
          <motion.g variants={hop} style={BASE}>
            <motion.g variants={swing} style={APEX}>
              <path d={SHELL} />
              <motion.path d={GRIPS} variants={settle} style={GRIP_FOOT} />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
