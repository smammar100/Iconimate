"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT } from "../at-icon";

// v6 — BLOOM. A different reveal: instead of sweeping around the ring, the @ opens
// from the inside out. A filled circle in the mask grows from r=0 outward (its radius
// animated, not a transform — clip/mask geometry honours attributes), so the glyph
// blooms from its center to its rim, while the whole thing eases out of a gentle spin
// and slight scale. Radial, not angular — a fresh way for the @ to come online.
const reveal: Variants = {
  normal: { r: 150, transition: RETURN_TRANSITION },
  animate: { r: [0, 150], transition: { duration: 0.66, ease: SWEEP } },
};
const bloom: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0.86, 1], rotate: [-70, 0], opacity: [0, 1], transition: { duration: 0.66, ease: ARRIVE } },
};

export const At6 = forwardRef<IconHandle, IconProps>(function At6({ size = 28, style, ...props }, ref) {
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
            <motion.circle cx={128} cy={128} fill="#fff" variants={reveal} />
          </mask>
        </defs>
        <motion.g variants={bloom} style={center}>
          <path d={AT} mask={`url(#${maskId})`} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
