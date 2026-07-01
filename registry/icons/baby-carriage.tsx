"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// SUSPENSION BOUNCE — the pram bounces on its suspension: the body (handle + basket +
// canopy) drops to a limit and back while the canopy pivots forward as secondary momentum;
// the two tyres stay planted. 0.85s ease-in-out, looping while hovered.
//
// The Phosphor "baby-carriage" glyph is one compound path, so we draw it three times and
// split it with SVG clip paths (which mask rendered pixels, never the path data — so all the
// line-art holds). The hood sits above the basket rim (a solid band at y[104,118]); the body
// keeps drawing the rim + hood base band behind the pivoting canopy, so the seam never opens
// a gap, and the canopy is clipped at the rim top so it can't protrude below the basket. The
// tyres (rings at y[208,238]) are wrapped whole in their own static layer.
const BABY_CARRIAGE =
  "M160,32h-8a16,16,0,0,0-16,16v56H55.2A40.07,40.07,0,0,0,16,72a8,8,0,0,0,0,16,24,24,0,0,1,24,24,80.09,80.09,0,0,0,80,80h40a80,80,0,0,0,0-160Zm63.48,72H166.81l41.86-33.49A63.73,63.73,0,0,1,223.48,104ZM160,48a63.59,63.59,0,0,1,36.69,11.61L152,95.35V48Zm0,128H120a64.09,64.09,0,0,1-63.5-56h167A64.09,64.09,0,0,1,160,176Zm-56,48a16,16,0,1,1-16-16A16,16,0,0,1,104,224Zm104,0a16,16,0,1,1-16-16A16,16,0,0,1,208,224Z";

const CANOPY_CLIP = { x: 132, y: 12, w: 120, h: 92 }; // hood, clipped at rim top   y[12,104]
const BODY_HOLE = { x: 132, y: 12, w: 120, h: 86 }; //  punched above the base band y[12,98]
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

export const BabyCarriageIcon = forwardRef<IconHandle, IconProps>(function BabyCarriageIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId();
  const bodyClip = `bcg-body-${uid}`;
  const canopyClip = `bcg-canopy-${uid}`;
  const wheelClip = `bcg-wheel-${uid}`;

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
        <motion.g variants={reduced ? undefined : bodyBounce}>
          <g clipPath={`url(#${bodyClip})`}>
            <path d={BABY_CARRIAGE} />
          </g>
          <motion.g variants={reduced ? undefined : canopyPivot} style={CANOPY_HINGE}>
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
