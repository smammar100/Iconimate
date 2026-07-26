"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ROLL IN — the mark arrives instead of appearing. The B slides in from the
// left, the e ROLLS in from the right, and the bar drops onto it last and
// bounces.
//
// The mark is "Bē" and it decomposes for free: the three parts are already
// separate sub-paths of the Phosphor glyph with disjoint boxes, so this splits
// with no re-authoring and the rest state is the original reassembled.
//
//   BAR  x 160..240, y  72..88   the macron over the e
//   B    x  24..136, y  56..200  the B and its two counters
//   E    x 152..248, y 104..200  the e and its crossbar hole
//
// The roll is the point: the e's rotation is locked to its travel the way a
// real wheel's is. Rolling a disc of radius r a distance d turns it by exactly
// d/r radians, so travelling 72 units in turns it 72/48 = 1.5 rad = 85.9°, and
// the 6-unit overshoot turns it a further 6/48 = 7.2°. Those are quotients, not
// guesses — get them wrong and the wheel visibly skids.
//
// Bounds: rotating the e is free. Every point on it lies within 48.01 of
// (200,152), which is its own bounding circle, so spinning about that point
// sweeps no new ground. The entrances start outside the box on purpose and are
// clipped by the wrapper's overflow:hidden; the fly-in is over by 0.607s and
// from there nothing leaves the box, with the B's rebound (right edge 141)
// never reaching the e's (left edge 146). Rest is exactly the glyph box.
const BAR = "M160,80a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H168A8,8,0,0,1,160,80Z";
const B =
  "M136,158a42,42,0,0,1-42,42H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H90a38,38,0,0,1,25.65,66A42,42,0,0,1,136,158ZM40,116H90a22,22,0,0,0,0-44H40Zm80,42a26,26,0,0,0-26-26H40v52H94A26,26,0,0,0,120,158Z";
const E =
  "M248,152a8,8,0,0,1-8,8H169a32,32,0,0,0,56.59,11.2,8,8,0,0,1,12.8,9.61A48,48,0,1,1,248,152Zm-17-8a32,32,0,0,0-62,0Z";

// The e's own circle centre — a free pivot, and the bar's underside so it
// squashes against the landing rather than around its middle.
const E_CENTER = { transformBox: "view-box" as const, originX: 200 / 256, originY: 152 / 256 };
const BAR_FOOT = { transformBox: "view-box" as const, originX: 200 / 256, originY: 88 / 256 };

const rollB: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [-70, 5, 0],
    transition: { duration: 0.66, ease: "easeOut", times: [0, 0.74, 1] },
  },
};
const rollE: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [72, -6, 0],
    rotate: [85.9, -7.2, 0], // d/r: 72/48 and 6/48 radians, in degrees
    transition: { duration: 0.78, ease: "easeOut", times: [0, 0.76, 1], delay: 0.12 },
  },
};
const rollBar: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-46, 0, 0, 0],
    scaleY: [1, 0.72, 1.06, 1],
    transition: { duration: 0.5, ease: "easeIn", times: [0, 0.6, 0.82, 1], delay: 0.5 },
  },
};

export const BehanceLogoIcon = forwardRef<IconHandle, IconProps>(
  function BehanceLogoIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BAR} />
            <path d={B} />
            <path d={E} />
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
          <motion.path d={B} variants={rollB} />
          <motion.path d={E} variants={rollE} style={E_CENTER} />
          <motion.path d={BAR} variants={rollBar} style={BAR_FOOT} />
        </motion.svg>
      </div>
    );
  },
);
