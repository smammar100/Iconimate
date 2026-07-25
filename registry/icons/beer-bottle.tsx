"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// POP & FIZZ — the cap comes off and the beer fizzes. A crown cap flies off
// the mouth, spinning, while the bottle recoils DOWN its own axis (the recoil
// being exactly opposite the mouth is what sells cause-and-effect) — then
// bubbles stream out of the open mouth in a loop.
//
// The bottle lies on the 45° diagonal: mouth at the top-right corner (~240,16),
// body at the bottom-left. One compound path, animated as rigid glass. The cap
// and bubbles are extra shapes resting at opacity 0, so the rest state stays
// pixel-identical to the Phosphor glyph.
//
// Bounds: the mouth is at the CORNER, so nothing can fly up-right. The cap
// pops up a touch (top y≈10), then arcs down into the empty bottom-right
// region, spinning and fading (its right edge peaks ~256 exactly as it goes).
// The bubbles are born small right at the lip — invisible against the glyph —
// and grow to full size as they drift into the empty up-left triangle; the
// biggest (r11) tops out at y≈1 at full scale.
const BOTTLE =
  "M245.66,42.34l-32-32a8,8,0,0,0-11.32,11.32l1.48,1.47L148.65,64.51l-38.22,7.65a8.05,8.05,0,0,0-4.09,2.18L23,157.66a24,24,0,0,0,0,33.94L64.4,233a24,24,0,0,0,33.94,0l83.32-83.31a8,8,0,0,0,2.18-4.09l7.65-38.22,41.38-55.17,1.47,1.48a8,8,0,0,0,11.32-11.32ZM96,107.31,148.69,160,104,204.69,51.31,152ZM81.37,224a7.94,7.94,0,0,1-5.65-2.34L34.34,180.28a8,8,0,0,1,0-11.31L40,163.31,92.69,216,87,221.66A8,8,0,0,1,81.37,224ZM177.6,99.2a7.92,7.92,0,0,0-1.44,3.23l-7.53,37.63L160,148.69,107.31,96l8.63-8.63,37.63-7.53a7.92,7.92,0,0,0,3.23-1.44l58.45-43.84,6.19,6.19Z";

// Crown-cap side profile (30×14, local origin at its centre): flat top, and a
// crimped zigzag skirt on the +y side — the side that faces the bottle mouth
// once the group is rotated 45° onto the neck.
const CAP = "M-15,-7H15V3L10,7L5,3.5L0,7L-5,3.5L-10,7L-15,3Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const MOUTH = { transformBox: "view-box" as const, originX: 232 / 256, originY: 22 / 256 };

// The bottle: the v3-style recoil down its axis as the cap lets go.
const recoil: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -8, 2, -1, 0],
    y: [0, 8, -2, 1, 0],
    rotate: [0, -2.5, 1.5, -0.5, 0],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.2, 0.55, 0.8, 1] },
  },
};
// The cap: pops up, then arcs down-right, spinning and fading.
const cap: Variants = {
  normal: { opacity: 0, x: 0, y: 0, rotate: 0, transition: { duration: 0.2 } },
  animate: {
    opacity: [1, 1, 0.9, 0],
    x: [0, 6, 9, 10],
    y: [0, -8, 8, 38],
    rotate: [0, 60, 130, 200],
    transition: { duration: 0.9, ease: "easeOut", times: [0, 0.25, 0.55, 1] },
  },
};
// Bubbles: born small right at the lip (invisible against the glyph), they
// clear it growing to full size as they drift into the empty up-left triangle.
const bubbleNear = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, y: 0, scale: 0.3, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 0.85, 0],
    x: [0, -10, -22, -32],
    y: [0, -1, -2, -4],
    scale: [0.3, 0.85, 1, 0.9],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.3, delay },
  },
});
const bubbleFar = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, y: 0, scale: 0.3, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 0.85, 0],
    x: [0, -9, -20, -30],
    y: [0, -2, -5, -8],
    scale: [0.3, 0.8, 1, 0.9],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.3, delay },
  },
});
const bubble1 = bubbleNear(0.35);
const bubble2 = bubbleFar(0.7);
const bubble3 = bubbleFar(1.05);

export const BeerBottleIcon = forwardRef<IconHandle, IconProps>(
  function BeerBottleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BOTTLE} />
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
          <motion.path d={BOTTLE} variants={recoil} style={CENTER} />
          {/* Cap: a crown cap seated on the mouth at 45°, crimps facing the bottle. */}
          <motion.g variants={cap} style={MOUTH}>
            <path d={CAP} transform="translate(232,22) rotate(45)" />
          </motion.g>
          {/* Bubbles: staggered, streaming from the lip into the open up-left space. */}
          <motion.g variants={bubble1}>
            <circle cx={233} cy={16} r={11} />
          </motion.g>
          <motion.g variants={bubble2}>
            <circle cx={238} cy={20} r={8} />
          </motion.g>
          <motion.g variants={bubble3}>
            <circle cx={226} cy={24} r={6} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
