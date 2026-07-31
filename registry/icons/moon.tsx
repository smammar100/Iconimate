"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// STATE icon: while hovered the crescent rocks gently on its cusp while a small
// sparkle off its open edge twinkles in and out — a slow, restful night loop.
// Both tracks are ambient — `repeat` is gated on `ambient` from useHover(), threaded in as
// motion's `custom`. A reduced-motion visitor still gets one rock and one twinkle, then rest.
const crescent: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    rotate: [0, -7, 7, 0],
    transition: { duration: 3.6, ease: "easeInOut", repeat: ambient ? Infinity : 0, repeatType: "loop" },
  }),
};

const sparkle: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    scale: [0.6, 1, 0.6],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 2, ease: "easeInOut", repeat: ambient ? Infinity : 0, repeatType: "loop" },
  }),
};

export const MoonIcon = forwardRef<IconHandle, IconProps>(function MoonIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, ambient, start, stop, bind } = useHover();
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
          variants={reduced ? undefined : crescent}
          custom={ambient}
          style={{ transformBox: "view-box", transformOrigin: "112px 144px" }}
          d="M112 51A80 80 0 1 1 208 154A78 78 0 0 0 112 51Z"
        />
        <motion.g
          variants={reduced ? undefined : sparkle}
          custom={ambient}
          style={{ transformBox: "view-box", transformOrigin: "192px 72px" }}
        >
          <path d="M192 54V90" />
          <path d="M174 72H210" />
        </motion.g>
      </motion.svg>
    </div>
  );
});
