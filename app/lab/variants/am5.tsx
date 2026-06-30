"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_MEDIUM_M, ARTICLE_MEDIUM_LINES } from "../article-medium-icon";

// v5 — PUBLISH. The drop-cap lands like an ink-stamp: it winds up, overshoots its
// size and tilts in, then rocks back to true (anticipation + exaggeration + settle).
// The four lines spring-type from their left edges with a landing emphasis, and a
// blinking caret rides down the column — dropping to each line as it fills, jumping
// to the left margin for the full-width paragraphs — then blinks out. The keeper.
const M_CENTER = { transformBox: "view-box" as const, originX: 80 / 256, originY: 96 / 256 };

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
    scaleY: [0.7, 1.18, 1], // landing emphasis as the line snaps to width
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: 0.2 + staged(i, 0.12) },
  },
});
// Caret: fade in, step down each line in reading order (right column → left margin),
// blink out when the column is full.
const caret: Variants = {
  normal: { opacity: 0, transition: { duration: DUR.fast } },
  animate: {
    x: [152, 152, 152, 64, 64],
    y: [96, 96, 128, 160, 192],
    opacity: [0, 1, 1, 1, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.16, 0.45, 0.74, 1] },
  },
};

export const ArticleMedium5 = forwardRef<IconHandle, IconProps>(function ArticleMedium5(
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
        <motion.path variants={reduced ? undefined : cap} style={M_CENTER} d={ARTICLE_MEDIUM_M} />
        {ARTICLE_MEDIUM_LINES.map((l, i) => (
          <motion.path
            key={i}
            variants={reduced ? undefined : type(i)}
            style={{ transformBox: "view-box", originX: l.left / 256, originY: l.cy / 256 }}
            d={l.d}
          />
        ))}
        {!reduced && (
          <motion.rect
            x={0}
            y={0}
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
