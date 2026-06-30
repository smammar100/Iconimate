"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP & SWAY — the pit falls in and bounces (a real drop with two decaying hops) to
// rest dead-centre, while the body swings like a pendulum about its bottom point,
// rocking left↔right in an ever-smaller arc. Both run for one shared duration so they
// settle together. The glyph is split into the body (skin outline) and the pit (the
// stone ring) so each can move on its own; at rest they recombine pixel-identical.
const BODY =
  "M211,130.66L181.2,46.47a56,56,0,0,0-106-1.14h0l-29.51,83.5A88,88,0,1,0,211,130.66ZM128,232a72.05,72.05,0,0,1-67.33-97.57,1.34,1.34,0,0,1,.07-.18L90.28,50.66h0a40,40,0,0,1,75.74.88l.06.18L195.9,136A72.05,72.05,0,0,1,128,232Z";
const PIT =
  "M128,112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,112Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,192Z";

const DUR = 0.95;
// Pivot at the avocado's bottom tip (≈128,232) so the body swings as a pendulum.
const PIVOT = { transformBox: "view-box" as const, originX: 0.5, originY: 232 / 256 };
const PIT_O = { transformBox: "view-box" as const, originX: 0.5, originY: 160 / 256 };

const body: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 8.5, -5.5, 3.4, -1.7, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.26, 0.42, 0.58, 0.74, 0.88, 1] },
  },
};
const pit: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-52, 0, -18, 0, -6, 0],
    opacity: [0, 1, 1, 1, 1, 1],
    transition: {
      duration: DUR,
      times: [0, 0.4, 0.56, 0.74, 0.87, 1],
      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
    },
  },
};

export const AvocadoIcon = forwardRef<IconHandle, IconProps>(function AvocadoIcon({ size = 28, style, ...props }, ref) {
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
      >
        <motion.path variants={reduced ? undefined : body} style={PIVOT} d={BODY} />
        <motion.path variants={reduced ? undefined : pit} style={PIT_O} d={PIT} />
      </motion.svg>
    </div>
  );
});
