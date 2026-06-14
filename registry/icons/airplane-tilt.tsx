"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BANK — wing-rock with a float: the banked craft rolls a little one way then the
// other, easing into a lazy turn, while also bobbing up and down on the air. Roll
// and float run on different periods so they drift in and out of phase, for an
// organic, untethered feel. Filled Phosphor airplane-tilt glyph (currentColor).
const PLANE =
  "M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z";

const bank: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 11, -11, 0],
    y: [0, -7, 0, 5, 0],
    transition: {
      rotate: { duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
      y: { duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
    },
  },
};

export const AirplaneTiltIcon = forwardRef<IconHandle, IconProps>(function AirplaneTiltIcon(
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
        <motion.path
          variants={reduced ? undefined : bank}
          style={{ transformBox: "view-box", originX: 0.484, originY: 0.516 }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
