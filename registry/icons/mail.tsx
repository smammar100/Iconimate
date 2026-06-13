"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// The flap folds open on its top hinge with real perspective, then rocks back shut (diminishing amplitude).
// Body is static; only the crease tips out and away on the top edge, so it reads as an envelope being opened.
const flap: Variants = {
  normal: { rotateX: 0, transformPerspective: 500, transition: RETURN_TRANSITION },
  animate: {
    rotateX: [0, -52, 26, -11, 0],
    transformPerspective: 500,
    transition: { duration: 0.85, ease: "easeInOut" },
  },
};

export const MailIcon = forwardRef<IconHandle, IconProps>(function MailIcon(
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
        {/* Static envelope body — rounded rectangle. */}
        <path d="M40 88a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16v96a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16Z" />
        {/* Flap crease — seated on the body's top corners, hinges open on the top edge at (128, 72). */}
        <motion.path
          variants={reduced ? undefined : flap}
          style={{ transformBox: "view-box", transformOrigin: "128px 72px" }}
          d="M56 80 128 132 200 80"
        />
      </motion.svg>
    </div>
  );
});
