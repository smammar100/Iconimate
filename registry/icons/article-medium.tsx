"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PUBLISH — the serif "M" drop-cap lands like an ink-stamp: it winds up, overshoots
// its size and tilts in, then rocks back to true (anticipation + exaggeration +
// settle). The four text lines spring-type from their own left edges with a landing
// emphasis, and a blinking caret rides down the column — dropping to each line as it
// fills, jumping to the left margin for the full-width paragraphs — then blinks out.
// The glyph is the exact Phosphor `article-medium`, split into the M + four lines so
// the parts can be choreographed; at rest they recombine pixel-identical.
const M =
  "M56,136a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16h8V64H24a8,8,0,0,1,0-16H40v0a8,8,0,0,1,6.78,3.74L80,104.91l33.22-53.15A8,8,0,0,1,120,48v0h16a8,8,0,0,1,0,16h-8v64h8a8,8,0,0,1,0,16H112a8,8,0,0,1,0-16V83.89L86.78,124.24a8,8,0,0,1-13.56,0L48,83.89V128A8,8,0,0,1,56,136Z";
const LINES = [
  { d: "M168,112h64a8,8,0,0,0,0-16H168a8,8,0,0,0,0,16Z", left: 168, cy: 104 },
  { d: "M232,128H168a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", left: 168, cy: 136 },
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
const caret: Variants = {
  normal: { opacity: 0, transition: { duration: DUR.fast } },
  animate: {
    x: [152, 152, 152, 64, 64],
    y: [96, 96, 128, 160, 192],
    opacity: [0, 1, 1, 1, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.16, 0.45, 0.74, 1] },
  },
};

export const ArticleMediumIcon = forwardRef<IconHandle, IconProps>(function ArticleMediumIcon(
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
        <motion.path variants={reduced ? undefined : cap} style={CAP_CENTER} d={M} />
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
