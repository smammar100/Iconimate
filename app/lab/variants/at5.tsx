"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT } from "../at-icon";

// v5 — SIGNAL. The @ sweep-draws into being, then transmits: two radar pings ripple
// outward from the center — expanding rings that fade as they grow — like a message
// sent or a connection made. Thematic for the @, and the most alive of the set: it
// doesn't just appear, it comes online. The keeper.
const DRAW = 0.66;
const sweep: Variants = {
  normal: { pathLength: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], transition: { duration: DRAW, ease: SWEEP } },
};
// Pings are invisible at rest (opacity 0); they only flash during the animation, after
// the draw. They start just OUTSIDE the @ (scale ≥ 1.05 on a r=104 ring) and only
// ripple outward, so they never cross the transparent inner hole. Stroke stays crisp
// via non-scaling-stroke while the ring scales outward.
const ping = (delay: number): Variants => ({
  normal: { scale: 1, opacity: 0, transition: { duration: 0.2 } },
  animate: {
    scale: [1.05, 1.7],
    opacity: [0.5, 0],
    transition: { duration: 0.7, ease: "easeOut", delay },
  },
});

export const At5 = forwardRef<IconHandle, IconProps>(function At5({ size = 28, style, ...props }, ref) {
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
        {/* Radar pings — emanate from the center after the draw. */}
        {[DRAW - 0.04, DRAW + 0.16].map((d, i) => (
          <motion.circle
            key={i}
            cx={128}
            cy={128}
            r={104}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            vectorEffect="non-scaling-stroke"
            variants={ping(d)}
            style={center}
          />
        ))}
        {/* The @ itself, sweep-drawn. */}
        <path d={AT} mask={`url(#${maskId})`} />
      </motion.svg>
    </div>
  );
});
