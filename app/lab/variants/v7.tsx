"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// The person rises up into the empty card and fades in, settling on the expo-out tail; the frame holds still.
const personV: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { y: [22, 0], opacity: [0, 1], transition: { duration: 0.5, ease: ARRIVE } },
};

export const AddressBookV7 = forwardRef<IconHandle, IconProps>(function AddressBookV7(
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
