"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY } from "../baby-icon";

// v6 — GIGGLE, ALIVE. v3's head-shake, now with the face broken into separately moving
// parts so the baby actually comes to life: the eyes blink twice mid-giggle, and the
// hair curl whips as secondary action — trailing the head-shake with a bigger, later
// swing (follow-through), so it reads as a soft thing dragged along by the motion.
//
// The base glyph is a single filled path (no separable features), so we rebuild the
// baby from primitives that match it 1:1: the head ring is the original's outer-r104 /
// inner-r88 ring, i.e. a centre-r96 stroke of width 16; the eyes are the same r12 dots
// at (92,128) and (164,128); the mouth is the original smile subpath, lifted whole.
const MOUTH =
  "M151.73,161.23a45,45,0,0,1-47.46,0a8,8,0,0,0-8.54,13.54a61,61,0,0,0,64.54,0a8,8,0,0,0-8.54-13.54Z";
// The hair tuft, lifted from the original glyph: the crown curl is the notch in the
// source path's inner ring, running from (131.91,40.09) down through the two bumps to
// (112.46,41.37) — identical curve, so it matches the glyph 1:1.
//
// The only change: both top ends are extended straight up to y26, *into* the black head
// ring (which spans y24→y40 at the crown). That buries the tuft's base and pivot behind
// the ring, so when the curl swings there is never a gap between hair and head — the
// joint is always overlapped, exactly how the single-path icons keep parts fused. The
// buried strip is the same fill, so it's invisible at rest.
const HAIR =
  "M131.91,26L131.91,40.09C120.32,56.38,120,71.88,120,72a8,8,0,0,0,16,0a8,8,0,0,1,16,0a24,24,0,0,1-48,0c0-.73.13-14.3,8.46-30.63L112.46,26Z";

// Whole-face giggle — the v3 head-shake, pivoting on the chin so the crown swings widest.
const CHIN = { transformBox: "view-box" as const, transformOrigin: "128px 224px" };
const giggle: Variants = {
  normal: { rotate: 0, transition: { duration: 0.35, ease: "easeOut" } },
  animate: {
    rotate: [0, -9, 7, -5, 3, 0],
    transition: {
      duration: 0.9,
      times: [0, 0.18, 0.42, 0.64, 0.84, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

// Hair follow-through — same rhythm as the giggle but a beat later and swung wider, so
// the curl trails the head like a soft appendage. Pivots on the curl's base.
// Pivot deep inside the ring (y32) so the swing shows the tip, never the buried base.
const HAIR_BASE = { transformBox: "view-box" as const, transformOrigin: "122px 32px" };
// Jiggle — a decaying oscillation instead of a single sway. The curl whips back and
// forth several times with shrinking amplitude, springy and floppy, then settles. It
// trails the head-shake (starts a beat later, swings wider) so the hair wobbles whenever
// the head moves. Dense alternating keyframes fake the spring; easeOut segments give the
// loose, snappy feel.
const hairSway: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, -18, 14, -13, 9, -7, 4, -2, 0],
    transition: {
      duration: 0.9,
      times: [0, 0.16, 0.3, 0.44, 0.58, 0.7, 0.82, 0.92, 1],
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

// Eyes — two quick blinks during the giggle. scaleY collapses each dot to a slit about
// its own centre, then snaps back.
const blink: Variants = {
  normal: { scaleY: 1, transition: { duration: 0.15, ease: "easeOut" } },
  animate: {
    scaleY: [1, 1, 0.1, 1, 1, 0.1, 1],
    transition: {
      duration: 0.9,
      times: [0, 0.22, 0.3, 0.4, 0.62, 0.7, 0.82],
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

export const Baby6 = forwardRef<IconHandle, IconProps>(function Baby6({ size = 28, style, ...props }, ref) {
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
          {/* Head ring — matches the original's r104/r88 filled ring as a r96 stroke. */}
          <circle cx={128} cy={128} r={96} fill="none" stroke="currentColor" strokeWidth={16} />
          {/* Hair curl, swinging on its base as secondary action. */}
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
          {/* Smile — lifted from the original glyph. */}
          <path d={MOUTH} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
