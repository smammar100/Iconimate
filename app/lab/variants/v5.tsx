"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// The whole card is picked up off the desk and set back down — a brief lift with a touch of grow, then it settles home.
const cardV: Variants = {
  normal: { y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, 0],
    scale: [1, 1.04, 1],
    transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.4, 1] },
  },
};

export const AddressBookV5 = forwardRef<IconHandle, IconProps>(function AddressBookV5(
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
          variants={reduced ? undefined : cardV}
          style={{ transformBox: "view-box", transformOrigin: "128px 128px" }}
        >
          <path d={FRAME} />
          <path d={PERSON} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
