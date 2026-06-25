"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { PLUNGE_KEYS, PLUNGE_TRANSITION, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the right edge, the fat arrow coils then elongates leftward,
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at scaleX ≈ 1.077 before the tip crosses x=0; the peak
// lands the tip right at that edge. The exact Phosphor arrow-fat-left, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "M208,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h80a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72Zm0,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h88Z";
// Anchor the glyph's right edge so it stays put while the body elongates leftward.
const ANCHOR = { transformBox: "view-box" as const, originX: 224 / 256, originY: 0.5 };

const plunge: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Squash & stretch + anticipation + follow-through: coil → plunge (tip-leading,
    // capped at the edge) → recoil → settle. Shared plunge signature; tail-anchored.
    scaleX: [...PLUNGE_KEYS],
    transition: PLUNGE_TRANSITION,
  },
};

export const ArrowFatLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowFatLeftIcon(
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
