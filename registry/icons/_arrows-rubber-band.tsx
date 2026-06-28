"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared RUBBER BAND engine for the double-headed resize arrows (horizontal / vertical).
// The glyph stretches wide along its axis, then snaps back through a few diminishing
// wobbles, like a released elastic. Scaled about the centre so both heads pull out
// symmetrically. `axis` picks scaleX ("x") or scaleY ("y"). Principles: SQUASH &
// STRETCH (the elastic scale), FOLLOW-THROUGH (the decaying overshoots). Reduced-motion:
// renders static.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

export function makeArrowsRubberBand(glyph: string, axis: "x" | "y") {
  const KEYS = [1, 1.32, 0.9, 1.1, 0.97, 1];
  const T: Transition = { duration: 0.95, times: [0, 0.25, 0.5, 0.7, 0.86, 1], ease: "easeOut" };
  // Literal scaleX/scaleY keys (not a computed key) so the object types as a Variant.
  const rubberBand: Variants =
    axis === "x"
      ? { normal: { scaleX: 1, transition: RETURN_TRANSITION }, animate: { scaleX: KEYS, transition: T } }
      : { normal: { scaleY: 1, transition: RETURN_TRANSITION }, animate: { scaleY: KEYS, transition: T } };
  return forwardRef<IconHandle, IconProps>(function ArrowsRubberBandIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
          <motion.path d={glyph} variants={reduced ? undefined : rubberBand} style={CENTER} />
        </motion.svg>
      </div>
    );
  });
}
