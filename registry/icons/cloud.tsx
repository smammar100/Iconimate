"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// STATE icon: the cloud drifts on a slow breeze — a wide lateral sway paired with a soft bob,
// looping while hovered. Calm and weightless, never bouncy; it glides home on hover-out.
const cloud: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 8, -8, 0],
    y: [0, -3, 0, 0],
    transition: { duration: 4.2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};

export const CloudIcon = forwardRef<IconHandle, IconProps>(function CloudIcon(
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
        fill="none"
        stroke="currentColor"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        {/* Rounded cloud: small left lobe, tall center crown, medium right lobe on a flat base. */}
        <motion.path
          variants={reduced ? undefined : cloud}
          style={{ transformBox: "view-box", transformOrigin: "128px 147px" }}
          d="M74 190a48 48 0 0 1-2-86 60 60 0 0 1 104-8 52 52 0 0 1 10 94Z"
        />
      </motion.svg>
    </div>
  );
});
