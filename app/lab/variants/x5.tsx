"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ALIEN, ALIEN_PIVOT } from "../alien-icon";

// POP — the head appears with a quick squash-and-swell, like a beam dropping it
// into place. One confident pop, then settle.
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.86, 1.12, 1], transition: { duration: 0.5, ease: ARRIVE } },
};

export const AlienV5 = forwardRef<IconHandle, IconProps>(function AlienV5(
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
        <motion.path
          variants={reduced ? undefined : pop}
          style={{ transformBox: "view-box", originX: ALIEN_PIVOT.x, originY: ALIEN_PIVOT.y }}
          d={ALIEN}
        />
      </motion.svg>
    </div>
  );
});
