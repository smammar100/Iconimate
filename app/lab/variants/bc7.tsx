"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE } from "../baby-carriage-icon";

// v7 — SUSPENSION BOUNCE (to spec). 0.85s ease-in-out infinite loop.
//   • Wheels: static — the two bottom circles never move.
//   • Body (handle + basket + canopy): bounces down to a suspension limit —
//       translateY 0% → 0px, 50% → 8px, 100% → 0px.
//   • Canopy: secondary momentum — as the body drops, the canopy pivots forward —
//       rotate 0% → 0deg, 50% → 6deg, 100% → 0deg, hinged at 152px 104px.
//
// The original glyph is untouched: the path is drawn three times and split with clip paths
// (which mask pixels, never the path data). The canopy sits inside the body group, so it
// inherits the drop AND adds its own pivot — proper secondary action.
// The hood sits entirely above the basket rim, which is a solid band at y[104,118].
// CANOPY_CLIP takes the hood and dips a few px into the rim (overlap); BODY_HOLE is punched
// only ABOVE the rim (down to y104), so the body keeps drawing the rim behind the pivoting
// canopy. That static rim always backs the seam — the canopy can pivot with no white gap.
// The canopy is the hood, clipped at the rim top (y104) so when it pivots its bottom edge is
// trimmed at the rim and can't protrude below/beside the basket. The body hole stops a little
// HIGHER (y98), so the body statically draws the hood's base band + the whole rim — solid
// glyph that backs the pivoting hood, so when its bottom edge lifts there is no white gap.
const CANOPY_CLIP = { x: 132, y: 12, w: 120, h: 92 }; // hood, clipped at rim top   y[12,104]
const BODY_HOLE = { x: 132, y: 12, w: 120, h: 86 }; //  punched above the base band y[12,98]
// The tyre rings sit at y[208,238] with a clean gap (y192-206) above them separating them
// from the X-frame legs. These boxes wrap each WHOLE tyre so it stays static and intact —
// never sliced. (The X-frame legs stay in the body and compress toward the tyres.)
const WHEEL_L = { x: 66, y: 204, w: 42, h: 40 }; // left tyre  x[66,108] y[204,244]
const WHEEL_R = { x: 172, y: 204, w: 42, h: 40 }; // right tyre x[172,214] y[204,244]
const CANOPY_HINGE = { transformBox: "view-box" as const, transformOrigin: "152px 104px" };

const LOOP: Transition = { duration: 0.85, times: [0, 0.5, 1], ease: "easeInOut", repeat: Infinity };

// Body drops to the suspension limit and back.
const bodyBounce: Variants = {
  normal: { y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  animate: { y: [0, 8, 0], transition: LOOP },
};
// Canopy pivots forward as the body drops (secondary momentum).
const canopyPivot: Variants = {
  normal: { rotate: 0, transition: { duration: 0.3, ease: "easeOut" } },
  animate: { rotate: [0, 6, 0], transition: LOOP },
};

const rect = (b: { x: number; y: number; w: number; h: number }) =>
  `M${b.x},${b.y}H${b.x + b.w}V${b.y + b.h}H${b.x}Z`;

export const Bc7 = forwardRef<IconHandle, IconProps>(function Bc7({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId();
  const bodyClip = `bc7-body-${uid}`;
  const canopyClip = `bc7-canopy-${uid}`;
  const wheelClip = `bc7-wheel-${uid}`;

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
          {/* Body: everything except the hood (above the rim) and the two tyres. The basket
              rim stays in the body so it backs the pivoting canopy. */}
          <clipPath id={bodyClip} clipPathUnits="userSpaceOnUse">
            <path clipRule="evenodd" d={`M0,0H256V256H0Z ${rect(BODY_HOLE)} ${rect(WHEEL_L)} ${rect(WHEEL_R)}`} />
          </clipPath>
          <clipPath id={canopyClip} clipPathUnits="userSpaceOnUse">
            <path d={rect(CANOPY_CLIP)} />
          </clipPath>
          <clipPath id={wheelClip} clipPathUnits="userSpaceOnUse">
            <path d={`${rect(WHEEL_L)} ${rect(WHEEL_R)}`} />
          </clipPath>
        </defs>

        {/* Body (handle + basket + canopy) bounces down; canopy adds its pivot. */}
        <motion.g variants={bodyBounce}>
          <g clipPath={`url(#${bodyClip})`}>
            <path d={BABY_CARRIAGE} />
          </g>
          <motion.g variants={canopyPivot} style={CANOPY_HINGE}>
            <g clipPath={`url(#${canopyClip})`}>
              <path d={BABY_CARRIAGE} />
            </g>
          </motion.g>
        </motion.g>

        {/* Wheels — static, drawn on top so the body settles behind them. */}
        <g clipPath={`url(#${wheelClip})`}>
          <path d={BABY_CARRIAGE} />
        </g>
      </motion.svg>
    </div>
  );
});
