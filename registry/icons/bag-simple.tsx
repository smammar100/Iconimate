"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// LIFT + SWING — the full pick-up, same gesture as the bag icon. The handle
// rises first with the body hanging a beat behind, the airborne bag swings
// twice about the grip, then it lowers and settles.
//
// Bag Simple is the bag glyph without the handle's in-body tabs. Split:
//   BODY   — the satchel outline (outer r16 / sharp inner corners), even-odd
//            from the glyph's own boundary shapes.
//   HANDLE — the arch as a 16-wide stroke (centerline r40 ⇒ outer r48 /
//            inner r32), its ends run to y76 so they stay buried inside the
//            top bar (y64–80) through the handle's ±3px lag against the body.
const BODY =
  "M216,64H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM216,200H40V80H216Z";
const HANDLE = "M88,76V64a40,40,0,0,1,80,0V76";
// Full original glyph, for the reduced-motion static render.
const BAG_SIMPLE =
  "M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H216Z";

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

export const BagSimpleIcon = forwardRef<IconHandle, IconProps>(function BagSimpleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BAG_SIMPLE} />
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
            variants={handleLift}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
});
