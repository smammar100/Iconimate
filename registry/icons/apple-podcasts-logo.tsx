"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WAVE — a quick double ping: the two broadcast arcs swell-and-recede twice,
// inner offset slightly from outer, then settle, while the mic figure holds
// steady. Reads as the icon "sending a pulse."
// Phosphor "podcast" glyph (currentColor), split so the arcs animate around the
// artboard centre while the central mic stays put.

// The central mic / figure (head circle + capsule body, with both cut-outs).
const FIGURE =
  "M154.2,138.33a32,32,0,1,0-52.4,0,24.27,24.27,0,0,0-8.76,7,23.68,23.68,0,0,0-4.3,20.49l12.18,48A24.18,24.18,0,0,0,124.44,232h7.12a24.18,24.18,0,0,0,23.52-18.15l12.18-48a23.68,23.68,0,0,0-4.3-20.49A24.27,24.27,0,0,0,154.2,138.33ZM128,104a16,16,0,1,1-16,16A16,16,0,0,1,128,104Zm23.75,57.91-12.18,48a8.18,8.18,0,0,1-8,6.09h-7.12a8.18,8.18,0,0,1-8-6.09l-12.18-48a7.71,7.71,0,0,1,1.42-6.73,8.26,8.26,0,0,1,6.58-3.18h31.5a8.26,8.26,0,0,1,6.58,3.18A7.71,7.71,0,0,1,151.75,161.91Z";
// Inner broadcast arc (the ~72px ring crescent).
const INNER_ARC =
  "M72,128a56.31,56.31,0,0,0,2,15,8,8,0,0,1-15.41,4.29,72,72,0,1,1,138.74,0A8,8,0,0,1,182,143,56,56,0,1,0,72,128Z";
// Outer broadcast arc (the ~104px ring crescent).
const OUTER_ARC =
  "M232,128a103.92,103.92,0,0,1-46.18,86.46,8,8,0,0,1-8.9-13.3,88,88,0,1,0-97.84,0,8,8,0,0,1-8.9,13.3A104,104,0,1,1,232,128Z";

// Artboard centre — the arcs are concentric here, so it's the pivot for the ping.
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const wave = (i: number): Variants => ({
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.16, 1, 1.16, 1],
    opacity: [1, 0.55, 1, 0.55, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1], delay: i * 0.09 },
  },
});

export const ApplePodcastsLogoIcon = forwardRef<IconHandle, IconProps>(function ApplePodcastsLogoIcon(
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
        <motion.path d={INNER_ARC} variants={reduced ? undefined : wave(0)} style={ORIGIN} />
        <motion.path d={OUTER_ARC} variants={reduced ? undefined : wave(1)} style={ORIGIN} />
        <path d={FIGURE} />
      </motion.svg>
    </div>
  );
});
