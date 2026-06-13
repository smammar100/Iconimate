"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// Person pop: the figure dips into a quick crouch, then springs up past full
// height and settles — a scale anticipation that pops the contact to life while
// the card holds perfectly still around it.

const personV: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.86, 1.14, 1],
    transition: { duration: 0.55, ease: ARRIVE, times: [0, 0.3, 0.65, 1] },
  },
};

export const AddressBookV2 = forwardRef<IconHandle, IconProps>(function AddressBookV2(
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
          variants={reduced ? undefined : personV}
          style={{ transformBox: "view-box", transformOrigin: "136px 120px" }}
          d={PERSON}
        />
      </motion.svg>
    </div>
  );
});
