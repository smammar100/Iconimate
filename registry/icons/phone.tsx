"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING — the handset rocks on its own balance point, four times, each swing
// weaker than the last. Promoted from app/lab/phone (variant 1).
//
// ONE PATH, NO PARTS, AND THAT DECIDES THE GESTURE. Phosphor's `phone` is a
// single closed `fill="none" stroke-width="16"` handset outline. There is
// nothing inside it to move — no flap like `envelope`, no door like `house`, no
// head like `user`. §0 gate 1 asks whether the glyph already contains the moving
// part; here the glyph IS the moving part, so the whole mark moves.
//
// That is allowed and is not the lazy option: §15B lists whole-mark rotation as
// shipping in this set (`biohazard`, called the best motion in it) and says it
// fails only "when the mark has an internal part that should have moved
// instead". This mark has none. Rest parity is exact BY CONSTRUCTION (§1) —
// nothing is split, nothing restated — and verified at 512x512 as 0 flipped
// pixels of 40,686.
//
// ══ THIS GLYPH IS THE OPPOSITE PROBLEM FROM `user` AND `users-three` ══
//
// Those marks have circular heads where rotation about the centre is invisible,
// and the fight is to make motion register at all. Here rotation is violently
// legible and the fight is RESTRAINT. Measured against the ink centroid:
//     10° about the centroid changes 77.67% of the ink
//     25° about the centroid changes 139.84%
// (`user`'s head, for comparison: 0.56% at 25°.) The furthest ink sits 161.8
// units from that centroid, so travel is 2.82 UNITS PER DEGREE and the §2
// amplitude floor is cleared at 6.37°. Seven degrees is a legible gesture on
// this glyph; fifteen is a catastrophe. The angles here are single digits
// deliberately, not timidly. Before increasing any of them, multiply by 2.82.
//
// THE PIVOT IS THE MEASURED INK CENTROID, NOT THE ARTBOARD CENTRE. (117.1,
// 138.4) against the box's (128,128). The handset is a diagonal mass carrying
// more weight low and left, so rotating about the artboard centre swings it like
// a signpost; rotating about its own centroid reads as the object turning on its
// balance point. Ten units of difference, entirely visible at this leverage.
//
// THE DECAY IS THE WHOLE CHARACTER (§10). 7° -> 5.5° -> 4.5° -> 2.5°, with the
// intervals between swings widening as the amplitude falls. Even them out and it
// stops being a ring and becomes a notification badge throbbing — the exact
// failure §10 names for `heart`'s lub-dub. Rigid plastic rings and fades; it
// does not oscillate at constant strength.
//
// easeInOut, not ARRIVE: the mark reverses direction repeatedly rather than
// settling into any one position, and §8 gives the symmetric curve to motion
// that crosses and an ARRIVE tail only to motion that lands.
//
// LANE (§4): ink bbox x[32, 231.5], y[24, 223.5] — 32 left, 24.5 right, 24 top,
// 32.5 bottom. At ±7° the mark keeps 21 units of wall on every side. Nothing
// clips and nothing paints outside the box at rest.
//
// NOT A §3 TRAP, UNUSUALLY. The mark is 164% asymmetric under a mirror, so
// unlike `envelope` (0.086%, where `scaleX: -1` is the identity transform) a
// flip here genuinely renders. It is still not used: flipping a handset produces
// a left-handed phone, a different drawing rather than this one animating.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - EMITTED RINGING ARCS beside the handset. Legitimate on precedent —
//     `bell-ringing` ships exactly this under the motion name "emit", and §15B
//     allows detached accents where the mark itself also moves, which this does.
//     Left off to keep the gesture about the handset; it is the first thing to
//     add if this icon ever wants more voice. NOT the same call as the
//     envelope's rejected letter: an abstract accent is not a new object.
//   - A PENDULUM SWING on `springSwing`, as though the handset hung by its cord.
//     §9 puts hanging things on that spring, but the cord is not in the mark and
//     a handset swinging from nothing reads as floating rather than hanging.
//   - ROTATING ABOUT THE ARTBOARD CENTRE. Same gesture, wrong fulcrum; it looks
//     like a signpost turning.
//   - A TRANSLATIONAL BUZZ, which survives as `3 · Buzz` in app/lab/phone. It is
//     a real phone behaviour and it works, but two shakes in one set is the
//     "generic" failure §15 names, and rotation is the one that reads as a
//     handset in a cradle rather than a motor.
//
// MATERIAL (§9): moulded plastic — rigid. easeInOut, no squash, no overshoot. A
// handset that squashes reads as rubber.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do — the hover replay loop in use-hover is already gated.

/** The glyph's own single path, untouched. */
const PHONE =
  "M164.39,145.34a8,8,0,0,1,7.59-.69l47.16,21.13a8,8,0,0,1,4.8,8.3A48.33,48.33,0,0,1,176,216,136,136,0,0,1,40,80,48.33,48.33,0,0,1,81.92,32.06a8,8,0,0,1,8.3,4.8l21.13,47.2a8,8,0,0,1-.66,7.53L89.32,117a7.93,7.93,0,0,0-.54,7.81c8.27,16.93,25.77,34.22,42.75,42.41a7.92,7.92,0,0,0,7.83-.59Z";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
/** Measured ink centroid — the handset's own balance point. Not (128,128). */
const BALANCE = AT(117.1, 138.4);

const ring: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // decaying swings; 7° = 19.8 units of travel, just over the §2 floor
    rotate: [0, -7, 5.5, -4.5, 2.5, 0],
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: [0, 0.16, 0.34, 0.52, 0.7, 1],
    },
  },
};

export const PhoneIcon = forwardRef<IconHandle, IconProps>(function PhoneIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={PHONE} {...STROKE} />
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
        fill="none"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path d={PHONE} {...STROKE} variants={ring} style={BALANCE} />
      </motion.svg>
    </div>
  );
});
