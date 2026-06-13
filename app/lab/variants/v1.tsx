"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// The whole card pivots on its vertical center axis and flips a full turn, like a
// contact card spun over in the hand before settling face-up again.
const cardV: Variants = {
  normal: { rotateY: 0, transformPerspective: 600, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [0, 360],
    transformPerspective: 600,
    transition: { duration: 0.8, ease: ARRIVE },
  },
};

export const AddressBookV1 = forwardRef<IconHandle, IconProps>(function AddressBookV1(
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
