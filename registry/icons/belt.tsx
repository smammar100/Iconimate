"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FASTEN — the belt is buckled: the tongue reaches forward across its buckle,
// the strap takes up slack while it is extended, and the leather is let out
// again. The tongue EXTENDS along the axis it already points rather than
// swinging; a hinge on a 40-long tongue reads at 24px as left-right wander,
// while growth along its own axis reads as the thing reaching to engage.
//
// NOTHING HERE IS REBUILT FROM SUB-PATHS. The Phosphor "belt" glyph is a single
// self-crossing compound path, so every moving part is the WHOLE original path
// drawn again and clipped to a box. The clips tile the plane, so the layers
// composite back to the untouched mark — rest is exact by construction rather
// than by tolerance. Verified at 4x supersampling: 0 differing pixels out of
// 49,321 ink pixels. (Splitting the outline into sub-paths was tried first and
// is how rest states drift; the clip route has no such failure mode.)
//
// ANATOMY, measured off the RENDERED FILL with isPointInFill — the `d` string
// traces one loop that zigzags between the strap's top and bottom walls and
// tells you nothing true about structure:
//
//   strap      hollow band x0..248, y80..176, walls 16 thick, round caps
//   buckle     frame x96..192, y72..184; window x112.5..176, y88.5..167.5
//   tongue     x136..176, y120..136 — rooted in the buckle's RIGHT wall,
//              pointing LEFT, tip rounded (r8 about 144,128)
//   keeper     the loop at x48..64 crossing the strap, nubs y72..80 / y176..184
//   belt hole  the empty compartment x64..96, y96..160
//
// EVERY NUMBER IS DERIVED FROM THAT.
//   · the tongue is 40 long from its root at x176, so reaching to x costs a
//     scaleX of (176 - x)/40. SPAN = 1.5875 lands the tip on x112.5, the far
//     wall of the window: the whole reach the frame allows, so the tongue
//     spans its buckle and stops at the far side instead of crossing it;
//   · SEAT = 0.962 is a 1.5-unit recoil off that wall — a seat, not a bounce;
//   · CINCH = 16 is one wall thickness, the glyph's own stroke weight, so the
//     belt takes up exactly one thickness of slack per side.
//
// BOTH ENDS DRAW IN, NOT JUST ONE. Pulling only the left tail shortens the
// glyph off-centre, which at ship size reads as a clipping bug rather than as
// a strap being tightened. The frame strip caught that; symmetric reads right.
const BELT =
  "M248,160H192V96h56a8,8,0,0,0,0-16H189.83A16,16,0,0,0,176,72H112a16,16,0,0,0-13.83,8H64a8,8,0,0,0-16,0H8A8,8,0,0,0,8,96H48v64H8a8,8,0,0,0,0,16H48a8,8,0,0,0,16,0H98.17A16,16,0,0,0,112,184h64a16,16,0,0,0,13.83-8H248a8,8,0,0,0,0-16ZM64,96H96v64H64Zm48,72V88h64v32H144a8,8,0,0,0,0,16h32v31.8c0,.07,0,.13,0,.2Z";

const FULL_BOX = "M0,0H256V256H0Z";
const rect = (x: number, y: number, w: number, h: number) => `M${x},${y}H${x + w}V${y + h}H${x}Z`;

// The tongue, clipped short of the wall it is rooted in so the wall stays put.
// The clip sits INSIDE the transformed group, so it is applied in unscaled
// local coordinates and the extension is never cut off by its own box.
const TONGUE = rect(132, 114, 44, 28);
const TAIL_L = rect(-8, 56, 104, 144); // x-8..96, out to the buckle
const TAIL_R = rect(192, 56, 72, 144); // x192..264, from the buckle out

// The tongue grows forward from where it meets the buckle's right wall.
const ROOT = { transformBox: "view-box" as const, originX: 176 / 256, originY: 128 / 256 };

const SPAN = 1.5875; // (176 - 112.5) / 40 — tip lands on the window's far wall
const SEAT = 0.962; // (40 - 1.5) / 40 — the recoil off it
const CINCH = 16; // one wall thickness of slack, per side

// ANTICIPATION: the tongue draws back to 0.94 before it shoots forward. A thing
// about to extend loads first, and the pull-back is what makes the reach read
// as caused rather than as a value changing.
// AN ESCAPEMENT, not a slide: coming home it goes impulse → recoil → settle, so
// the return reaches zero speed at its landing and actually clicks.
const tongue: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.94, SPAN, SPAN, SPAN, SEAT, 1.018, 1, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.06, 0.24, 0.4, 0.62, 0.72, 0.78, 0.84, 1],
      ease: [
        "easeIn", //    load — the tongue draws back
        "easeOut", //   shoot forward to the far wall
        "linear", //    held, engaged
        "linear", //    still engaged while the belt is pulled
        "easeIn", //    impulse home, past rest
        "easeOut", //   recoil off the seat
        "easeInOut", // settle
        "linear", //    held, done
      ],
    },
  },
};

// The belt does not rewind the way it came: once the tongue is home the leather
// RELAXES out — slower, ease-out, a different character from the pull — so the
// return reads as the belt being let out rather than the gesture played
// backwards. `dir` is +1 for the left end, -1 for the right; they mirror.
const cinch = (dir: 1 | -1): Variants => ({
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, dir * CINCH, dir * CINCH, dir * CINCH, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.24, 0.56, 0.62, 0.84, 1],
      ease: ["linear", "easeInOut", "linear", "linear", "easeOut"],
    },
  },
});
const cinchLeft = cinch(1);
const cinchRight = cinch(-1);

export const BeltIcon = forwardRef<IconHandle, IconProps>(function BeltIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/:/g, "");
  const bodyClip = `belt-body-${uid}`;
  const tongueClip = `belt-tongue-${uid}`;
  const leftClip = `belt-left-${uid}`;
  const rightClip = `belt-right-${uid}`;

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d={BELT} />
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
        <defs>
          <clipPath id={bodyClip} clipPathUnits="userSpaceOnUse">
            <path clipRule="evenodd" d={`${FULL_BOX} ${TONGUE} ${TAIL_L} ${TAIL_R}`} />
          </clipPath>
          <clipPath id={tongueClip} clipPathUnits="userSpaceOnUse">
            <path d={TONGUE} />
          </clipPath>
          <clipPath id={leftClip} clipPathUnits="userSpaceOnUse">
            <path d={TAIL_L} />
          </clipPath>
          <clipPath id={rightClip} clipPathUnits="userSpaceOnUse">
            <path d={TAIL_R} />
          </clipPath>
        </defs>

        {/* The ends slide UNDER the buckle, so the body is painted over them. */}
        <motion.g variants={cinchLeft}>
          <g clipPath={`url(#${leftClip})`}>
            <path d={BELT} />
          </g>
        </motion.g>
        <motion.g variants={cinchRight}>
          <g clipPath={`url(#${rightClip})`}>
            <path d={BELT} />
          </g>
        </motion.g>

        <g clipPath={`url(#${bodyClip})`}>
          <path d={BELT} />
        </g>

        <motion.g variants={tongue} style={ROOT}>
          <g clipPath={`url(#${tongueClip})`}>
            <path d={BELT} />
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
