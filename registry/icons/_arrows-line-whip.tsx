"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared WHIP engine for the arrows-in-line pair (horizontal / vertical). The two arrows
// fly out to opposite edges (off-frame), rush back in and strike the centre line, which
// then jiggles a beat after impact and settles. The line is a stroked quadratic curve so
// its control point can bow it along the arrows' axis; at rest it's pixel-identical to
// the original filled bar. `axis` is the arrows' travel axis ("x" or "y"); the line runs
// perpendicular to it. Principles: SQUASH & STRETCH, OVERLAPPING ACTION, FOLLOW-THROUGH.
// Reduced-motion: renders static.
const OFF = 140; // off-frame travel for the arrows
const IMP = 12; // inward impact overshoot at the line

type LineGeo = { at: number; from: number; to: number };

// `off` bows the line's control point along the arrows' axis.
function lineBow(axis: "x" | "y", g: LineGeo, off: number) {
  const mid = (g.from + g.to) / 2;
  return axis === "x"
    ? `M${g.at},${g.from}Q${g.at + off},${mid},${g.at},${g.to}`
    : `M${g.from},${g.at}Q${mid},${g.at + off},${g.to},${g.at}`;
}

export function makeArrowsLineWhip(axis: "x" | "y", arrowNeg: string, arrowPos: string, line: LineGeo) {
  const flat = lineBow(axis, line, 0);
  const ARROW_T: Transition = {
    duration: 1.1,
    times: [0, 0.28, 0.44, 0.64, 1],
    ease: ["easeIn", "linear", "easeOut", "easeOut"],
  };
  // Literal x/y keys (not a computed key) so the object types as a motion Variant.
  const mk = (kf: number[]): Variants =>
    axis === "x"
      ? { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: kf, transition: ARROW_T } }
      : { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: kf, transition: ARROW_T } };
  const negV = mk([0, -OFF, -OFF, IMP, 0]);
  const posV = mk([0, OFF, OFF, -IMP, 0]);
  const lineV: Variants = {
    normal: { d: flat, transition: RETURN_TRANSITION },
    animate: {
      d: [flat, flat, lineBow(axis, line, 18), lineBow(axis, line, -14), lineBow(axis, line, 8), flat],
      transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.62, 0.72, 0.83, 0.92, 1] },
    },
  };

  return forwardRef<IconHandle, IconProps>(function ArrowsLineWhipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
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
          <motion.path d={arrowNeg} variants={reduced ? undefined : negV} />
          <motion.path d={arrowPos} variants={reduced ? undefined : posV} />
          <motion.path
            d={flat}
            variants={reduced ? undefined : lineV}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    );
  });
}
