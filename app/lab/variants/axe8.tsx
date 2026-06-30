"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE } from "../axe-icon";

// v8 — CHOP, CONTAINED. v3's wind-up-and-chop swing, fixed so it never leaves the box.
// v3 pivoted at the extreme handle tip with overflow visible, so the blade got clipped
// by the card edge mid-swing — that's the awkward bit. Here the axe pivots at the grip
// (76,181, a hand's grip rather than the very end) and the viewBox is widened to the
// swing's union bounding box (≈(-55,-39)→(290,266), centred on (118,113)), so the whole
// arc renders inside the icon's box. Just the clean chop — no trails, no sparks.
const VIEW_BOX = "-69 -74 374 374";
// Pivot at the grip (76,181). With transform-box: view-box, origin lengths are measured
// from the view-box top-left (-69,-74), so (76,181) → "145px 255px".
const PIVOT = { transformBox: "view-box" as const, transformOrigin: "145px 255px" };

// The chop, straight from v3: wind back, drive down past rest, settle.
const chop: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -22, 14, 0],
    transition: { duration: 0.66, times: [0, 0.34, 0.6, 1], ease: ["easeOut", "easeIn", "easeOut"] },
  },
};

export const Axe8 = forwardRef<IconHandle, IconProps>(function Axe8({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={VIEW_BOX} fill="currentColor">
          <path d={AXE} />
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
        viewBox={VIEW_BOX}
        fill="currentColor"
        initial="normal"
        animate={controls}
      >
        <motion.g variants={chop} style={PIVOT}>
          <path d={AXE} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
