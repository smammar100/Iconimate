"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { SWEEP, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// A STATE icon: while hovered the corona turns continuously and the core breathes.
//
// Both tracks are ambient, so `repeat` is gated on `ambient` from useHover(), threaded in as
// motion's `custom`. Under reduced motion each plays exactly once. Note the corona's single
// pass is a full 9s revolution — long for a one-shot preview; worth shortening if the
// reduced tier is ever tuned properly rather than derived.
const corona: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    rotate: 360,
    transition: { duration: 9, ease: "linear", repeat: ambient ? Infinity : 0 },
  }),
};

const core: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    scale: [1, 1.08, 1],
    transition: { duration: 1.6, ease: SWEEP, repeat: ambient ? Infinity : 0, repeatType: "loop" },
  }),
};

export const SunIcon = forwardRef<IconHandle, IconProps>(function SunIcon(
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
        <motion.circle
          variants={reduced ? undefined : core}
          custom={ambient}
          style={{ transformBox: "view-box", transformOrigin: "128px 128px" }}
          cx="128"
          cy="128"
          r="44"
        />
        <motion.g
          variants={reduced ? undefined : corona}
          custom={ambient}
          style={{ transformBox: "view-box", transformOrigin: "128px 128px" }}
        >
          <path d="M128 66V40M128 216v-26M190 128h26M40 128h26M172 84l18-18M66 190l18-18M172 172l18 18M66 66l18 18" />
        </motion.g>
      </motion.svg>
    </div>
  );
});
