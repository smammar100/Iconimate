"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// Head nod: the person dips its head in a quick, friendly greeting,
// rocks back through a softening wobble, and settles upright again.

const personV: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 7, -3, 0],
    transition: { duration: 0.8, ease: "easeInOut" },
  },
};

export const AddressBookV4 = forwardRef<IconHandle, IconProps>(function AddressBookV4({ size = 28, style, ...props }, ref) {
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
          variants={reduced ? undefined : personV}
          style={{ transformBox: "view-box", transformOrigin: "136px 150px" }}
          d={PERSON}
        />
      </motion.svg>
    </div>
  );
});
