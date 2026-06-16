"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants, type Transition } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP — on hover only the block falls in from above, hits its rest line and rebounds
// UP with diminishing hops before settling. Every keyframe is <= 0 (the rest line) so
// it bounces off the floor and never dips below. The center guide axis holds
// perfectly still and is drawn as one continuous line (it shows through the block's
// hollow centre), so it never reads as a dotted/broken stub.
const AXIS = "M200,120a8,8,0,0,1,0,16H56a8,8,0,0,1,0-16Z";
const BLOCK =
  "M96,32H160a16,16,0,0,1,16,16V208a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16V48A16,16,0,0,1,96,32ZM96,48V208h64V48Z";

const FALL_BOUNCE: Transition = {
  duration: 0.95,
  times: [0, 0.42, 0.56, 0.68, 0.78, 0.86, 0.93, 1],
  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
};
const BOUNCE_Y = [-190, 0, -34, 0, -12, 0, -4, 0];
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: BOUNCE_Y, transition: FALL_BOUNCE },
};

export const AlignCenterVerticalSimpleIcon = forwardRef<IconHandle, IconProps>(
  function AlignCenterVerticalSimpleIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path variants={reduced ? undefined : drop} d={BLOCK} />
        </motion.svg>
      </div>
    );
  },
);
