"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// STRIKEOUT — the full pitch. A wind-up coil with an anticipation squash, a
// full-speed 360° rip (two seam-symmetric half turns), the smack into the
// mitt with a catch squash — then a recoil wobble that decays into the mitt
// instead of a dead stop.
//
// The glyph — ball, seams, and stitches — moves as one rigid body, so the
// original Phosphor path ships untouched. The seams' 180° rotational symmetry
// means the full turn lands exactly on the resting glyph.
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM72.09,195.91c.82-1,1.64-1.93,2.42-2.91A8,8,0,1,0,62,183l-1.34,1.62a87.82,87.82,0,0,1,0-113.24L62,73A8,8,0,1,0,74.51,63c-.78-1-1.6-2-2.42-2.91a87.84,87.84,0,0,1,111.82,0c-.82,1-1.64,1.92-2.42,2.91A8,8,0,1,0,194,73l1.34-1.62a87.82,87.82,0,0,1,0,113.24L194,183a8,8,0,1,0-12.48,10c.78,1,1.6,1.95,2.42,2.91a87.84,87.84,0,0,1-111.82,0Zm23.8-50.59a104.5,104.5,0,0,1-4.48,17.35,8,8,0,0,1-15.09-5.34,87.1,87.1,0,0,0,3.79-14.65,8,8,0,1,1,15.78,2.64Zm0-34.64a8,8,0,0,1-6.57,9.21A8.52,8.52,0,0,1,88,120a8,8,0,0,1-7.88-6.68,87.1,87.1,0,0,0-3.79-14.65,8,8,0,0,1,15.09-5.34A104.5,104.5,0,0,1,95.89,110.68Zm78.91,56.86a8,8,0,0,1-10.21-4.87,104.5,104.5,0,0,1-4.48-17.35,8,8,0,1,1,15.78-2.64,87.1,87.1,0,0,0,3.79,14.65A8,8,0,0,1,174.8,167.54Zm-14.69-56.86a104.5,104.5,0,0,1,4.48-17.35,8,8,0,0,1,15.09,5.34,87.1,87.1,0,0,0-3.79,14.65A8,8,0,0,1,168,120a8.52,8.52,0,0,1-1.33-.11A8,8,0,0,1,160.11,110.68Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const strikeout: Variants = {
  normal: { rotate: 0, x: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    // coil → rip (360° = two seam-symmetric half turns) → mitt impact →
    // recoil wobble that decays into the mitt (no dead stop)
    rotate: [0, -25, 335, 360, 357, 359, 360],
    x: [0, -8, 6, 0, 2.5, -1, 0],
    scaleX: [1, 0.94, 1, 0.85, 1.05, 0.98, 1],
    scaleY: [1, 0.94, 1, 1.1, 0.96, 1.01, 1],
    transition: {
      duration: 1.25,
      ease: "easeInOut",
      times: [0, 0.15, 0.5, 0.6, 0.72, 0.86, 1],
    },
  },
};

export const BaseballIcon = forwardRef<IconHandle, IconProps>(function BaseballIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BALL} />
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
        viewBox="0 0 256 256"
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path d={BALL} variants={strikeout} style={CENTER} />
      </motion.svg>
    </div>
  );
});
