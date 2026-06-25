"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DEPARTURE — wheels up and gone: from rest the plane accelerates up its heading
// and climbs clean out of frame, shrinking and fading into the distance. The
// mirror of the landing arrival — here the plane leaves the bounding box. The
// wrapper uses overflow:visible so the climb-out is seen beyond the icon box.
// Filled Phosphor airplane-takeoff glyph (currentColor).
const PLANE =
  "M247.86,93.15a8,8,0,0,1-3.76,5.39l-147.41,88a40.18,40.18,0,0,1-20.26,5.52,39.78,39.78,0,0,1-27.28-10.87l-.12-.12L13,145.8a16,16,0,0,1,4.49-26.21l3-1.47a8,8,0,0,1,6.08-.4l28.26,9.54L75,115.06,53.17,93.87A16,16,0,0,1,57.7,67.4l.32-.13,7.15-2.71a8,8,0,0,1,5.59,0L124.7,84.38,176.27,53.6a39.82,39.82,0,0,1,51.28,9.12l.12.15,18.64,23.89A8,8,0,0,1,247.86,93.15ZM228.12,89.45l-13-16.67a23.88,23.88,0,0,0-30.68-5.42l-54.8,32.72a8.06,8.06,0,0,1-6.87.64L68,80.58l-4,1.53.21.2L93.57,110.8a8,8,0,0,1-1.43,12.58L59.93,142.87a8,8,0,0,1-6.7.73l-28.67-9.67-.19.1-.37.17a.71.71,0,0,1,.13.12l36,35.26a23.85,23.85,0,0,0,28.42,3.18Z";
const RUNWAY = "M176,216a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16H168A8,8,0,0,1,176,216Z";

const departure: Variants = {
  normal: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    // Anticipation: a brief crouch (rock back & nose-down) before the plane lunges up
    // its heading and climbs clean out of frame, shrinking and fading into the distance.
    x: [0, -10, 230],
    y: [0, 4, -160],
    rotate: [0, 3, -5],
    scale: [1, 0.97, 0.78],
    opacity: [1, 1, 0],
    transition: {
      duration: 1.22,
      times: [0, 0.12, 1],
      ease: [0.5, 0, 0.85, 0.4], // accelerate away
      opacity: { duration: 1.22, times: [0, 0.55, 1], ease: "easeIn" },
    },
  },
};

export const AirplaneTakeoffIcon = forwardRef<IconHandle, IconProps>(function AirplaneTakeoffIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "visible", ...style }}>
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
        <path d={RUNWAY} />
        <motion.path
          variants={reduced ? undefined : departure}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.47 }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
