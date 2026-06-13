"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// The shell rocks; the ringer swings wider and in opposition — that contrast reads as "ringing".
// Diminishing-amplitude keyframes carry the decay, so this is a tween (springs cap at 2 keyframes).
const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 12, -9, 5, -2, 0], transition: { duration: 0.9, ease: "easeInOut" } },
};

const ringer: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -18, 14, -8, 3, 0], transition: { duration: 0.9, ease: "easeInOut" } },
};

export const BellIcon = forwardRef<IconHandle, IconProps>(function BellIcon(
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
        {/* whole bell hangs and swings from the crown at (128, 40) */}
        <motion.path
          variants={reduced ? undefined : shell}
          style={{ transformBox: "view-box", transformOrigin: "128px 40px" }}
          d="M64 104a64 64 0 0 1 128 0c0 56 24 72 24 72H40s24-16 24-72"
        />
        <motion.path
          variants={reduced ? undefined : ringer}
          style={{ transformBox: "view-box", transformOrigin: "128px 40px" }}
          d="M110 204a20 20 0 0 0 36 0"
        />
      </motion.svg>
    </div>
  );
});
