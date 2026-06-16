"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIGN_CENTER_HORIZONTAL } from "../align-center-horizontal-icon";

// CENTER WIPE — the glyph reveals outward from the center axis, both halves opening
// left and right at once. Mirrors the icon's meaning: everything resolves from the
// middle. clipPath animation, one-shot, artwork pixel-identical.
const centerWipe: Variants = {
  normal: { clipPath: "inset(0 0% 0 0%)", transition: RETURN_TRANSITION },
  animate: {
    clipPath: ["inset(0 50% 0 50%)", "inset(0 0% 0 0%)"],
    transition: { duration: DUR.slow * 1.8, ease: ARRIVE },
  },
};

export const AlignCH6 = forwardRef<IconHandle, IconProps>(function AlignCH6(
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
        variants={reduced ? undefined : centerWipe}
      >
        <path d={ALIGN_CENTER_HORIZONTAL} />
      </motion.svg>
    </div>
  );
});
