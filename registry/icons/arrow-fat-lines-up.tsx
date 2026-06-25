"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the bottom edge, the fat arrow coils then elongates upward,
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at scaleY ≈ 1.077 before the tip crosses y=0; the peak
// lands the tip right at that edge. The exact Phosphor arrow-fat-lines-up, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v24a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v24H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Zm0-32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,184Z";
// Anchor the glyph's bottom edge so it stays put while the body elongates upward.
const ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 224 / 256 };

const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → coil (anticipation) → plunge up (peak 1.07, tip at the edge) → recoil → settle
    scaleY: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};

export const ArrowFatLinesUpIcon = forwardRef<IconHandle, IconProps>(function ArrowFatLinesUpIcon(
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
