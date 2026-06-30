"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, popIn, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_MEDIUM_M, ARTICLE_MEDIUM_LINES } from "../article-medium-icon";

// v4 — STAGE. The drop-cap earns its size: it winds up (anticipation dip) and pops
// past its rest scale before settling, anchored on its own center. The lines start
// typing in before the M finishes (overlapping action), so the whole thing reads as
// one connected gesture — the masthead lands and the column fills in its wake.
const M_CENTER = { transformBox: "view-box" as const, originX: 80 / 256, originY: 96 / 256 };

const cap: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 1], ...popIn({ peak: 1.08, duration: DUR.base }) },
};
const type = (i: number): Variants => ({
  normal: { scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: 0.16 + staged(i, 0.1) },
  },
});

export const ArticleMedium4 = forwardRef<IconHandle, IconProps>(function ArticleMedium4(
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
      </motion.svg>
    </div>
  );
});
