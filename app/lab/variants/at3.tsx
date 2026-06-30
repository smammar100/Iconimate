"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT } from "../at-icon";

// v3 — SWEEP. The @ draws itself. A thick stroked circle is used as a mask and "drawn"
// around the center (pathLength 0 → 1), so the glyph is revealed in an angular sweep —
// starting at the opening on the right and circling round, like a radar hand tracing
// the symbol into being. Now it builds instead of just appearing.
const sweep: Variants = {
  normal: { pathLength: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], transition: { duration: 0.74, ease: SWEEP } },
};

export const At3 = forwardRef<IconHandle, IconProps>(function At3({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = useId();

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
            <motion.circle
              cx={128}
              cy={128}
              r={58}
              fill="none"
              stroke="#fff"
              strokeWidth={128}
              variants={sweep}
            />
          </mask>
        </defs>
        <path d={AT} mask={`url(#${maskId})`} />
      </motion.svg>
    </div>
  );
});
