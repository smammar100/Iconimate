"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { HEAD, EYES, MOUTH, EYE_LINE } from "../alien-icon";

// BLINK — the head and mouth hold while the eyes squash shut and snap open along
// the eye line, then rest before the next blink. Loops.
const blink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.1, 1, 1],
    transition: { duration: 2, ease: "easeInOut", times: [0, 0.08, 0.16, 1], repeat: Infinity },
  },
};

export const AlienV2 = forwardRef<IconHandle, IconProps>(function AlienV2(
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
        <path d={HEAD} />
        <path d={MOUTH} />
        <motion.path
          variants={reduced ? undefined : blink}
          style={{ transformBox: "view-box", originX: EYE_LINE.x, originY: EYE_LINE.y }}
          d={EYES}
        />
      </motion.svg>
    </div>
  );
});
