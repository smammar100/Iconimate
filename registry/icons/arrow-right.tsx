"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { SWEEP, RETURN_TRANSITION } from "@/lib/motion-tokens";
import { bankStreak } from "@/hooks/variants/bank-streak";
import type { IconHandle, IconProps } from "@/lib/icon";

// The arrow shoots off the right edge (clipped by the overflow:hidden shell), teleports back
// behind the left edge, and slides home — a continuous "send" that exploits the escape mask.
const send: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 150, -150, 0],
    transition: {
      duration: 0.95,
      times: [0, 0.42, 0.4202, 1],
      ease: SWEEP,
      repeat: Infinity,
      repeatDelay: 0.3,
    },
  },
};

const STREAKS = [104, 128, 152];

export const ArrowRightIcon = forwardRef<IconHandle, IconProps>(function ArrowRightIcon(
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
        {/* atmospheric speed-lines on the accent color, behind the subject */}
        {!reduced &&
          STREAKS.map((y, i) => (
            <motion.line
              key={y}
              custom={i}
              variants={bankStreak}
              x1={26}
              y1={y}
              x2={66}
              y2={y}
              stroke="var(--icon-accent)"
              strokeWidth={14}
            />
          ))}
        <motion.g variants={reduced ? undefined : send}>
          <path d="M40 128h150M150 80l52 48-52 48" />
        </motion.g>
      </motion.svg>
    </div>
  );
});
