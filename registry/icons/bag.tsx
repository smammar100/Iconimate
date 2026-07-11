"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LIFT + SWING — the full pick-up. The handle rises first with the body
// hanging a beat behind (soft contents lag), the airborne bag swings twice
// about the grip like a carried satchel, then it lowers and settles — one
// continuous carry gesture.
//
// The Phosphor "bag" glyph splits into two parts that reproduce it exactly:
//   BODY   — the satchel outline (outer r16 / sharp inner corners), even-odd
//            from the glyph's own boundary shapes, with an unbroken top bar.
//   HANDLE — the arch plus its two in-body tabs as one 16-wide round-capped
//            stroke (centerline r40 ⇒ outer r48 / inner r32; the round caps
//            at y96 reproduce the tabs' rounded ends).
// The handle overlaps the top bar where it passes through — same fill, so the
// union is pixel-identical to the original glyph.
const BODY =
  "M216,64H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM216,200H40V80H216Z";
const HANDLE = "M88,96V64a40,40,0,0,1,80,0V96";
// Full original glyph, for the reduced-motion static render.
const BAG =
  "M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z";

// Pivot at the top of the handle arch — where the hand grips it.
const GRIP = { transformBox: "view-box" as const, originX: 0.5, originY: 20 / 256 };

const DUR = 1.5;
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Swing only while airborne (the middle of the timeline), settle by landing.
    rotate: [0, 0, -7, 5.5, -3, 1.5, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.18, 0.34, 0.52, 0.7, 0.85, 1] },
  },
};
const handleLift: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -10, -10, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.16, 0.3, 0.78, 1] },
  },
};
const bodyLift: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -9, -10, -10, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.22, 0.34, 0.78, 1] },
  },
};

export const BagIcon = forwardRef<IconHandle, IconProps>(function BagIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BAG} />
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
        <motion.g variants={swing} style={GRIP}>
          <motion.path d={BODY} fillRule="evenodd" variants={bodyLift} />
          <motion.path
            d={HANDLE}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={handleLift}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
});
