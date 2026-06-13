"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { PERSON, FRAME } from "../address-book-paths";

// Jingle — the whole card rocks on the foot of its spine and settles, like a flicked binder.
// Diminishing-amplitude keyframes carry the decay, so this is a tween (springs cap at 2 keyframes).
const cardV: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 3.5, -2.5, 1.5, -0.6, 0], transition: { duration: 0.85, ease: "easeInOut" } },
};

export const AddressBookV6 = forwardRef<IconHandle, IconProps>(function AddressBookV6(
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
        {/* the whole card pivots on the bottom of its left spine at (64, 200) */}
        <motion.g
          variants={reduced ? undefined : cardV}
          style={{ transformBox: "view-box", transformOrigin: "64px 200px" }}
        >
          <path d={FRAME} />
          <path d={PERSON} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
