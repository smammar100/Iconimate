"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// The three page tabs peel forward over the spine like turning pages — top tab
// first, the others following — catching their back face before settling flat.
// The book itself never moves: it's the exact Phosphor glyph, and the tabs are
// the original notches, animated as an SVG mask cutout so the book stays untouched.
//
// BODY is the glyph with the tab notches filled in (solid spine); the animated
// NOTCHES re-cut them through the mask, so BODY + mask is pixel-identical to the
// original at rest. Filled Phosphor-style glyph (currentColor).
const BODY =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z" +
  "M48,48H176V208H48Z" +
  "M151.75,166a39.76,39.76,0,0,0-17.19-23.34,32,32,0,1,0-45.12,0A39.84,39.84,0,0,0,72.25,166a8,8,0,0,0,15.5,4c2.64-10.25,13.06-18,24.25-18s21.62,7.73,24.25,18a8,8,0,1,0,15.5-4Z" +
  "M96,120a16,16,0,1,1,16,16A16,16,0,0,1,96,120Z";
const NOTCHES = [
  "M192,48H208V88H192Z",
  "M192,104H208V152H192Z",
  "M192,168H208V208H192Z",
];
const NOTCH_ORIGINS = [
  { x: 0.75, y: 0.266 },
  { x: 0.75, y: 0.5 },
  { x: 0.75, y: 0.734 },
];

const pageflip = (i: number): Variants => ({
  normal: { rotateY: 0, rotateX: 0, scaleX: 1, transformPerspective: 420, transition: RETURN_TRANSITION },
  animate: {
    rotateY: [0, -62, -98, -88, 0],
    rotateX: [0, -5, -9, -6, 0],
    scaleX: [1, 0.92, 0.8, 0.86, 1],
    transformPerspective: 420,
    transition: { duration: 0.62, ease: ARRIVE, times: [0, 0.35, 0.55, 0.72, 1], delay: i * 0.09 },
  },
});

export const PhoneBookIcon = forwardRef<IconHandle, IconProps>(function PhoneBookIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = useId();

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
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
            <rect x="0" y="0" width="256" height="256" fill="#fff" />
            {NOTCHES.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="#000"
                variants={reduced ? undefined : pageflip(i)}
                style={{ transformBox: "view-box", originX: NOTCH_ORIGINS[i].x, originY: NOTCH_ORIGINS[i].y }}
              />
            ))}
          </mask>
        </defs>
        <path d={BODY} mask={`url(#${maskId})`} />
      </motion.svg>
    </div>
  );
});
