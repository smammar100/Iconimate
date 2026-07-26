"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CHEERS & FIZZ — the whole toast in one beat, with the beer alive inside it.
// The stein lifts along the empty up-left diagonal, clinks TWICE at the top
// (the double-tap is what reads as "cheers!" rather than a wave), drops back to
// the bar and settles with a decaying rock.
//
// Underneath, carbonation runs the entire time: bubbles born small at the
// bottom of the glass rise up the three free columns of the interior window
// (x 56..88, 104..136, 152..184 — the gaps either side of the two ridge bars)
// and fade out below the rim. They live INSIDE the moving group, so they stay
// glued to the glass through the lift and the taps instead of sliding across
// it. At rest the group is identity and every bubble is opacity 0, so the icon
// is pixel-identical to the Phosphor glyph.
//
// Bounds: the glyph nearly fills the box — the far bottom-left corner (40,224)
// is 130 units from centre and the lid apex (104,16) is 114, so rotation about
// the centre is safe to about ±12°. The lift moves along the EMPTY up-left
// diagonal, never toward the handle in the bottom-right. Worst case over the
// whole timeline is x[27.8, 241.6], y[10.0, 228.1]. The bubbles are bounded by
// the glass, not the box: the tallest tops out at y≈92, still inside the
// interior window's ceiling of 80.
const STEIN =
  "M104,104v80a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm40-8a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V104A8,8,0,0,0,144,96Zm96,16v64a24,24,0,0,1-24,24H200v8a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V72c0-30.88,28.71-56,64-56,16.77,0,32.91,5.8,44.82,16H160a40,40,0,0,1,40,40V88h16A24,24,0,0,1,240,112ZM57,64H182.62A24,24,0,0,0,160,48H145.74a8,8,0,0,1-5.53-2.22C131.06,37,117.87,32,104,32,80.82,32,61.43,45.76,57,64ZM184,208V80H56V208H184Zm40-96a8,8,0,0,0-8-8H200v80h16a8,8,0,0,0,8-8Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

// Raise → tap, tap → land → settle. One layer does all of it.
const cheers: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -6, -6, -6, -6, 0, 0, 0, 0],
    y: [0, -6, -6, -6, -6, 0, 0, 0, 0],
    rotate: [0, 0, -7, -2, -7, 0, 4.5, -2, 0],
    transition: {
      duration: 1.7,
      ease: "easeInOut",
      times: [0, 0.13, 0.25, 0.35, 0.47, 0.62, 0.76, 0.89, 1],
    },
  },
};

// One rising bubble: `rise` is how far up the glass it gets before it fades.
const fizz = (rise: number, delay: number, duration: number): Variants => ({
  normal: { opacity: 0, y: 0, scale: 0.35, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 0.9, 0.75, 0],
    y: [0, -rise * 0.35, -rise * 0.72, -rise],
    scale: [0.35, 0.8, 1, 0.95],
    transition: {
      duration,
      ease: "easeOut",
      times: [0, 0.3, 0.65, 1],
      repeat: Infinity,
      repeatDelay: 0.15,
      delay,
    },
  },
});
const fizzA = fizz(96, 0, 1.25);
const fizzB = fizz(88, 0.42, 1.4);
const fizzC = fizz(80, 0.78, 1.15);
const fizzD = fizz(92, 1.05, 1.35);

export const BeerSteinIcon = forwardRef<IconHandle, IconProps>(
  function BeerSteinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={STEIN} />
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
          <motion.g variants={cheers} style={CENTER}>
            <path d={STEIN} />
            {/* Bubbles: left column (56..88), the gap between the ridge bars
                (104..136), then the right column (152..184). */}
            <motion.g variants={fizzA}>
              <circle cx={72} cy={196} r={8} />
            </motion.g>
            <motion.g variants={fizzB}>
              <circle cx={120} cy={198} r={10} />
            </motion.g>
            <motion.g variants={fizzC}>
              <circle cx={168} cy={196} r={7} />
            </motion.g>
            <motion.g variants={fizzD}>
              <circle cx={119} cy={200} r={6} />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
