"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BOUNCE-THEN-ROLL — two phases, in order. FIRST the ball bounces in place: two
// hops (x stays 0), each landing with a big, sharp squash. THEN it rolls right
// and back, the spin locked to travel.
//
// The glyph is a single compound path — the ball outline plus its curved panel
// seams — so it animates as a rigid body, exactly how a ball moves. Nothing is
// added and nothing is filled.
//
// Everything is capped to the 256 box (radius 104, centre 128, 24px margin):
// hop apex is y=-22 (top = 128-22-104 = 2), the squash fires at the centre (x=0)
// so scaleX 1.22 (edge 128+127 = 255) never clips, and the roll apex is x=22
// (edge 254). Rotation maps the circle onto itself, so the roll is free. Two
// layers: outer carries the bounce (translate + squash, pivot at the floor 232),
// inner carries the roll spin about the centre — and the two never overlap.
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm81.7,71.3a199.77,199.77,0,0,0-40.94-8.06A199.77,199.77,0,0,0,160.7,46.3,88.57,88.57,0,0,1,209.7,95.3ZM216,128a87.83,87.83,0,0,1-4.28,27.12,200.28,200.28,0,0,0-29.16-49.93,183.12,183.12,0,0,1,32.31,8.75A88.14,88.14,0,0,1,216,128ZM142.06,41.13a183.12,183.12,0,0,1,8.75,32.31,200.28,200.28,0,0,0-49.93-29.16,88.05,88.05,0,0,1,41.18-3.15ZM80.44,54a183.88,183.88,0,0,1,61.25,32.64A200.21,200.21,0,0,0,40.41,119.5,88.11,88.11,0,0,1,80.44,54ZM40.67,138.86a184.08,184.08,0,0,1,112.88-36.41,184.08,184.08,0,0,1-36.41,112.88A88.18,88.18,0,0,1,40.67,138.86Zm95.83,76.73a200.21,200.21,0,0,0,32.87-101.28A183.88,183.88,0,0,1,202,175.56,88.11,88.11,0,0,1,136.5,215.59Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const BOTTOM = { transformBox: "view-box" as const, originX: 0.5, originY: 232 / 256 };

// Outer: bounce in place (two hops), then roll right and back — with a big,
// sharply-timed squash at each landing.
const travel: Variants = {
  normal: { x: 0, y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, 0, 0, 0, 22, 0, 0],
    y: [0, -22, 0, -11, 0, 0, 0, 0],
    scaleX: [1, 1, 1.22, 1, 1.12, 1, 1],
    scaleY: [1, 1, 0.7, 1, 0.86, 1, 1],
    transition: {
      duration: 2.0,
      ease: "easeInOut",
      times: [0, 0.16, 0.3, 0.42, 0.55, 0.72, 0.88, 1],
      // The squash gets its own sharp timing so it snaps flat at the landing and
      // springs back, instead of easing smoothly through it.
      scaleX: { duration: 2.0, ease: "easeOut", times: [0, 0.24, 0.3, 0.4, 0.55, 0.63, 1] },
      scaleY: { duration: 2.0, ease: "easeOut", times: [0, 0.24, 0.3, 0.4, 0.55, 0.63, 1] },
    },
  },
};
// Inner: still through the bounce, then rolls coupled to travel.
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, 0, 0, 0, 30, 0, 0],
    transition: { duration: 2.0, ease: "easeInOut", times: [0, 0.16, 0.3, 0.42, 0.55, 0.72, 0.88, 1] },
  },
};

export const BeachBallIcon = forwardRef<IconHandle, IconProps>(
  function BeachBallIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BALL} />
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
          <motion.g variants={travel} style={BOTTOM}>
            <motion.g variants={spin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
