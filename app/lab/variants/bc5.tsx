"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BABY_CARRIAGE } from "../baby-carriage-icon";

// v5 — HOOD UNFURL + BOUNCE (from baby-stroller (1).mp4). The showpiece, with every detail
// from the clip: a smooth in-place hood furl on top of a springy bounce. Following the
// ambulance icon, the WHOLE carriage bobs + rocks + sways as one rigid body (so the tyres
// ride with it and the axle never detaches), and the hood furls about its front hinge —
// timed as one loop so the pram crouches (body dips, hood furls) then springs up as the
// hood unfurls, exactly the beat of the video.
//
// Still the ORIGINAL glyph, unmodified: the same path is drawn twice and split with SVG clip
// paths (which mask rendered pixels, never the path data, so all the line-art holds) —
//   • body layer: the whole glyph with the hood-canopy box punched out;
//   • hood layer: just the canopy box, scaled about the hinge to furl/unfurl.
const HOOD_BOX = { x: 134, y: 14, w: 116, h: 105 }; // x[134,250] y[14,119]
// Furl anchor: the hood's front-base corner (bassinet rim, hinge line x160). The canopy furls
// INTO this point and blooms back OUT of it — never travels — its rim sweeping up and over.
const HINGE = { transformBox: "view-box" as const, transformOrigin: "158px 118px" };
// Bounce pivot: the ground between the wheels, so the rock reads as rolling on the tyres.
const GROUND = { transformBox: "view-box" as const, transformOrigin: "140px 224px" };

const TIMES = [0, 0.22, 0.4, 0.62, 0.8, 1];
const LOOP = { duration: 1.6, times: TIMES, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.12 } as const;

// Hood: open → furl into the front corner → hold → unfurl (slight overshoot) → open. Smooth.
const furl: Variants = {
  normal: { scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  animate: { scale: [1, 0.12, 0.12, 1.05, 1, 1], transition: LOOP },
};
// Whole carriage: crouch (dip + rock in) while the hood furls, then spring up + sway out as
// it unfurls, and settle. Bob + rock + sway together — the bouncy suspension of the video.
const bounce: Variants = {
  normal: { y: 0, rotate: 0, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    y: [0, 4, 4, -6, 1, 0],
    rotate: [0, 1, 1, -1.3, 0.3, 0],
    x: [0, 2, 2, -2, 0.4, 0],
    transition: LOOP,
  },
};

export const Bc5 = forwardRef<IconHandle, IconProps>(function Bc5({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId();
  const bodyClip = `bc-body-${uid}`;
  const hoodClip = `bc-hood-${uid}`;

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
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Body clip: full canvas with the hood-canopy box punched out (evenodd hole). */}
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

        {/* The whole carriage bobs + rocks + sways as one body. */}
        <motion.g variants={bounce} style={GROUND}>
          {/* Static carriage (hood region removed) — includes the tyres, which ride along. */}
          <g clipPath={`url(#${bodyClip})`}>
            <path d={BABY_CARRIAGE} />
          </g>
          {/* The hood, furling and unfurling about its front hinge. */}
          <motion.g variants={furl} style={HINGE}>
            <g clipPath={`url(#${hoodClip})`}>
              <path d={BABY_CARRIAGE} />
            </g>
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
