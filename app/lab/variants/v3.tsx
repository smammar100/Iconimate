"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// The whole card turns like a page on its left spine, swinging open then rocking
// back to flat on diminishing amplitude. Real perspective sells the page-turn.
const cardV: Variants = {
  normal: { rotateY: 0, transformPerspective: 700, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [0, -42, 18, -7, 0],
    transformPerspective: 700,
    transition: { duration: 0.85, ease: "easeInOut" },
  },
};

export const AddressBookV3 = forwardRef<IconHandle, IconProps>(function AddressBookV3(
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
        {/* whole card hinges on the left binder spine at (64, 128) */}
        <motion.g
          variants={reduced ? undefined : cardV}
          style={{ transformBox: "view-box", transformOrigin: "64px 128px" }}
        >
          <path d={FRAME} />
          <path d={PERSON} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
