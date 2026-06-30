"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, popIn, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WRITE — the card writes itself. The frame anticipation-pops open, then the three
// text lines spring-type in from their left edge (top → bottom) with a landing
// emphasis, while a blinking caret rides down the page dropping onto each line as it
// fills, then blinks out. The glyph is the exact Phosphor `article`, split into a
// frame + three lines so the parts can be choreographed; at rest they recombine
// pixel-identical to the source.
const FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";
const LINES = [
  "M184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Z",
  "M184,128a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Z",
  "M184,160a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z",
];
const LEFT = 80 / 256; // anchor each line's type-in wipe at its left edge (x=80)

const frame: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 1], ...popIn({ peak: 1.06, duration: DUR.base }) },
};
const type = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    scaleY: [0.7, 1.18, 1], // landing emphasis as the line snaps to width
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: 0.18 + staged(i, 0.13) },
  },
});
const caret: Variants = {
  normal: { opacity: 0, transition: { duration: DUR.fast } },
  animate: {
    y: [88, 88, 120, 152, 152],
    opacity: [0, 1, 1, 1, 0],
    transition: { duration: 0.95, ease: "easeInOut", times: [0, 0.14, 0.5, 0.82, 1] },
  },
};

export const ArticleIcon = forwardRef<IconHandle, IconProps>(function ArticleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const center = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
        <motion.path variants={reduced ? undefined : frame} style={center} d={FRAME} />
        {LINES.map((d, i) => (
          <motion.path
            key={i}
            variants={reduced ? undefined : type(i)}
            style={{ transformBox: "view-box", originX: LEFT, originY: 0.5 }}
            d={d}
          />
        ))}
        {!reduced && (
          <motion.rect
            x={66}
            y={88}
            width={9}
            height={16}
            rx={4}
            variants={caret}
            style={{ transformBox: "view-box" }}
          />
        )}
      </motion.svg>
    </div>
  );
});
