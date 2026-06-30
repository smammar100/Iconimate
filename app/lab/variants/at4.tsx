"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT } from "../at-icon";

// v4 — MATERIALIZE. The sweep-draw of v3, but the whole glyph also scales up from
// small and spins a quarter-turn into place as it draws (the mask lives inside the
// transformed group, so the sweep stays locked to the glyph's own frame). The @ winds
// itself into existence — draw + grow + spin fused into one confident gesture.
const DUR = 0.78;
const sweep: Variants = {
  normal: { pathLength: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], transition: { duration: DUR, ease: SWEEP } },
};
const grow: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0.5, 1], rotate: [-120, 0], opacity: [0, 1], transition: { duration: DUR, ease: ARRIVE } },
};

export const At4 = forwardRef<IconHandle, IconProps>(function At4({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = useId();
  const center = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={AT} />
        </svg>
      </div>
    );
  }

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
        <defs>
          <mask id={maskId}>
            <motion.circle cx={128} cy={128} r={58} fill="none" stroke="#fff" strokeWidth={128} variants={sweep} />
          </mask>
        </defs>
        <motion.g variants={grow} style={center}>
          <path d={AT} mask={`url(#${maskId})`} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
