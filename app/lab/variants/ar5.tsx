"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, popIn, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_FRAME, ARTICLE_LINES } from "../article-icon";

// v5 — WRITE. Everything from v4, plus the thing that sells it: a blinking caret
// that rides down the card, dropping to each line just as it types in, then blinks
// out when the page is full. Frame anticipation-pops, lines spring-type from the
// left with a landing emphasis (secondary action), caret ties it into a single act
// of writing. This is the keeper.
const LEFT = 80 / 256;

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
// The caret: fade in at the top line, step down to each line as it fills, blink out.
const caret: Variants = {
  normal: { opacity: 0, transition: { duration: DUR.fast } },
  animate: {
    y: [88, 88, 120, 152, 152],
    opacity: [0, 1, 1, 1, 0],
    transition: { duration: 0.95, ease: "easeInOut", times: [0, 0.14, 0.5, 0.82, 1] },
  },
};

export const Article5 = forwardRef<IconHandle, IconProps>(function Article5(
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
        <motion.path variants={reduced ? undefined : frame} style={center} d={ARTICLE_FRAME} />
        {ARTICLE_LINES.map((d, i) => (
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
