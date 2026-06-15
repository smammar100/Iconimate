"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BASELINE, BLOCK_LEFT, BLOCK_RIGHT, BLOCKS_BASE } from "../align-bottom-icon";

// DROP — on hover the two blocks fall in from above the tile, hit the baseline and
// bounce back UP with diminishing hops before coming to rest, the right one a beat
// behind the left. Every keyframe is <= 0 (the rest line), so the blocks rebound off
// the base and never dip below it — a spring would overshoot past the line, which we
// don't want here. Bottoms stay aligned throughout; the baseline holds still.
const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
// Fall from above (-190) to the line (0), rebound up to -34, fall, up to -12, fall,
// up to -4, settle. Apexes shrink like a ball losing energy.
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
const dropLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: FALL_BOUNCE },
};
const dropRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: { ...FALL_BOUNCE, delay: 0.1 } },
};

export const AlignV1 = forwardRef<IconHandle, IconProps>(function AlignV1(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY: BLOCKS_BASE };
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
        <motion.path variants={reduced ? undefined : dropLeft} style={origin} d={BLOCK_LEFT} />
        <motion.path variants={reduced ? undefined : dropRight} style={origin} d={BLOCK_RIGHT} />
      </motion.svg>
    </div>
  );
});
