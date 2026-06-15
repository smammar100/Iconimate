"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover the block falls in from above, hits the baseline and bounces back
// UP with diminishing hops before coming to rest. Every keyframe is <= 0 (the rest
// line), so it rebounds off the base and never dips below it. The bottom stays on the
// line throughout; the baseline holds still. Filled Phosphor align-bottom-simple
// glyph (currentColor) — artwork unchanged.
const BASELINE = "M208,232a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,232Z";
const BLOCK =
  "M80,192V40A16,16,0,0,1,96,24h64a16,16,0,0,1,16,16V192a16,16,0,0,1-16,16H96A16,16,0,0,1,80,192ZM96,192h64V40H96Z";

// Origin at the block's bottom edge (y≈208/256) so nothing leaves the line.
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.8125 };

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fall from above (-210) to the line (0), rebound up to -34, fall, up to -12, fall,
// up to -4, settle. Apexes shrink like a ball losing energy.
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [-210, 0, -34, 0, -12, 0, -4, 0], transition: FALL_BOUNCE },
};

export const AlignBottomSimpleIcon = forwardRef<IconHandle, IconProps>(function AlignBottomSimpleIcon(
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
        <path d={BASELINE} />
        <motion.path variants={reduced ? undefined : drop} style={ORIGIN} d={BLOCK} />
      </motion.svg>
    </div>
  );
});
