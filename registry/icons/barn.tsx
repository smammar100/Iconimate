"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BARN DANCE — the door rolls open and the party spills out: the whole barn
// bounces with alternating tilts while the loft vent slides side to side
// keeping the beat, then the door rolls shut on the last step. The dance only
// happens while the door is open, which sells the "party inside" read.
//
// The Phosphor "barn" glyph is rebuilt into three parts that reproduce it 1:1:
//   SHELL — outer silhouette + a FULL interior hole (the original excludes
//           the door area from its interior; here the interior is open so
//           the door can move independently).
//   DOOR  — the crossbuck door: rounded-top rect with the glyph's own four
//           white triangles punched even-odd.
//   VENT  — the loft vent bar, the glyph's own subpath untouched.
const SHELL =
  "M240,192h-8V130.57l1.49,2.08a8,8,0,1,0,13-9.3l-40-56a8,8,0,0,0-2-1.94L137,18.77l-.1-.07a16,16,0,0,0-17.76,0l-.1.07L51.45,65.42a8,8,0,0,0-2,1.94l-40,56a8,8,0,1,0,13,9.3L24,130.57V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM40,108.17,61.7,77.79,128,32l66.3,45.78L216,108.17V192H40Z";
const DOOR =
  "M64,120a8,8,0,0,1,8-8H184a8,8,0,0,1,8,8v72H64ZM128,150.17,97,128H159ZM176,135.55v48.91L141.76,160ZM114.24,160,80,184.46V135.55ZM128,169.83,159,192H97Z";
const VENT = "M104,88a8,8,0,0,1,8-8h32a8,8,0,1,1,0,16H112A8,8,0,0,1,104,88Z";
// Full original glyph, for the reduced-motion static render.
const BARN =
  "M240,192h-8V130.57l1.49,2.08a8,8,0,1,0,13-9.3l-40-56a8,8,0,0,0-2-1.94L137,18.77l-.1-.07a16,16,0,0,0-17.76,0l-.1.07L51.45,65.42a8,8,0,0,0-2,1.94l-40,56a8,8,0,1,0,13,9.3L24,130.57V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM40,108.17,61.7,77.79,128,32l66.3,45.78L216,108.17V192H192V120a8,8,0,0,0-8-8H72a8,8,0,0,0-8,8v72H40Zm88,42L97,128H159Zm48-14.62v48.91L141.76,160ZM114.24,160,80,184.46V135.55ZM128,169.83,159,192H97Zm-24-81.83a8,8,0,0,1,8-8h32a8,8,0,1,1,0,16H112A8,8,0,0,1,104,88Z";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const FOUNDATION = AT(128, 200); // barn sits on its ground line
const DOOR_LEFT = AT(64, 152); // left jamb — sliding-door track

const DUR = 2.0;
const door: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 0.12, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.5, 0.78, 1] },
  },
};
const barn: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // dance only while the door is open (16%–78% of the timeline)
    y: [0, 0, -8, 0, -6, 0, 0],
    rotate: [0, 0, -2.5, 0, 2.5, 0, 0],
    scaleY: [1, 1, 1.03, 0.95, 1.02, 1, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.3, 0.46, 0.62, 0.78, 1] },
  },
};
const vent: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -7, 7, -5, 0, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.32, 0.5, 0.66, 0.78, 1] },
  },
};

export const BarnIcon = forwardRef<IconHandle, IconProps>(function BarnIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BARN} />
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
        <motion.g variants={barn} style={FOUNDATION}>
          <path d={SHELL} fillRule="evenodd" />
          <motion.path d={DOOR} fillRule="evenodd" variants={door} style={DOOR_LEFT} />
          <motion.path d={VENT} variants={vent} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
