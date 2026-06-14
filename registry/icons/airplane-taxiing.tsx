"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TAXI-IN — the plane rolls into the box from off the left, decelerating, and
// brakes to a stop at the rest position: as it halts the airframe pitches onto
// the nose (weight transfer) and rocks level. Body and wheels roll in together;
// only the body does the brake dip. The wrapper uses overflow:visible so the
// roll-in is seen from outside the box. Filled Phosphor airplane-taxiing glyph.
const BODY =
  "M208,96H147.32L101.66,50.34A8,8,0,0,0,96,48H88A16,16,0,0,0,72.83,69.06l9,26.94H59.32L37.66,74.34A8,8,0,0,0,32,72H24A16,16,0,0,0,8.69,92.6l14.07,46.89A39.75,39.75,0,0,0,61.07,168H240a8,8,0,0,0,8-8V136A40,40,0,0,0,208,96Zm24,56H61.07a23.85,23.85,0,0,1-23-17.1L24,88h4.68l21.66,21.66A8,8,0,0,0,56,112h36.9a8,8,0,0,0,7.59-10.53L88,64h4.68l45.66,45.66A8,8,0,0,0,144,112h64a24,24,0,0,1,24,24Z";
const WHEELS = [
  "M224,200a16,16,0,1,1-16-16A16,16,0,0,1,224,200Z",
  "M128,200a16,16,0,1,1-16-16A16,16,0,0,1,128,200Z",
];
const GEAR_PIVOT = { x: 0.625, y: 0.78 };

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

export const AirplaneTaxiingIcon = forwardRef<IconHandle, IconProps>(function AirplaneTaxiingIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
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
