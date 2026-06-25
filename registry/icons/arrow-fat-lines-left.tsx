"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the right edge, the fat arrow coils then elongates leftward,
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at scaleX ≈ 1.077 before the tip crosses x=0; the peak
// lands the tip right at that edge. The exact Phosphor arrow-fat-lines-left, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "M152,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h24a8,8,0,0,0,8-8V80A8,8,0,0,0,152,72Zm-8,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h24Zm80-88v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm-32,0v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z";
// Anchor the glyph's right edge so it stays put while the body elongates leftward.
const ANCHOR = { transformBox: "view-box" as const, originX: 224 / 256, originY: 0.5 };

const plunge: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → coil (anticipation) → plunge left (peak 1.07, tip at the edge) → recoil → settle
    scaleX: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};

export const ArrowFatLinesLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowFatLinesLeftIcon(
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
