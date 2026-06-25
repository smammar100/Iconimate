"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TAP — a presenter gestures at the board: it rocks once off the top of the
// easel, like a pointer tapping the corner, then settles. The easel A-frame
// holds still beneath it. Filled Phosphor presentation glyph (currentColor),
// split into stand + board so the board can pivot on its own.
const STAND =
  "M134.08,154.79a8,8,0,0,0-12.15,0l-48,56A8,8,0,0,0,80,224h96a8,8,0,0,0,6.07-13.21ZM97.39,208,128,172.29,158.61,208Z";
const BOARD =
  "M232,64V176a24,24,0,0,1-24,24h-8a8,8,0,0,1,0-16h8a8,8,0,0,0,8-8V64a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8V176a8,8,0,0,0,8,8h8a8,8,0,0,1,0,16H48a24,24,0,0,1-24-24V64A24,24,0,0,1,48,40H208A24,24,0,0,1,232,64Z";

// Pivot about the easel apex (top of the stand triangle, y≈172/256) so the board
// rocks where it meets the legs.
const APEX = { x: 0.5, y: 0.672 };

// ANTICIPATION: a small counter-lean (+3) before the tap drives the other way,
// then a diminishing rock settles it (follow-through).
const tap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 3, -8, 5, -2, 0],
    transition: { duration: 0.66, ease: ARRIVE, times: [0, 0.12, 0.4, 0.62, 0.82, 1] },
  },
};

export const PresentationIcon = forwardRef<IconHandle, IconProps>(function PresentationIcon(
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
        <path d={STAND} />
        <motion.path
          variants={reduced ? undefined : tap}
          style={{ transformBox: "view-box", originX: APEX.x, originY: APEX.y }}
          d={BOARD}
        />
      </motion.svg>
    </div>
  );
});
