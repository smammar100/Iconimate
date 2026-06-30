"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, springPop } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ARTICLE_MEDIUM } from "../article-medium-icon";

// v1 — SNAP. The whole glyph springs in from slightly small + soft. One path, so
// it's exactly Phosphor — but the drop-cap and the body text move as one blob, so
// nothing reads as "a Medium article".
const snap: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0.7, 1], opacity: [0.4, 1], transition: springPop },
};

export const ArticleMedium1 = forwardRef<IconHandle, IconProps>(function ArticleMedium1(
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
        <motion.path variants={reduced ? undefined : snap} style={origin} d={ARTICLE_MEDIUM} />
      </motion.svg>
    </div>
  );
});
