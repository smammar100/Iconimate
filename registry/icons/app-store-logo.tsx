"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW — the logo traces its own outline on while the fill rises in behind it, then
// settles. At rest the stroke is hidden so the filled glyph reads cleanly.
// Phosphor "app-store-logo" glyph (currentColor) — kept whole; the outline overlay
// is the same path with no fill.
const LOGO =
  "M64.34,196.07l-9.45,16a8,8,0,1,1-13.78-8.14l9.46-16a8,8,0,1,1,13.77,8.14ZM232,152H184.2l-30.73-52a8,8,0,1,0-13.77,8.14l61.41,103.93a8,8,0,0,0,13.78-8.14L193.66,168H232a8,8,0,0,0,0-16Zm-89.53,0H90.38L158.89,36.07a8,8,0,0,0-13.78-8.14L128,56.89l-17.11-29a8,8,0,1,0-13.78,8.14l21.6,36.55L71.8,152H24a8,8,0,0,0,0,16H142.47a8,8,0,1,0,0-16Z";

const DRAW_DUR = 0.875;

// The fill rises in over the back half of the draw.
const fillReveal: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1],
    transition: { duration: DRAW_DUR, ease: "easeIn", times: [0, 0.5, 1] },
  },
};

// The outline traces on, then fades as the fill takes over. Hidden at rest.
const trace: Variants = {
  normal: { pathLength: 1, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [1, 1, 0],
    transition: { duration: DRAW_DUR, ease: SWEEP, times: [0, 0.85, 1] },
  },
};

export const AppStoreLogoIcon = forwardRef<IconHandle, IconProps>(function AppStoreLogoIcon(
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
        <motion.path d={LOGO} variants={reduced ? undefined : fillReveal} />
        <motion.path
          d={LOGO}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          variants={reduced ? undefined : trace}
        />
      </motion.svg>
    </div>
  );
});
