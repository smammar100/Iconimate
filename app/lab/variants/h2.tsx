"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, springSettle } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIGN_CENTER_HORIZONTAL } from "../align-center-horizontal-icon";

// GROW — the glyph expands horizontally out of the center axis (scaleX 0 → 1),
// landing with a little spring. A literal read of "align center horizontal": the
// content unfolds symmetrically left/right from the guide line.
const grow: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [0, 1], transition: springSettle },
};

export const AlignCH2 = forwardRef<IconHandle, IconProps>(function AlignCH2(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const origin = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
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
      >
        <motion.path variants={reduced ? undefined : grow} style={origin} d={ALIGN_CENTER_HORIZONTAL} />
      </motion.svg>
    </div>
  );
});
