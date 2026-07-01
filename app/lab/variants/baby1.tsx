"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY } from "../baby-icon";

// v1 — BOUNCE (replica of baby-boy.mp4). Measured frame by frame from the 120-frame
// loop: the baby springs UP ~11 units, tightening horizontally to ~0.91 wide as it
// lifts (a gentle squeeze of excitement), floats at the apex with a tiny extra bob to
// its highest point mid-loop, then eases back down and rests. Height stays essentially
// constant across the whole clip, so this is a pure lift + horizontal squash — no
// vertical stretch. Timings and amplitudes below are the sampled values.
//
// yUp is negated into `y` (screen-down is positive). scaleX squeezes about the vertical
// centre line. Origin at the crown-to-chin centre so the squeeze reads symmetric.
const CENTER = { transformBox: "view-box" as const, transformOrigin: "128px 128px" };

const bounce: Variants = {
  normal: { y: 0, scaleX: 1, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    // Sampled apex ~11–13 up, squash to ~0.90 wide; hold; settle by 0.81; rest to 1.
    y: [0, -3.8, -11.2, -10, -13, -9.2, 0, 0],
    scaleX: [1, 0.974, 0.911, 0.903, 0.921, 0.946, 1, 1],
    transition: {
      duration: 2,
      times: [0, 0.07, 0.2, 0.27, 0.5, 0.71, 0.81, 1],
      ease: ["easeOut", "easeOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut", "linear"],
      repeat: Infinity,
    },
  },
};

export const Baby1 = forwardRef<IconHandle, IconProps>(function Baby1({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : bounce} style={CENTER} d={BABY} />
      </motion.svg>
    </div>
  );
});
