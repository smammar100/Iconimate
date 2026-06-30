"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v7 — WRAP. The rod stays static; the coil draws up around it from the foot. The
// central rod is clipped to a center band and never animates. The coils are revealed
// by a smooth bottom → top clip wipe — we animate the rect's y + height *attributes*
// (Motion's `attrY`, since plain `y` becomes a CSS transform that a clip ignores), so
// the reveal is continuous and the coils appear one segment at a time from the bottom,
// with no stutter or end-of-draw pop. A gentle skew rides along as they wind on, and
// the leaf-like head lands last and wiggles to rest.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const STICK_BAND = { x: 108, w: 40 }; // center band that shows the static rod
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};

// Smooth bottom → top reveal: the rect's bottom edge stays pinned at y=264 while its
// top climbs from the foot to above the glyph.
const reveal: Variants = {
  normal: { attrY: -8, height: 272, transition: RETURN_TRANSITION },
  animate: { attrY: [264, -8], height: [0, 272], transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } },
};
// A gentle slither as the coil winds on.
const wind: Variants = {
  normal: { skewX: 0, transition: RETURN_TRANSITION },
  animate: {
    skewX: [0, -3, 2, -1, 0],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.3, 0.55, 0.8, 1] },
  },
};
// The head holds off, then pops in and wiggles to rest once the coil has wrapped.
const wiggle: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    rotate: [0, -13, 9, -5, 2, 0],
    opacity: [0, 1],
    transition: {
      delay: 0.66,
      scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
      opacity: { duration: 0.18 },
      rotate: { duration: 0.52, ease: "easeOut", times: [0, 0.2, 0.42, 0.64, 0.82, 1] },
    },
  },
};

export const Asclepius7 = forwardRef<IconHandle, IconProps>(function Asclepius7(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = useId();
  const stickId = useId();

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={ASCLEPIUS_BODY} />
          <path d={ASCLEPIUS_HEAD} />
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
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-8} width={272} variants={reveal} />
          </clipPath>
          <clipPath id={stickId}>
            <rect x={STICK_BAND.x} y="0" width={STICK_BAND.w} height="256" />
          </clipPath>
        </defs>

        {/* The static rod — never animates. */}
        <path d={ASCLEPIUS_BODY} clipPath={`url(#${stickId})`} />
        {/* The coils, drawn up from the foot one segment at a time. */}
        <g clipPath={`url(#${clipId})`}>
          <motion.path variants={wind} style={FOOT} d={ASCLEPIUS_BODY} />
        </g>
        {/* The head lands last, then wiggles. */}
        <motion.path variants={wiggle} style={HEAD} d={ASCLEPIUS_HEAD} />
      </motion.svg>
    </div>
  );
});
