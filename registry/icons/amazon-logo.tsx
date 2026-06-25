"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WOBBLE — a damped pivot bounce around the base of the "a", as if the smile-arrow
// gave the glyph a nudge: a quick over-rotation that settles through decreasing
// swings, then rests before the next burst.
// Filled Phosphor amazon-logo glyph (currentColor); the body pivots about its lower centre.
const AMAZON_LOGO =
  "M248,168v32a8,8,0,0,1-16,0V187.31l-2.21,2.22C226.69,192.9,189.44,232,128,232c-62.84,0-100.38-40.91-101.95-42.65A8,8,0,0,1,38,178.65C38.27,179,72.5,216,128,216s89.73-37,90.07-37.36a3.85,3.85,0,0,1,.27-.3l2.35-2.34H208a8,8,0,0,1,0-16h32A8,8,0,0,1,248,168ZM160,94.53V84A36,36,0,0,0,91.92,67.64a8,8,0,0,1-14.25-7.28A52,52,0,0,1,176,84v92a8,8,0,0,1-16,0v-6.53a52,52,0,1,1,0-74.94ZM160,132a36,36,0,1,0-36,36A36,36,0,0,0,160,132Z";

const AMAZON_PIVOT = { x: 0.5, y: 0.8 };

const wobble: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Anticipation (+3 counter-lean) winds up before the damped bounce decays back to rest.
    rotate: [0, 3, -9, 7, -4, 2, 0],
    transition: { duration: 0.85, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.45 },
  },
};

export const AmazonLogoIcon = forwardRef<IconHandle, IconProps>(function AmazonLogoIcon(
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
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path
          variants={reduced ? undefined : wobble}
          style={{ transformBox: "view-box", originX: AMAZON_PIVOT.x, originY: AMAZON_PIVOT.y }}
          d={AMAZON_LOGO}
        />
      </motion.svg>
    </div>
  );
});
