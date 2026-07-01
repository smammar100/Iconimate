"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE } from "../baby-carriage-icon";

// v6 — HOOD BREATHE (from the Stroller Lottie). Studied frame-by-frame: the carriage body,
// frame and wheels hold perfectly still (the dark centroid never moves) while ONLY the hood
// furls — a subtle, smooth pulse where the rib-fan gathers narrower toward its bottom-front
// hinge and blooms open again, then holds open for a long beat before the next breath. No
// bounce, no travel — just the quiet flutter of the canopy. ~2.2s loop, ease-in-out.
//
// Same clip technique as v5, so it's the ORIGINAL glyph untouched: the path is drawn twice
// and split by clip paths (which mask pixels, never the path data — all line-art intact):
//   • body layer: the whole glyph with the hood-canopy box punched out (stays static);
//   • hood layer: just the canopy box, scaled about the front-base hinge to furl.
const HOOD_BOX = { x: 134, y: 14, w: 116, h: 105 }; // x[134,250] y[14,119]
// Furl anchor: the hood's front-base corner. The canopy gathers toward it and blooms back
// out along the arc — the rim lifting up toward the hinge as it furls, exactly as measured.
const HINGE = { transformBox: "view-box" as const, transformOrigin: "158px 118px" };

// A gentle furl pulse (open → gather to ~0.82 → bloom back with a hair of overshoot → open),
// then a long hold open for the rest of the loop. Smooth, subtle, unhurried.
const breathe: Variants = {
  normal: { scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    scale: [1, 0.82, 1.02, 1, 1],
    transition: { duration: 2.2, times: [0, 0.13, 0.26, 0.34, 1], ease: "easeInOut", repeat: Infinity },
  },
};

export const Bc6 = forwardRef<IconHandle, IconProps>(function Bc6({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId();
  const bodyClip = `bc6-body-${uid}`;
  const hoodClip = `bc6-hood-${uid}`;

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BABY_CARRIAGE} />
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
          <clipPath id={bodyClip} clipPathUnits="userSpaceOnUse">
            <path
              clipRule="evenodd"
              d={`M0,0H256V256H0Z M${HOOD_BOX.x},${HOOD_BOX.y}H${HOOD_BOX.x + HOOD_BOX.w}V${HOOD_BOX.y + HOOD_BOX.h}H${HOOD_BOX.x}Z`}
            />
          </clipPath>
          <clipPath id={hoodClip} clipPathUnits="userSpaceOnUse">
            <rect x={HOOD_BOX.x} y={HOOD_BOX.y} width={HOOD_BOX.w} height={HOOD_BOX.h} />
          </clipPath>
        </defs>

        {/* Body, frame and wheels — perfectly still. */}
        <g clipPath={`url(#${bodyClip})`}>
          <path d={BABY_CARRIAGE} />
        </g>
        {/* The hood alone breathes — furling about its front-base hinge. */}
        <motion.g variants={breathe} style={HINGE}>
          <g clipPath={`url(#${hoodClip})`}>
            <path d={BABY_CARRIAGE} />
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
