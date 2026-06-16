"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover only the two blocks fall in from above, hit their rest line and
// rebound UP with diminishing hops before settling, the short right block a beat
// behind the tall left one. Every keyframe is <= 0 (the rest line) so they bounce off
// the floor and never dip below. The center guide axis holds perfectly still and runs
// the full width behind the blocks. Each block is an outlined frame whose interior is
// filled with the card surface colour (var(--surface)) — opaque (the axis never
// bleeds through) and matching whatever card it sits in.
const AXIS = "M216,120a8,8,0,0,1,0,16H40a8,8,0,0,1,0-16Z";
const LEFT_OUTER =
  "M64,32H104a16,16,0,0,1,16,16V208a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V48A16,16,0,0,1,64,32Z";
const LEFT_INNER = "M64,48H104V208H64Z";
const RIGHT_OUTER =
  "M152,56H192a16,16,0,0,1,16,16V184a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V72A16,16,0,0,1,152,56Z";
const RIGHT_INNER = "M152,72H192V184H152Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
const dropLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: FALL_BOUNCE },
};
const dropRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: { ...FALL_BOUNCE, delay: 0.1 } },
};

export const AlignCenterVerticalIcon = forwardRef<IconHandle, IconProps>(
  function AlignCenterVerticalIcon({ size = 28, style, ...props }, ref) {
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
          <motion.g variants={reduced ? undefined : dropLeft}>
            <path d={LEFT_OUTER} />
            <path d={LEFT_INNER} fill="var(--surface)" />
          </motion.g>
          <motion.g variants={reduced ? undefined : dropRight}>
            <path d={RIGHT_OUTER} />
            <path d={RIGHT_INNER} fill="var(--surface)" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
