"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BODY, WHEELS, GEAR_PIVOT } from "../taxi-icon";

// TAXI-IN — the plane rolls into the box from off the left, decelerating, and
// brakes to a stop exactly at the rest position: as it halts, the airframe pitches
// onto the nose (weight transfer) and rocks level. Body and the original wheels
// roll in together; only the body does the brake dip.
const ROLL_X = -230; // start off the LEFT, roll right into the box
const ROLL = { duration: 1.15, ease: ARRIVE } as const;

const brakeIn: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [ROLL_X, 0],
    rotate: [0, 0, 5, -1.4, 0],
    transition: {
      x: ROLL,
      rotate: { duration: 1.15, times: [0, 0.5, 0.76, 0.9, 1], ease: "easeInOut" },
    },
  },
};
const rollIn: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [ROLL_X, 0], transition: ROLL },
};

export const TaxiV6 = forwardRef<IconHandle, IconProps>(function TaxiV6(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    // overflow visible so the plane is seen rolling in from outside the icon box
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "visible", ...style }}>
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
        <motion.path
          variants={reduced ? undefined : brakeIn}
          style={{ transformBox: "view-box", originX: GEAR_PIVOT.x, originY: GEAR_PIVOT.y }}
          d={BODY}
        />
        {WHEELS.map((d, i) => (
          <motion.path
            key={i}
            variants={reduced ? undefined : rollIn}
            style={{ transformBox: "view-box" }}
            d={d}
          />
        ))}
      </motion.svg>
    </div>
  );
});
