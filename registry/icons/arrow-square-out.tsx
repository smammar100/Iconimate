"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TUCK OUT — the mirror of arrow-square-in: instead of collapsing into the corner, the
// arrow pushes *out* toward the top-right corner. Anchored at the tail (the window-side
// end), it dips back toward the window (anticipation), then thrusts out and stretches
// past rest before settling, while the window flashes a highlight a beat later.
// Principles: ANTICIPATION (the pull-in dip), SQUASH & STRETCH (0.9 → 1.12 along the
// diagonal), FOLLOW-THROUGH (the recoil to rest), SECONDARY ACTION + STAGING (the
// delayed window flash). Two exact Phosphor sub-paths, animated whole — artwork frozen.
const FRAME =
  "M184,128a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z";
const ARROW =
  "M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Z";

// Anchor at the tail (window-side end of the arrow) so the stretch extends *outward*
// toward the top-right corner. Peak 1.12 + thrust keep the tip inside the frame.
const TAIL = { transformBox: "view-box" as const, originX: 130 / 256, originY: 126 / 256 };

const tuckOut: Variants = {
  normal: { scale: 1, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.12, 0.98, 1],
    x: [0, -4, 8, -2, 0],
    y: [0, 4, -8, 2, 0],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.18, 0.5, 0.78, 1] },
  },
};
// The window flashes a highlight one stagger step after the arrow thrusts out.
const frameFlash: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [1, 0.5, 1], transition: { duration: 0.5, ease: "easeInOut", delay: staged(1, 0.06) } },
};

export const ArrowSquareOutIcon = forwardRef<IconHandle, IconProps>(function ArrowSquareOutIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
        <motion.path d={FRAME} variants={reduced ? undefined : frameFlash} />
        <motion.path d={ARROW} variants={reduced ? undefined : tuckOut} style={TAIL} />
      </motion.svg>
    </div>
  );
});
