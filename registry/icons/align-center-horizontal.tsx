"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover only the two blocks fall in from above, hit their rest line and
// rebound UP with diminishing hops before settling, the wide bottom block a beat
// behind the narrow top one. Every keyframe is <= 0 (the rest line) so they bounce
// off the floor and never dip below. The center guide axis holds perfectly still and
// runs the full height behind the blocks. Each block is an outlined frame whose
// interior is filled with the card surface colour (var(--surface)) — opaque (the axis
// never bleeds through) and matching whatever card it sits in.
const AXIS = "M128,32a8,8,0,0,1,8,8V216a8,8,0,0,1-16,0V40A8,8,0,0,1,128,32Z";
const TOP_OUTER =
  "M72,48H184a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H72a16,16,0,0,1-16-16V64A16,16,0,0,1,72,48Z";
const TOP_INNER = "M72,64H184V104H72Z";
const BOTTOM_OUTER =
  "M48,136H208a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152A16,16,0,0,1,48,136Z";
const BOTTOM_INNER = "M48,152H208V192H48Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
const dropTop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: FALL_BOUNCE },
};
const dropBottom: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: { ...FALL_BOUNCE, delay: 0.1 } },
};

export const AlignCenterHorizontalIcon = forwardRef<IconHandle, IconProps>(
  function AlignCenterHorizontalIcon({ size = 28, style, ...props }, ref) {
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
          <path d={AXIS} />
          <motion.g variants={reduced ? undefined : dropTop}>
            <path d={TOP_OUTER} />
            <path d={TOP_INNER} fill="var(--surface)" />
          </motion.g>
          <motion.g variants={reduced ? undefined : dropBottom}>
            <path d={BOTTOM_OUTER} />
            <path d={BOTTOM_INNER} fill="var(--surface)" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
