"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// The person dips its head in a quick, friendly greeting, rocks back through a
// softening wobble, and settles upright. The card frame holds still; only the
// person nods, pivoting at the neck. Filled Phosphor-style glyph (currentColor).
const FRAME =
  "M208,24H64A16,16,0,0,0,48,40V64H32a8,8,0,0,0,0,16H48v40H32a8,8,0,0,0,0,16H48v40H32a8,8,0,0,0,0,16H48v24a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V40A16,16,0,0,0,208,24Zm0,192H64V40H208Z";
const PERSON =
  "M83.19,174.4a8,8,0,0,0,11.21-1.6,52,52,0,0,1,83.2,0,8,8,0,1,0,12.8-9.6A67.88,67.88,0,0,0,163,141.51a40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,81.6,163.2,8,8,0,0,0,83.19,174.4ZM112,112a24,24,0,1,1,24,24A24,24,0,0,1,112,112Z";

const nod: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -9, 7, -3, 0], transition: { duration: 0.8, ease: "easeInOut" } },
};

export const AddressBookIcon = forwardRef<IconHandle, IconProps>(function AddressBookIcon(
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
        <path d={FRAME} />
        <motion.path
          variants={reduced ? undefined : nod}
          style={{ transformBox: "view-box", transformOrigin: "136px 150px" }}
          d={PERSON}
        />
      </motion.svg>
    </div>
  );
});
