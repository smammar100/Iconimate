"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RUBBER DROP — bumper plates. A cartoonish double bounce: the bar falls,
// the plates squash on every contact with the floor, and the rod — a cubic
// ribbon whose control points morph — flexes down at each landing and
// springs up between them until everything rings still.
//
// The Phosphor "barbell" glyph splits into three parts that reproduce it 1:1:
//   LEFT / RIGHT — each side's plate stack (inner tall plate + outer plate +
//                  end stub), even-odd from the glyph's own boundaries.
//   ROD          — the center bar (x104–152, y120–136) as a bendable ribbon.
const LEFT =
  "M88,48H64A16,16,0,0,0,48,64v8H32A16,16,0,0,0,16,88v32H8a8,8,0,0,0,0,16h8v32a16,16,0,0,0,16,16H48v8a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V64A16,16,0,0,0,88,48ZM32,88H48v80H32ZM64,64H88V192H64Z";
const RIGHT =
  "M168,48h24a16,16,0,0,1,16,16v8h16a16,16,0,0,1,16,16v32h8a8,8,0,0,1,0,16h-8v32a16,16,0,0,1-16,16H208v8a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V64A16,16,0,0,1,168,48ZM224,88H208v80h16ZM192,64H168V192h24Z";

const rod = (k: number) =>
  `M104,120C120,${120 + k},136,${120 + k},152,120L152,136C136,${136 + k},120,${136 + k},104,136Z`;
const ROD_STRAIGHT = rod(0);

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

const DUR = 1.2;
const plates: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 0, -7, 0, -2.5, 0],
    scaleY: [1, 1.04, 0.88, 1.03, 0.94, 1.01, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1] },
  },
};
const rodBounce: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 0, -7, 0, -2.5, 0],
    d: [ROD_STRAIGHT, rod(-3), rod(8), rod(-5), rod(5), rod(-2), ROD_STRAIGHT],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1] },
  },
};

export const BarbellIcon = forwardRef<IconHandle, IconProps>(function BarbellIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={LEFT} fillRule="evenodd" />
          <path d={RIGHT} fillRule="evenodd" />
          <path d={ROD_STRAIGHT} />
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
        {/* Squash is grounded at each stack's floor line so contacts read. */}
        <motion.path d={LEFT} fillRule="evenodd" variants={plates} style={AT(56, 208)} />
        <motion.path d={RIGHT} fillRule="evenodd" variants={plates} style={AT(200, 208)} />
        <motion.path d={ROD_STRAIGHT} variants={rodBounce} />
      </motion.svg>
    </div>
  );
});
