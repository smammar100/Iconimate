"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// IRIS — the blades ratchet one notch (60°, the glyph's symmetry step) and scale
// up a touch, the way an aperture turns when it stops down, then settle on hover-out.
// Phosphor "aperture" glyph (currentColor): kept as ONE path — its blades and the
// thin gaps between them come from fill-rule winding, so it must not be split.
const APERTURE =
  "M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,65.78a88.18,88.18,0,0,1,11,13.48L167.55,119,139.63,40.78A87.34,87.34,0,0,1,190.23,65.78ZM155.59,133l-18.16,21.37-27.59-5L100.41,123l18.16-21.37,27.59,5ZM65.77,65.78a87.34,87.34,0,0,1,56.66-25.59l17.51,49L58.3,74.32A88,88,0,0,1,65.77,65.78ZM46.65,161.54a88.41,88.41,0,0,1,2.53-72.62l51.21,9.35ZM65.77,190.22a88.18,88.18,0,0,1-11-13.48L88.45,137l27.92,78.18A87.34,87.34,0,0,1,65.77,190.22Zm124.46,0a87.34,87.34,0,0,1-56.66,25.59l-17.51-49,81.64,14.91A88,88,0,0,1,190.23,190.22Zm-34.62-32.49,53.74-63.27a88.41,88.41,0,0,1-2.53,72.62Z";

// Aperture centre as a view-box fraction — the pivot for the turn.
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const iris: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  // Back-out overshoot (shared OVERSHOOT_BACK) — a spring-like snap onto the notch.
  animate: { rotate: 60, scale: 1.06, transition: { duration: 0.6, ease: OVERSHOOT_BACK } },
};

export const ApertureIcon = forwardRef<IconHandle, IconProps>(function ApertureIcon(
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
        <motion.path d={APERTURE} variants={reduced ? undefined : iris} style={ORIGIN} />
      </motion.svg>
    </div>
  );
});
