"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SCROLL — the arrow rides a vertical wheel inside the static ring: it fades in
// small at the top, grows to full at the center, then shrinks and fades out at
// the bottom, with the next one already entering — a continuous "comes, then
// disappears" loop in the direction the arrow points (down).
const RING =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z";
const ARROW =
  "M165.66,130.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z";

// The arrow's bbox center, as a view-box fraction — the scale pivot.
const ARROW_ORIGIN = { x: 0.5, y: 0.51 };

const scroll: Variants = {
  normal: { y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-46, 0, 46],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.15,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 0.05,
    },
  },
};

export const ArrowCircleDownIcon = forwardRef<IconHandle, IconProps>(function ArrowCircleDownIcon(
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
        <path d={RING} />
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : scroll}
          style={{ transformBox: "view-box", originX: ARROW_ORIGIN.x, originY: ARROW_ORIGIN.y }}
        />
      </motion.svg>
    </div>
  );
});
