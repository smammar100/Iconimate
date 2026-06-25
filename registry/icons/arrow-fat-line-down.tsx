"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { PLUNGE_KEYS, PLUNGE_TRANSITION, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the top edge, the fat arrow coils then elongates downward,
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at scaleY ≈ 1.077 before the tip crosses y=256; the peak
// lands the tip right at that edge. The exact Phosphor arrow-fat-line-down, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "M231.39,132.94A8,8,0,0,0,224,128H184V72a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v56H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V80h80v56a8,8,0,0,0,8,8h28.69ZM72,40a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,40Z";
// Anchor the glyph's top edge so it stays put while the body elongates downward.
const ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 32 / 256 };

const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Squash & stretch + anticipation + follow-through: coil → plunge (tip-leading,
    // capped at the edge) → recoil → settle. Shared plunge signature; tail-anchored.
    scaleY: [...PLUNGE_KEYS],
    transition: PLUNGE_TRANSITION,
  },
};

export const ArrowFatLineDownIcon = forwardRef<IconHandle, IconProps>(function ArrowFatLineDownIcon(
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
