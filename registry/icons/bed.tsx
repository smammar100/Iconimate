"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DEEP SLEEP — the bed falls asleep, in order: it flops with a mattress
// squash, settles, and then two things run together — a slow breathing swell
// on the frame (the sleeper under the covers) and a looping zzz trail rising
// from above the pillow, the first Z born on the first exhale.
//
// Side-view bed, one compound path: left headboard post (x16..32, y40..216),
// right post reaching the viewBox edge (x240..256), pillow window (x32..104),
// mattress window (x120..240). The right post TOUCHES x=256 — zero horizontal
// margin — so every squash/stretch is scaleY-only, pivoted at the floor
// (y216); nothing ever clips. The Zs are extra paths resting at opacity 0, so
// the rest state stays pixel-identical to the Phosphor glyph (big Z rises to
// y8, small z to y4 — inside the box).
//
// A one-shot flop and an endless breathe can't share one keyframe set, so the
// frame uses two nested groups: the outer plays the flop once, the inner
// starts the infinite breathe after the settle.
const BED =
  "M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z";

// Block "Z" glyph, 36×36 at its own origin — positioned per-use via transform.
const Z = "M0,0H36V10L15,26H36V36H0V26L21,10H0Z";

const FLOOR = { transformBox: "view-box" as const, originX: 0.5, originY: 216 / 256 };

// Outer: the one-shot flop — a soft mattress squash and recover.
const flop: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.93, 1.03, 0.98, 1],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.25, 0.55, 0.8, 1] },
  },
};
// Inner: the endless deep-sleep breathe, starting after the settle.
const breathe: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    scaleY: [1, 1.02, 1],
    transition: { duration: 2.4, ease: "easeInOut", times: [0, 0.5, 1], repeat: ambient ? Infinity : 0, delay: 0.8 },
  }),
};
// The zzz trail — both Zs rest at opacity 0 and loop once the sleep begins.
const zBig: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: (ambient: boolean) => ({
    opacity: [0, 1, 1, 0],
    y: [10, 2, -8, -14],
    scale: [0.7, 1, 1, 0.95],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: ambient ? Infinity : 0, repeatDelay: 0.3, delay: 0.9 },
  }),
};
const zSmall: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: (ambient: boolean) => ({
    opacity: [0, 0.9, 0.9, 0],
    y: [12, 4, -5, -10],
    scale: [0.5, 0.7, 0.7, 0.65],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: ambient ? Infinity : 0, repeatDelay: 0.3, delay: 1.45 },
  }),
};

export const BedIcon = forwardRef<IconHandle, IconProps>(
  function BedIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, ambient, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BED} />
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
          <motion.g variants={flop} style={FLOOR}>
            <motion.g variants={breathe} custom={ambient} style={FLOOR}>
              <path d={BED} />
            </motion.g>
          </motion.g>
          <motion.g variants={zBig} custom={ambient}>
            <path d={Z} transform="translate(66,22)" />
          </motion.g>
          <motion.g variants={zSmall} custom={ambient}>
            <path d={Z} transform="translate(112,14)" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
