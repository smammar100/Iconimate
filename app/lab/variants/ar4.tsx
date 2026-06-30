"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, popIn, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_FRAME, ARTICLE_LINES } from "../article-icon";

// v4 — STAGE. The card now has weight. The frame winds up (anticipation dip) and
// pops past its size before settling, and only once it's open do the lines type in
// — they start before the frame finishes (overlapping action), so the whole thing
// feels like one connected gesture rather than a checklist of steps.
const LEFT = 80 / 256;

const frame: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 1], ...popIn({ peak: 1.06, duration: DUR.base }) },
};
const type = (i: number): Variants => ({
  normal: { scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: 0.16 + staged(i, 0.11) },
  },
});

export const Article4 = forwardRef<IconHandle, IconProps>(function Article4(
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
      </motion.svg>
    </div>
  );
});
