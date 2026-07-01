"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// GIGGLE — the baby squirms with a laugh: the whole face rocks left–right on the chin,
// the eyes blink twice, and the hair curl jiggles as secondary action, trailing the
// head-shake with a floppy, decaying wobble.
//
// The Phosphor "baby" glyph is a single filled path, so to move features independently
// we rebuild it from primitives that match it 1:1: the head is the original's r104/r88
// ring drawn as a centre-r96 stroke of width 16; the eyes are the same r12 dots at
// (92,128) and (164,128); the smile is the glyph's own mouth subpath. The hair is the
// glyph's crown tuft, lifted out and extended up into the ring so its pivot stays buried
// behind the ring — the joint never opens a gap as the curl swings.
const BABY =
  "M92,140a12,12,0,1,1,12-12A12,12,0,0,1,92,140Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,116Zm-12.27,45.23a45,45,0,0,1-47.46,0,8,8,0,0,0-8.54,13.54,61,61,0,0,0,64.54,0,8,8,0,0,0-8.54-13.54ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88.11,88.11,0,0,0-84.09-87.91C120.32,56.38,120,71.88,120,72a8,8,0,0,0,16,0,8,8,0,0,1,16,0,24,24,0,0,1-48,0c0-.73.13-14.3,8.46-30.63A88,88,0,1,0,216,128Z";
const MOUTH =
  "M151.73,161.23a45,45,0,0,1-47.46,0a8,8,0,0,0-8.54,13.54a61,61,0,0,0,64.54,0a8,8,0,0,0-8.54-13.54Z";
const HAIR =
  "M131.91,26L131.91,40.09C120.32,56.38,120,71.88,120,72a8,8,0,0,0,16,0a8,8,0,0,1,16,0a24,24,0,0,1-48,0c0-.73.13-14.3,8.46-30.63L112.46,26Z";

// Whole-face giggle — the head-shake, pivoting on the chin so the crown swings widest.
const CHIN = { transformBox: "view-box" as const, transformOrigin: "128px 224px" };
const giggle: Variants = {
  normal: { rotate: 0, transition: { duration: 0.35, ease: "easeOut" } },
  animate: {
    rotate: [0, -9, 7, -5, 3, 0],
    transition: { duration: 0.9, times: [0, 0.18, 0.42, 0.64, 0.84, 1], ease: "easeInOut" },
  },
};

// Hair jiggle — a decaying oscillation pivoting on the buried base at (122,32). It trails
// the head-shake (starts a beat later, swings wider) so the curl wobbles when the head
// moves; easeOut segments give the loose, snappy feel.
const HAIR_BASE = { transformBox: "view-box" as const, transformOrigin: "122px 32px" };
const hairSway: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, -18, 14, -13, 9, -7, 4, -2, 0],
    transition: {
      duration: 0.9,
      times: [0, 0.16, 0.3, 0.44, 0.58, 0.7, 0.82, 0.92, 1],
      ease: "easeOut",
    },
  },
};

// Eyes — two quick blinks during the giggle; scaleY collapses each dot to a slit.
const blink: Variants = {
  normal: { scaleY: 1, transition: { duration: 0.15, ease: "easeOut" } },
  animate: {
    scaleY: [1, 1, 0.1, 1, 1, 0.1, 1],
    transition: { duration: 0.9, times: [0, 0.22, 0.3, 0.4, 0.62, 0.7, 0.82], ease: "easeInOut" },
  },
};

export const BabyIcon = forwardRef<IconHandle, IconProps>(function BabyIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BABY} />
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
      >
        {/* Whole face giggles as one body. */}
        <motion.g variants={giggle} style={CHIN}>
          {/* Head ring — the original's r104/r88 filled ring as a r96 stroke. */}
          <circle cx={128} cy={128} r={96} fill="none" stroke="currentColor" strokeWidth={16} />
          {/* Hair curl, jiggling on its buried base as secondary action. */}
          <motion.path variants={hairSway} style={HAIR_BASE} d={HAIR} />
          {/* Eyes — blink about their own centres. */}
          <motion.circle
            variants={blink}
            style={{ transformBox: "view-box", transformOrigin: "92px 128px" }}
            cx={92}
            cy={128}
            r={12}
          />
          <motion.circle
            variants={blink}
            style={{ transformBox: "view-box", transformOrigin: "164px 128px" }}
            cx={164}
            cy={128}
            r={12}
          />
          {/* Smile — the glyph's own mouth subpath. */}
          <path d={MOUTH} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
