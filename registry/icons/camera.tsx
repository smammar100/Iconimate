"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// One-shot "snap": the lens aperture cinches shut then springs wide before settling,
// while a flash dot pops bright at the body's corner — the exact beat of taking a photo.
const lens: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.82, 1.14, 1],
    transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.35, 0.7, 1] },
  },
};

const flash: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1, 0],
    transition: { duration: 0.4, ease: "easeOut", times: [0, 0.4, 1] },
  },
};

export const CameraIcon = forwardRef<IconHandle, IconProps>(function CameraIcon(
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
        {/* Static camera body + viewfinder hump — the shell the lens lives in. */}
        <path d="M36 100a16 16 0 0 1 16-16h26l13-22h74l13 22h26a16 16 0 0 1 16 16v88a16 16 0 0 1-16 16H52a16 16 0 0 1-16-16Z" />
        {/* The lens pulses its aperture from the glass center. */}
        <motion.circle
          variants={reduced ? undefined : lens}
          style={{ transformBox: "view-box", transformOrigin: "128px 140px" }}
          cx="128"
          cy="140"
          r="34"
        />
        {/* Flash dot at the upper corner blinks on the snap. */}
        <motion.circle
          variants={reduced ? undefined : flash}
          cx="194"
          cy="116"
          r="2"
        />
      </motion.svg>
    </div>
  );
});
