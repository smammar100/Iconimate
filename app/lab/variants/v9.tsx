"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// Idle nod: while hovered the portrait sways on its neck forever, a slow easy
// metronome that never quite stops — and glides upright the moment you leave.
const personV: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -5, 5, 0],
    transition: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};

export const AddressBookV9 = forwardRef<IconHandle, IconProps>(function AddressBookV9(
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
        {/* the figure sways at the neck (136, 150) */}
        <motion.path
          variants={reduced ? undefined : personV}
          style={{ transformBox: "view-box", transformOrigin: "136px 150px" }}
          d={PERSON}
        />
      </motion.svg>
    </div>
  );
});
