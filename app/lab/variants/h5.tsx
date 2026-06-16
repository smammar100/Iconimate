"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIGN_CENTER_HORIZONTAL } from "../align-center-horizontal-icon";

// SWEEP — a left-to-right wipe reveals the glyph, like a guide passing across and
// snapping everything into alignment behind it. clipPath animation, one-shot.
const wipe: Variants = {
  normal: { clipPath: "inset(0 0% 0 0)", transition: RETURN_TRANSITION },
  animate: {
    clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

export const AlignCH5 = forwardRef<IconHandle, IconProps>(function AlignCH5(
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
        variants={reduced ? undefined : wipe}
      >
        <path d={ALIGN_CENTER_HORIZONTAL} />
      </motion.svg>
    </div>
  );
});
