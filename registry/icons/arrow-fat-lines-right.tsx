"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the left edge, the fat arrow coils then elongates rightward,
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at scaleX ≈ 1.077 before the tip crosses x=256; the peak
// lands the tip right at that edge. The exact Phosphor arrow-fat-lines-right, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H104a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8h24v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H112V88h24a8,8,0,0,0,8-8V51.31L220.69,128ZM48,80v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm32,0v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z";
// Anchor the glyph's left edge so it stays put while the body elongates rightward.
const ANCHOR = { transformBox: "view-box" as const, originX: 32 / 256, originY: 0.5 };

const plunge: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → coil (anticipation) → plunge right (peak 1.07, tip at the edge) → recoil → settle
    scaleX: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};

export const ArrowFatLinesRightIcon = forwardRef<IconHandle, IconProps>(function ArrowFatLinesRightIcon(
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
        <motion.path d={ARROW} variants={reduced ? undefined : plunge} style={ANCHOR} />
      </motion.svg>
    </div>
  );
});
