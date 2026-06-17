"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// HOP — the little bot does a happy squash-and-bounce while its eyes wink shut and its
// two antennae waggle like feelers. The Phosphor android-logo is split so the antennae
// (their own rounded strokes) and the eyes move independently inside the hopping shell.
const ANDROID_BODY =
  "M240,160v24a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V161.13A113.38,113.38,0,0,1,51.4,78.72L63.82,68.5a111.43,111.43,0,0,1,128.55-.19L204.82,78.5c.75.71,1.5,1.43,2.24,2.17A111.25,111.25,0,0,1,240,160Zm-16,0a96,96,0,0,0-96-96h-.34C74.91,64.18,32,107.75,32,161.13V184H224Z";

// Antenna pivots sit where each feeler meets the dome (normalised to the 256 viewBox).
const ANT_L_PIVOT = { x: 63.82 / 256, y: 68.5 / 256 };
const ANT_R_PIVOT = { x: 192.37 / 256, y: 68.31 / 256 };

// Whole-bot squash-and-bounce, pivoting about the feet so the squash stays grounded.
const hop: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, -12, 0, 0],
    scaleY: [1, 0.9, 1.05, 0.92, 1],
    scaleX: [1, 1.05, 0.97, 1.04, 1],
    transition: {
      duration: 1.4,
      times: [0, 0.15, 0.45, 0.72, 1],
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const blink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.1, 0.1, 1, 1],
    transition: {
      duration: 2.6,
      times: [0, 0.38, 0.43, 0.46, 0.5, 1],
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const antennaL: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 7, 0],
    transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
  },
};
const antennaR: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 13, -7, 0],
    transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
  },
};

export const AndroidLogoIcon = forwardRef<IconHandle, IconProps>(function AndroidLogoIcon(
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
        <motion.g
          variants={reduced ? undefined : hop}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.78 }}
        >
          <motion.line
            x1={63.82}
            y1={68.5}
            x2={32}
            y2={48}
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={reduced ? undefined : antennaL}
            style={{ transformBox: "view-box", originX: ANT_L_PIVOT.x, originY: ANT_L_PIVOT.y }}
          />
          <motion.line
            x1={192.37}
            y1={68.31}
            x2={224}
            y2={48}
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={reduced ? undefined : antennaR}
            style={{ transformBox: "view-box", originX: ANT_R_PIVOT.x, originY: ANT_R_PIVOT.y }}
          />
          <path d={ANDROID_BODY} />
          <motion.circle
            cx={164}
            cy={148}
            r={12}
            variants={reduced ? undefined : blink}
            style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
          />
          <motion.circle
            cx={92}
            cy={148}
            r={12}
            variants={reduced ? undefined : blink}
            style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
});
