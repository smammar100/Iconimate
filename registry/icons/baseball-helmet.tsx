"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DIZZY — rung its bell. The helmet wobbles woozily in a decaying rock while
// two four-point stars orbit the dome in opposite phases — spinning about
// their own centers, swelling and brightening across the front of the ellipse
// and shrinking behind it — and the loose bill twangs opposite every swing,
// settling last.
//
// The Phosphor "baseball-helmet" glyph splits into three 1:1 parts:
//   SHELL — dome + its interior subpaths (even-odd), bill removed from the
//           boundary.
//   BILL  — the face guard bar (x200–256, y120–136, rounded tip) so it can
//           twang independently.
//   EAR   — the ear-pad ring + dot hole (even-odd).
// The stars are extra actors hidden at rest, so the resting glyph is exact.
const SHELL =
  "M223.7,120A104,104,0,0,0,16,128v24a72.08,72.08,0,0,0,72,72h40a72.08,72.08,0,0,0,72-72V136h23.7Z" +
  "M184,152a56.06,56.06,0,0,1-50.46,55.72A71.87,71.87,0,0,0,160,152V136h24Z" +
  "M152,120a8,8,0,0,0-8,8v24a56,56,0,0,1-112,0V128a88,88,0,0,1,175.64-8Z";
const BILL = "M200,120h48a8,8,0,0,1,0,16H200Z";
const EAR =
  "M88,128a28,28,0,1,0,28,28A28,28,0,0,0,88,128Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,88,168Z";
// Full original glyph, for the reduced-motion static render.
const HELMET =
  "M88,128a28,28,0,1,0,28,28A28,28,0,0,0,88,128Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,88,168Zm160-48H223.7A104,104,0,0,0,16,128v24a72.08,72.08,0,0,0,72,72h40a72.08,72.08,0,0,0,72-72V136h48a8,8,0,0,0,0-16Zm-64,32a56.06,56.06,0,0,1-50.46,55.72A71.87,71.87,0,0,0,160,152V136h24Zm-32-32a8,8,0,0,0-8,8v24a56,56,0,0,1-112,0V128a88,88,0,0,1,175.64-8Z";
/** Four-point twinkle star, centered on the origin. */
const STAR = "M0,-10L2.4,-2.4L10,0L2.4,2.4L0,10L-2.4,2.4L-10,0L-2.4,-2.4Z";

const BASE = { transformBox: "view-box" as const, originX: 0.5, originY: 224 / 256 };
const BILL_ROOT = { transformBox: "view-box" as const, originX: 200 / 256, originY: 0.5 };

const DUR = 1.7;
const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 6, -5, 4, -2.5, 1, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.14, 0.3, 0.46, 0.62, 0.76, 0.88, 1] },
  },
};
// The bill twangs loosely through the wobble, flopping opposite each swing
// and settling last.
const bill: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 9, -7, 5, -3, 1.5, 0],
    transition: { duration: DUR, ease: "easeOut", times: [0, 0.18, 0.34, 0.5, 0.65, 0.78, 0.9, 1] },
  },
};
const orbit = (phase: number): Variants => {
  const pts = 13;
  const xs: number[] = [];
  const ys: number[] = [];
  const scales: number[] = [];
  const rotates: number[] = [];
  const opacities: number[] = [];
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1);
    const a = phase + t * Math.PI * 2;
    xs.push(Math.cos(a) * 52);
    ys.push(Math.sin(a) * -20);
    // depth cue: bigger & brighter at the front of the ellipse, smaller &
    // dimmer swinging behind the dome
    const front = (Math.sin(a) + 1) / 2;
    scales.push(0.72 + front * 0.55);
    opacities.push(0.45 + front * 0.55);
    // the star itself spins as it orbits — 1.5 turns per lap
    rotates.push(t * 540);
  }
  opacities[0] = 0;
  opacities[pts - 1] = 0;
  scales[0] = 0.3;
  scales[pts - 1] = 0.3;
  return {
    normal: { opacity: 0, scale: 0, transition: { duration: 0.1 } },
    animate: {
      opacity: opacities,
      scale: scales,
      rotate: rotates,
      x: xs,
      y: ys,
      transition: { duration: DUR * 0.75, ease: "linear", delay: DUR * 0.08 },
    },
  };
};

export const BaseballHelmetIcon = forwardRef<IconHandle, IconProps>(function BaseballHelmetIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={HELMET} />
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
        {/* origin-centered star paths inside positioning groups: motion's x/y
            orbits them, rotate spins each star about its own center */}
        <g transform="translate(128,40)">
          <motion.path d={STAR} variants={orbit(0)} />
        </g>
        <g transform="translate(128,42) scale(0.8)">
          <motion.path d={STAR} variants={orbit(Math.PI)} />
        </g>
        <motion.g variants={shell} style={BASE}>
          <path d={SHELL} fillRule="evenodd" />
          <motion.path d={BILL} variants={bill} style={BILL_ROOT} />
          <path d={EAR} fillRule="evenodd" />
        </motion.g>
      </motion.svg>
    </div>
  );
});
