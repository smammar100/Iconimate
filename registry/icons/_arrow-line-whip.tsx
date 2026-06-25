"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared WHIP engine for the arrow-line family. Two flavors, both with the line
// recoiling — bowing away on impact like a trampoline, then wobbling back to flat.
// Principles: SQUASH & STRETCH (the arrow collapses into / lunges from its line),
// ANTICIPATION (the SHOOT mode winds back toward the line before lunging out),
// OVERLAPPING ACTION (the line reacts a beat AFTER the arrow lands, then wobbles),
// FOLLOW-THROUGH (the elastic settle). Reduced-motion: variants gate to undefined.
//
//  • SQUASH (straight arrows whose head points at the line): the arrow collapses
//    perpendicular into its line (scaleY / scaleX, anchored on the line) and whips
//    back out with an exaggerated overshoot + elastic bounce.
//  • SHOOT (diagonal arrows whose head points away from the line): the line wobbles
//    first as the arrow anticipates back toward it, then the arrow lunges out in the
//    direction its head points (overshoot) and settles.

type LineCfg = {
  orient: "h" | "v";
  /** Fixed coordinate of the line (y for horizontal, x for vertical). */
  at: number;
  /** Endpoints of the line along its length. */
  from: number;
  to: number;
  /** Signed peak bow offset on impact (+down/right, -up/left). */
  bow: number;
};
type Cfg = {
  arrow: string;
  line: LineCfg;
  /** SQUASH mode — perpendicular collapse into the line. */
  scale?: "scaleX" | "scaleY";
  origin?: { x: number; y: number };
  /** SHOOT mode — lunge in the head's pointing direction (e.g. {x:-1,y:1} = down-left). */
  dir?: { x: number; y: number };
};

const SHOOT_A = 9; // anticipation back toward the line
const SHOOT_S = 28; // lunge out in the pointing direction (overshoot)
const SHOOT_R = 6; // small bounce-back
function shootVariants(dir: { x: number; y: number }): Variants {
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: {
      // rest → anticipate toward the line → lunge out (pointing dir) → bounce → settle
      x: [0, SHOOT_A * -dir.x, SHOOT_S * dir.x, SHOOT_R * -dir.x, 0],
      y: [0, SHOOT_A * -dir.y, SHOOT_S * dir.y, SHOOT_R * -dir.y, 0],
      transition: { duration: 1, ease: ["easeOut", "easeInOut", "easeOut", "easeInOut"], times: [0, 0.26, 0.58, 0.78, 1] },
    },
  };
}

function lineD(o: LineCfg, ctrl: number) {
  const mid = (o.from + o.to) / 2;
  return o.orient === "h"
    ? `M${o.from},${o.at}Q${mid},${ctrl},${o.to},${o.at}`
    : `M${o.at},${o.from}Q${ctrl},${mid},${o.at},${o.to}`;
}

const WHIP_KEYS = [1, 0.02, 1.5, 0.82, 1.16, 0.95, 1.03, 1];
const WHIP_T: Transition = { duration: 1, ease: "easeInOut", times: [0, 0.16, 0.42, 0.58, 0.72, 0.84, 0.93, 1] };
const whipY: Variants = { normal: { scaleY: 1, transition: RETURN_TRANSITION }, animate: { scaleY: WHIP_KEYS, transition: WHIP_T } };
const whipX: Variants = { normal: { scaleX: 1, transition: RETURN_TRANSITION }, animate: { scaleX: WHIP_KEYS, transition: WHIP_T } };

export function makeArrowLineWhip({ arrow, line, scale, origin, dir }: Cfg) {
  const flat = lineD(line, line.at);
  const peak = lineD(line, line.at + line.bow);
  const back = lineD(line, line.at - line.bow * 0.5);
  const settle = lineD(line, line.at + line.bow * 0.3);

  // SHOOT (diagonal) vs SQUASH (straight) arrow motion.
  const arrowVariants = dir ? shootVariants(dir) : scale === "scaleX" ? whipX : whipY;
  const arrowStyle =
    dir || !origin ? undefined : { transformBox: "view-box" as const, originX: origin.x, originY: origin.y };

  const lineWobble: Variants = {
    normal: { d: flat, transition: RETURN_TRANSITION },
    animate: {
      // flat until the arrow lands (~0.14), then bow away and wobble back to flat
      d: [flat, flat, peak, back, settle, flat],
      transition: { duration: 1, ease: "easeInOut", times: [0, 0.14, 0.3, 0.5, 0.74, 1] },
    },
  };

  return forwardRef<IconHandle, IconProps>(function ArrowLineWhipIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path d={arrow} variants={reduced ? undefined : arrowVariants} style={arrowStyle} />
          <motion.path
            d={flat}
            variants={reduced ? undefined : lineWobble}
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
