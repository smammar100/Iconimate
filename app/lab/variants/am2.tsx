"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_MEDIUM_M, ARTICLE_MEDIUM_LINES } from "../article-medium-icon";

// v2 — CASCADE. The parts separate: the drop-cap fades up first, then the four text
// lines drop into place in reading order. Staging gives an order of operations —
// masthead, then copy — instead of one undifferentiated shape.
const cap: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 1], transition: { duration: DUR.fast, ease: RETURN } },
};
const line = (i: number): Variants => ({
  normal: { opacity: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1],
    y: [-6, 0],
    transition: { duration: DUR.base, ease: RETURN, delay: DUR.fast + staged(i) },
  },
});

export const ArticleMedium2 = forwardRef<IconHandle, IconProps>(function ArticleMedium2(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
        <motion.path variants={reduced ? undefined : cap} d={ARTICLE_MEDIUM_M} />
        {ARTICLE_MEDIUM_LINES.map((l, i) => (
          <motion.path key={i} variants={reduced ? undefined : line(i)} style={origin} d={l.d} />
        ))}
      </motion.svg>
    </div>
  );
});
