"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPRINKLE — the glyph's own hand-shower head comes alive. The head lifts off
// the rim, tilts toward the tub, gives two sprinkle-shakes in the air while
// dotted beads fall into the basin, then drops back home; the tub takes the
// landing with a small thud-squash on its feet and the pipe wobbles in
// sympathy.
//
// The Phosphor "bathtub" glyph fuses head, pipe and tub into one compound
// path, so the three actors are carved out by CLIP-PARTITIONING the original
// path: three clipped renders whose regions tile the plane. At rest their
// union is byte-identical to the glyph. The rest-layer holes are inset 1 unit
// so the partitions overlap slightly — abutting clip edges antialias into a
// visible hairline seam through the ink; overlapping same-colour ink
// double-draws invisibly. The pieces pivot on/near their seams, so any sliver
// mismatch while animating stays subpixel.
//
// The sprinkle beads are ADDED line-art ink (short round-cap capsule strokes,
// no fills) at opacity 0 in the normal state, so the resting render stays
// pixel-identical. Sized to read at tile scale: a hairline dot at 24-56px is
// technically rendering but practically invisible.
//
// Bounds (the wrapper clips): head lift −26 puts its top at y58; beads travel
// y126..178 inside the basin; every rotation stays well inside the 256 box.
const BATH =
  "M240,96H208a8,8,0,0,0-8-8H136a8,8,0,0,0-8,8H64V52A12,12,0,0,1,76,40a12.44,12.44,0,0,1,12.16,9.59,8,8,0,0,0,15.68-3.18A28.32,28.32,0,0,0,76,24,28,28,0,0,0,48,52V96H16a8,8,0,0,0-8,8v40a56.06,56.06,0,0,0,56,56v16a8,8,0,0,0,16,0V200h96v16a8,8,0,0,0,16,0V200a56.06,56.06,0,0,0,56-56V104A8,8,0,0,0,240,96Zm-48,8v32H144V104Zm40,40a40,40,0,0,1-40,40H64a40,40,0,0,1-40-40V112H128v32a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V112h24Z";

const HEAD_BOX = { x: 122, y: 82, w: 92, h: 76 };
const PIPE_BOX = { x: 36, y: 12, w: 86, h: 81 };
const REST_CLIP =
  `M0,0H256V256H0Z ` +
  `M${HEAD_BOX.x + 1},${HEAD_BOX.y + 1}h${HEAD_BOX.w - 2}v${HEAD_BOX.h - 2}h-${HEAD_BOX.w - 2}Z ` +
  `M${PIPE_BOX.x + 1},${PIPE_BOX.y + 1}h${PIPE_BOX.w - 2}v${PIPE_BOX.h - 2}h-${PIPE_BOX.w - 2}Z`;

const DUR = 1.7;

const head: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Lift & tilt, two sprinkle-shakes while airborne, drop home at 0.84.
    y: [0, -26, -22, -25, -21, -24, 0, 0],
    rotate: [0, -14, -8, -15, -8, -12, 0, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.2, 0.32, 0.44, 0.56, 0.68, 0.84, 1] },
  },
};
const tub: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Holds still until the head lands, then a small thud-squash on the feet.
    scaleY: [1, 1, 0.98, 1.006, 1],
    transition: { duration: DUR, ease: "easeOut", times: [0, 0.84, 0.9, 0.96, 1] },
  },
};
const pipe: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Sympathetic wobble while the head shakes overhead.
    rotate: [0, 0, 2.5, -2, 1.5, -0.5, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.24, 0.38, 0.52, 0.66, 0.8, 1] },
  },
};

// Beads fall from under the lifted head (~y126) into the basin (~y178),
// drifting slightly left with the head's tilt, staggered through the airborne
// window (t≈0.2..0.68 of DUR).
const DROPS = [
  { x: 164, delay: 0.3 },
  { x: 148, delay: 0.42 },
  { x: 158, delay: 0.55 },
  { x: 142, delay: 0.68 },
  { x: 154, delay: 0.82 },
];
const drop = (delay: number): Variants => ({
  normal: { y: 0, x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    y: [0, 52],
    x: [0, -6],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.55, ease: "easeIn", delay, times: [0, 0.12, 0.82, 1] },
  },
});

export const BathtubIcon = forwardRef<IconHandle, IconProps>(
  function BathtubIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const headClip = `${uid}h`;
    const pipeClip = `${uid}p`;
    const restClip = `${uid}r`;

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BATH} />
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
            <clipPath id={headClip}>
              <rect x={HEAD_BOX.x} y={HEAD_BOX.y} width={HEAD_BOX.w} height={HEAD_BOX.h} />
            </clipPath>
            <clipPath id={pipeClip}>
              <rect x={PIPE_BOX.x} y={PIPE_BOX.y} width={PIPE_BOX.w} height={PIPE_BOX.h} />
            </clipPath>
            <clipPath id={restClip}>
              <path d={REST_CLIP} clipRule="evenodd" />
            </clipPath>
          </defs>
          {/* Tub + feet + rim (everything but head & pipe), thud on landing. */}
          <motion.g variants={tub} style={{ transformBox: "view-box", originX: 0.5, originY: 216 / 256 }}>
            <g clipPath={`url(#${restClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* The pipe, wobbling about its base on the clip seam. */}
          <motion.g variants={pipe} style={{ transformBox: "view-box", originX: 56 / 256, originY: 93 / 256 }}>
            <g clipPath={`url(#${pipeClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* The hand-shower head: lifted, shaken, set back down. */}
          <motion.g variants={head} style={{ transformBox: "view-box", originX: 168 / 256, originY: 120 / 256 }}>
            <g clipPath={`url(#${headClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* Sprinkle beads falling from the lifted head into the tub. The
              wrapper <g> carries placement — Motion writes style.transform,
              which overrides an svg transform attribute on the same element. */}
          {DROPS.map((d, i) => (
            <g key={i} transform={`translate(${d.x} 126)`}>
              <motion.path
                d="M0,0 l0,7"
                fill="none"
                stroke="currentColor"
                strokeWidth={12}
                strokeLinecap="round"
                variants={drop(d.delay)}
              />
            </g>
          ))}
        </motion.svg>
      </div>
    );
  },
);
