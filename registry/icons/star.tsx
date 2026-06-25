"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, popIn } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// One confident turn, paired with an anticipation dip and an overshoot pop — the
// scale arc comes straight from the shared `popIn()` (wind-up dip → peak → settle)
// so the twinkle speaks the set's dialect. Rotate runs alongside on its own tween.
const pop = popIn({ peak: 1.18, duration: 0.6 });
const twinkle: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 360],
    scale: pop.scale,
    transition: {
      rotate: { duration: 0.7, ease: ARRIVE },
      scale: pop.transition,
    },
  },
};

export const StarIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
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
          variants={reduced ? undefined : twinkle}
          style={{ transformBox: "view-box", transformOrigin: "128px 132px" }}
          d="M128 36 150 98 216 100 163 139 182 202 128 165 74 202 93 139 40 100 106 98 Z"
        />
      </motion.svg>
    </div>
  );
});
