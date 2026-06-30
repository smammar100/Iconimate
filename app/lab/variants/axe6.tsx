"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE } from "../axe-icon";

// v6 — CHOP LOOP (replica of axe.mp4). Measured from the video frame by frame: a 2s
// loop that rests at the Phosphor pose, winds back ~18.6°, drives a fast chop ~23°
// past rest into impact, holds, then recovers — pivoting on the grip (76,181). At the
// peak of the swing, teal speed-trail arcs flash in the upper-left, concentric around
// the pivot at the blade's radius (the same cyan as the video, #2BC4C4).
//
// Keeping it in bounds: the swing's union bounding box is ~(-48,-32)→(305,289),
// centred on the canvas. Rather than wrap everything in a scaling <g> (which would sit
// between the motion.svg and the animated children and break variant propagation), we
// just widen the viewBox to "-60 -60 377 377" so that whole union renders inside the
// icon's box — the swing never leaves the frame.
const TEAL = "#2BC4C4";
const VIEW_BOX = "-60 -60 377 377";
// Pivot at the grip (76,181). With transform-box: view-box, origin lengths are measured
// from the view-box's top-left (-60,-60), so (76,181) → "136px 241px".
const PIVOT = { transformBox: "view-box" as const, transformOrigin: "136px 241px" };

// Rotation curve (degrees of delta from the rest pose), sampled from the video.
const chop: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, 0, -18.6, -18.3, -1.5, 22.5, 22.8, 0.3, 0],
    transition: {
      duration: 2,
      times: [0, 0.065, 0.27, 0.3, 0.4, 0.5, 0.58, 0.85, 1],
      ease: ["linear", "easeInOut", "linear", "easeIn", "easeOut", "linear", "easeInOut", "linear"],
      repeat: Infinity,
    },
  },
};
// Speed trails — hidden, then a quick teal flash at the peak of the chop.
const speed: Variants = {
  normal: { opacity: 0, transition: { duration: 0.18 } },
  animate: {
    opacity: [0, 0, 1, 0, 0],
    transition: { duration: 2, times: [0, 0.4, 0.5, 0.62, 1], ease: "easeOut", repeat: Infinity },
  },
};

export const Axe6 = forwardRef<IconHandle, IconProps>(function Axe6({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={VIEW_BOX} fill="currentColor">
          <path d={AXE} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={VIEW_BOX}
        fill="currentColor"
        initial="normal"
        animate={controls}
      >
        {/* Teal speed-trail arcs, concentric around the grip pivot at the blade radius. */}
        <motion.g variants={speed} stroke={TEAL} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M45.2,36.2 A148,148 0 0 1 140.9,48" />
          <path d="M39,67 A120,120 0 0 1 113,67" />
          <path d="M35.7,98.3 A92,92 0 0 1 85.6,89.5" />
        </motion.g>
        {/* The axe, swinging about the grip. */}
        <motion.g variants={chop} style={PIVOT}>
          <path d={AXE} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
