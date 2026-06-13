"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Folds forward on its top edge with real perspective, then rocks back to flat (diminishing amplitude).
const fold: Variants = {
  normal: { rotateX: 0, transformPerspective: 500, transition: RETURN_TRANSITION },
  animate: {
    rotateX: [0, -52, 28, -12, 0],
    transformPerspective: 500,
    transition: { duration: 0.85, ease: "easeInOut" },
  },
};

export const BookmarkIcon = forwardRef<IconHandle, IconProps>(function BookmarkIcon(
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
        fill="none"
        stroke="currentColor"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path
          variants={reduced ? undefined : fold}
          style={{ transformBox: "view-box", transformOrigin: "128px 44px" }}
          d="M72 32h112a16 16 0 0 1 16 16v176l-72-44-72 44V48a16 16 0 0 1 16-16Z"
        />
      </motion.svg>
    </div>
  );
});
