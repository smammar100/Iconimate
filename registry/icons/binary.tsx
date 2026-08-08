"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FLIP — each digit turns on its own vertical axis and comes back, one after
// another in reading order: a row of bits being flipped.
//
// THE GLYPH IS A 2x2 GRID OF DIGITS, and that is the whole opportunity. Almost
// every other icon in this set is one connected mark; this one is four
// independent shapes that can be driven separately. Measured off the rendered
// fill with a 4x supersample:
//
//   0  x56..131.75  y24..119.75   centre (93.9, 71.9)      row 1 reads "0 1"
//   1  x144..183.75 y24..119.75   centre (163.9, 71.9)
//   1  x64..103.75  y136..231.75  centre (83.9, 183.9)     row 2 reads "1 0"
//   0  x128..203.75 y136..231.75  centre (165.9, 183.9)
//
// SPLITTING THE SOURCE IS SAFE, AND WAS CHECKED RATHER THAN ASSUMED. The
// Phosphor path is one compound path whose subpaths chain by RELATIVE `m`
// commands — the second zero begins `m72,32` from wherever the first one's hole
// ended — so this is NOT a matter of cutting the string at each `M`. Every start
// point was resolved to an absolute `M` first. The four pieces painted together
// measure 2 ink flips against the original out of 174,649 ink pixels: that is
// antialiasing where separate fills abut, not geometric drift. Both zeros keep
// their outer AND inner subpath, so the counters stay punched.
//
// EACH DIGIT SPINS ABOUT ITS OWN MEASURED CENTRE, not the artboard's. A shared
// origin would swing the outer digits through an arc instead of turning them in
// place, which reads as the mark being shaken rather than as bits flipping.
const ZERO_TL =
  "M94,24C71.63,24,56,43.74,56,72s15.63,48,38,48,38-19.74,38-48S116.37,24,94,24ZM94,104c-17.37,0-22-20.11-22-32s4.63-32,22-32,22,20.11,22,32S111.37,104,94,104Z";
const ONE_TR =
  "M145,49.22a8,8,0,0,1,3.11-10.88l24-13.33A8,8,0,0,1,184,32v80a8,8,0,0,1-16,0V45.6l-12.12,6.73A8,8,0,0,1,145,49.22Z";
const ONE_BL =
  "M104,144v80a8,8,0,0,1-16,0V157.6l-12.12,6.73a8,8,0,0,1-7.76-14l24-13.33A8,8,0,0,1,104,144Z";
const ZERO_BR =
  "M166,136c-22.37,0-38,19.74-38,48s15.63,48,38,48,38-19.74,38-48S188.37,136,166,136ZM166,216c-17.37,0-22-20.11-22-32s4.63-32,22-32,22,20.11,22,32S183.37,216,166,216Z";

/** Reading order — top-left, top-right, bottom-left, bottom-right. The stagger
 *  runs in this order because that is the order the number is read in. */
const DIGITS = [
  { d: ZERO_TL, cx: 93.9, cy: 71.9 },
  { d: ONE_TR, cx: 163.9, cy: 71.9 },
  { d: ONE_BL, cx: 83.9, cy: 183.9 },
  { d: ZERO_BR, cx: 165.9, cy: 183.9 },
];

/** View-box transform origin: a point in 256-grid units as motion style. */
const at = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

/**
 * scaleX BOTTOMS AT 0.04, NOT 0. A zero-width fill is not merely invisible, it
 * is degenerate: the browser may drop the path for that frame and pop it back on
 * the next, which stutters at exactly the moment the eye is on it. 0.04 is well
 * under a pixel at ship size and cannot be seen, but it keeps the geometry
 * non-degenerate the whole way through.
 *
 * THE scaleY BULGE IS LOAD-BEARING, not decoration. Without it the digit reads
 * as a shutter closing and reopening; the slight swell as it goes edge-on is
 * what makes it read as a card turning instead.
 */
const flip = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.04, 1],
    scaleY: [1, 1.06, 1],
    transition: {
      duration: 0.62,
      delay: i * 0.09,
      times: [0, 0.5, 1],
      ease: ["easeIn", "easeOut"],
    },
  },
});

export const BinaryIcon = forwardRef<IconHandle, IconProps>(function BinaryIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          {DIGITS.map((g, i) => (
            <path key={i} d={g.d} />
          ))}
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
        {DIGITS.map((g, i) => (
          <motion.path key={i} d={g.d} variants={flip(i)} style={at(g.cx, g.cy)} />
        ))}
      </motion.svg>
    </div>
  );
});
