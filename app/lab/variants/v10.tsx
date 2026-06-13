"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// The cover swings open on its left-spine hinge, then settles flat; as it opens the
// person fades and scales up into place — like a card opening to reveal its contact.
const frameV: Variants = {
  normal: { rotateY: 0, transformPerspective: 700, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [0, -52, 0],
    transformPerspective: 700,
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

const personV: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.6, 1],
    opacity: [0, 1],
    transition: { duration: 0.6, ease: ARRIVE },
  },
};

export const AddressBookV10 = forwardRef<IconHandle, IconProps>(function AddressBookV10(
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
        {/* cover hinges open from the left binder spine at x ~ 64 */}
        <motion.g
          variants={reduced ? undefined : frameV}
          style={{ transformBox: "view-box", transformOrigin: "64px 128px" }}
        >
          <path d={FRAME} />
        </motion.g>
        {/* the contact scales and fades in from the card center */}
        <motion.path
          variants={reduced ? undefined : personV}
          style={{ transformBox: "view-box", transformOrigin: "136px 120px" }}
          d={PERSON}
        />
      </motion.svg>
    </div>
  );
});
