"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN, RETURN_TRANSITION, SWEEP, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_FRAME, ARTICLE_LINES } from "../article-icon";

// v3 — TYPE. The lines stop appearing and start being written: each pill grows
// from its left edge to full width, staggered top → bottom, so the glyph reads as
// text being typed into the card. The metaphor finally matches the noun.
const LEFT = 80 / 256; // anchor the wipe at the lines' left edge (x=80 in the viewBox)

const frame: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 1], transition: { duration: DUR.fast, ease: RETURN } },
};
const type = (i: number): Variants => ({
  normal: { scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: SWEEP, delay: DUR.fast + staged(i, 0.12) },
  },
});

export const Article3 = forwardRef<IconHandle, IconProps>(function Article3(
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
        <motion.path variants={reduced ? undefined : frame} d={ARTICLE_FRAME} />
        {ARTICLE_LINES.map((d, i) => (
          <motion.path
            key={i}
            variants={reduced ? undefined : type(i)}
            style={{ transformBox: "view-box", originX: LEFT, originY: 0.5 }}
            d={d}
          />
        ))}
      </motion.svg>
    </div>
  );
});
