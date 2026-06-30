"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PUBLISH — the same masthead gesture as article-medium, on the serif "T" drop-cap.
// The cap lands like an ink-stamp (anticipation wind-up → overshoot → tilt → rock to
// true); the four text lines spring-type from their own left edges with a landing
// emphasis; a blinking caret rides down the column, dropping to each line as it fills
// and jumping to the left margin for the full-width paragraphs, then blinks out. The
// glyph is the exact Phosphor `article-ny-times`, split into the T + four lines so the
// parts can be choreographed; at rest they recombine pixel-identical.
const T =
  "M96,144a8,8,0,0,0,0-16H88V64h32v8a8,8,0,0,0,16,0V56a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V72a8,8,0,0,0,16,0V64H72v64H64a8,8,0,0,0,0,16Z";
const LINES = [
  { d: "M128,96H232a8,8,0,0,1,0,16H128a8,8,0,0,1,0-16Z", left: 128, cy: 104 },
  { d: "M232,128H128a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z", left: 128, cy: 136 },
  { d: "M232,160H80a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z", left: 80, cy: 168 },
  { d: "M232,192H80a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z", left: 80, cy: 200 },
];
const CAP_CENTER = { transformBox: "view-box" as const, originX: 80 / 256, originY: 96 / 256 };

const cap: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1, 1, 1],
    scale: [0.86, 0.92, 1.08, 1],
    rotate: [-8, 3, -1, 0],
    transition: { duration: DUR.slow, ease: ARRIVE, times: [0, 0.3, 0.62, 1] },
  },
};
const type = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    scaleY: [0.7, 1.18, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: 0.2 + staged(i, 0.12) },
  },
});
// Caret stops: short lines begin at x128 (caret ≈112), full lines at the left margin (x80, caret ≈64).
const caret: Variants = {
  normal: { opacity: 0, transition: { duration: DUR.fast } },
  animate: {
    x: [112, 112, 112, 64, 64],
    y: [96, 96, 128, 160, 192],
    opacity: [0, 1, 1, 1, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.16, 0.45, 0.74, 1] },
  },
};

export const ArticleNyTimesIcon = forwardRef<IconHandle, IconProps>(function ArticleNyTimesIcon(
  { size = 28, style, ...props },
  ref,
) {
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
      >
        <motion.path variants={reduced ? undefined : cap} style={CAP_CENTER} d={T} />
        {LINES.map((l, i) => (
          <motion.path
            key={i}
            variants={reduced ? undefined : type(i)}
            style={{ transformBox: "view-box", originX: l.left / 256, originY: l.cy / 256 }}
            d={l.d}
          />
        ))}
        {!reduced && (
          <motion.rect x={0} y={0} width={9} height={16} rx={4} variants={caret} style={{ transformBox: "view-box" }} />
        )}
      </motion.svg>
    </div>
  );
});
