"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// An air-traffic control tower. Only the antenna flips a full turn on its own vertical axis;
// the tower holds still beneath it. Filled Phosphor-style glyph (currentColor).
const TOWER_BASE =
  "M229.11,70.82A16,16,0,0,0,216,64H40A16,16,0,0,0,25,85.47l26.19,72a16,16,0,0,0,15,10.53H96v64a8,8,0,0,0,16,0V168h32v64a8,8,0,0,0,16,0V168h29.82a16,16,0,0,0,15-10.53l26.19-72A16,16,0,0,0,229.11,70.82ZM110.68,152,97.58,80h60.84l-13.1,72ZM40,80H81.32l13.09,72H66.18Zm149.82,72H161.59l13.09-72H216Z";
const ANTENNA = "M136,64V32h16a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16h16V64Z";

// ANTICIPATION: the antenna winds back a few degrees before committing to the
// full turn; FOLLOW-THROUGH: it overshoots 360 and eases back, so the sweep lands
// with weight rather than stopping dead.
const flip: Variants = {
  normal: { rotateY: 0, transformPerspective: 500, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [0, -18, 372, 360],
    transformPerspective: 500,
    transition: { duration: 0.9, ease: ARRIVE, times: [0, 0.14, 0.86, 1] },
  },
};

export const ControlTowerIcon = forwardRef<IconHandle, IconProps>(function ControlTowerIcon(
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
        {/* static tower */}
        <path d={TOWER_BASE} />
        {/* the antenna spins on its own vertical axis */}
        <motion.path
          variants={reduced ? undefined : flip}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.156 }}
          d={ANTENNA}
        />
      </motion.svg>
    </div>
  );
});
