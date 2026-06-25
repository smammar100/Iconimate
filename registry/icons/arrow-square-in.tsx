"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TUCK — the arrow tucks down into the bottom-left corner (shrink + slide, anchored at
// the tip so it collapses *into* the corner) and pops back, while the window flashes a
// highlight a beat later. Principles: ANTICIPATION (the small pre-lift), SQUASH (the
// collapse to 0.5), FOLLOW-THROUGH (the 1.05 overshoot back to rest), SECONDARY ACTION
// + STAGING (the window's delayed flash). Two exact Phosphor sub-paths (window frame +
// inner arrow), animated whole so the artwork is pixel-identical.
const FRAME =
  "M208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z";
const ARROW =
  "M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136Z";

// Anchor at the arrowhead tip (bottom-left corner) so the shrink collapses into the corner.
const TIP = { transformBox: "view-box" as const, originX: 38 / 256, originY: 218 / 256 };

const tuck: Variants = {
  normal: { scale: 1, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 0.5, 1.05, 1],
    x: [0, 2, -6, 1, 0],
    y: [0, -2, 6, -1, 0],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.18, 0.5, 0.78, 1] },
  },
};
// The window flashes a highlight one stagger step after the arrow tucks (secondary action).
const frameFlash: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [1, 0.5, 1], transition: { duration: 0.5, ease: "easeInOut", delay: staged(1, 0.06) } },
};

export const ArrowSquareInIcon = forwardRef<IconHandle, IconProps>(function ArrowSquareInIcon(
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
        <motion.path d={ARROW} variants={reduced ? undefined : tuck} style={TIP} />
      </motion.svg>
    </div>
  );
});
