"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_FRAME, ARTICLE_LINES } from "../article-icon";

// v2 — CASCADE. Now the parts are separated: the frame fades up first, then the
// three text lines drop into place one after another, top → bottom. Staging gives
// the glyph an order of operations — page, then content — instead of one blob.
const frame: Variants = {
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

export const Article2 = forwardRef<IconHandle, IconProps>(function Article2(
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
        <motion.path variants={reduced ? undefined : frame} d={ARTICLE_FRAME} />
        {ARTICLE_LINES.map((d, i) => (
          <motion.path key={i} variants={reduced ? undefined : line(i)} style={origin} d={d} />
        ))}
      </motion.svg>
    </div>
  );
});
