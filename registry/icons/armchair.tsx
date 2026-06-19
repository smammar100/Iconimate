"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PUFF — weight lands and the cushion responds: a grounded squash that spreads
// wide-and-flat, then springs back up with a soft overshoot (squash-and-stretch).
// Phosphor "armchair" glyph (currentColor), animated as a whole from the feet.

const CHAIR =
  "M216,88.8V72a40,40,0,0,0-40-40H80A40,40,0,0,0,40,72V88.8a40,40,0,0,0,0,78.4V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V167.2a40,40,0,0,0,0-78.4ZM80,48h96a24,24,0,0,1,24,24V88.8A40.07,40.07,0,0,0,168,128H88A40.07,40.07,0,0,0,56,88.8V72A24,24,0,0,1,80,48ZM208.39,152H208a8,8,0,0,0-8,8v40H56V160a8,8,0,0,0-8-8h-.39A24,24,0,1,1,72,128v40a8,8,0,0,0,16,0V144h80v24a8,8,0,0,0,16,0V128a24,24,0,1,1,24.39,24Z";

/** Grounded at the chair's feet so the squash compresses downward, like sitting. */
const FEET = { transformBox: "view-box" as const, originX: 0.5, originY: 0.82 };

const puff: Variants = {
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.85, 1.07, 0.98, 1],
    scaleX: [1, 1.09, 0.96, 1.01, 1],
    transition: { duration: 0.6, ease: "easeOut", times: [0, 0.3, 0.6, 0.82, 1] },
  },
};

export const ArmchairIcon = forwardRef<IconHandle, IconProps>(function ArmchairIcon(
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
        <motion.path d={CHAIR} variants={reduced ? undefined : puff} style={FEET} />
      </motion.svg>
    </div>
  );
});
