"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WELCOME — the roof draws up to a steeper pitch while the door swings in
// behind it, both hold open together, and both come home on the same beat.
// Promoted from app/lab/house (variant 6, which composes that page's
// `1 · Open` with its `2 · Peak`).
//
// THIS MARK IS STROKED, NOT FILLED. Phosphor's `house` is one closed
// `fill="none" stroke="currentColor" stroke-width="16"` loop, traced
// door -> right wall -> roof -> left wall -> back to the door. The door is
// therefore already IN the mark: nothing had to be invented to have something
// to move, which is the first gate in MOTION.md §0.
//
// THE DECOMPOSITION IS MEASURED, NOT EYEBALLED. The loop is cut into three
// open strokes that share endpoints: ROOF (right eave -> apex -> left eave),
// WALLS (the two sides) and DOOR (the doorway U). Cutting a closed path turns
// two round JOINS into four round CAPS at (104,216) and (152,216) — that was
// the failure to check, and it is benign: at a 90° corner the two opposed caps
// reconstruct the join's disc. Rasterised at 512x512, counting only pixels
// that flip ink/no-ink:
//     ROOF + WALLS + DOOR  vs  the original `d`  =  6 / 47,556  =  0.013%
// Antialiasing on the seam, an order of magnitude under the 0.1% threshold
// (§1). Do not re-derive this by eye.
//
// THE EAVES ARE PINNED, AND THAT IS THE WHOLE REASON THIS GESTURE EXISTS. The
// obvious "shelter" idea — lift the roof off the walls — tears the mark open
// at both eaves, because roof and walls are one continuous stroke; a still
// frame 60% through reads as a broken house, not a house (§0 gate 2). Here the
// eave coordinates are literal in BOTH `d` strings, so they are mathematically
// incapable of moving: only the two slope lengths change (80 -> 100). The roof
// steepens instead of detaching, and no frame shows a gap.
//
// IT MORPHS `d` RATHER THAN SCALING Y about the eave line. A non-uniform scale
// on the diagonal slopes distorts the 16-unit pen by ~9%; morphing the path
// keeps the stroke weight exact (§12). The two strings carry identical token
// counts, which is what lets motion interpolate them numerically in place.
//
// THE LAG IS THE COMPOSITION. The roof peaks at 0.30 and the door reaches
// fully open at 0.40 — a 0.10 trail, the top of the follow-through range in
// §10. Run them on identical keyframes and the two parts read as one rigid
// object being scaled; give the door its lag and the house reads as drawing
// itself up first and opening second, which is the order a welcome happens in.
// This is NOT a §11 handoff and deliberately has no beat of stillness between
// the phases: nothing here waits on anything, so they overlap and share one
// return. Sequencing them would stretch a single welcome into two events.
//
// MATERIAL (§9): masonry and timber — rigid. Hence ARRIVE and easeInOut, no
// springs, no overshoot. Nothing squashes and nothing bounces; a house that
// springs past its stop reads as rubber. The door gets easeInOut because it
// moves while on screen and never accelerates out of frame (§8).
//
// AMPLITUDE (§2): the apex travels 20 units (1.9px at 24px) and the door's far
// stile 152 -> 109.8 = 42 units (4.0px). Both clear the 18-unit floor; 5° of
// roof was tried first and came to 16 units, which is invisible.
//
// LANE (§4): ink bbox is x[32, 223.5], y[24, 223.5] — 32 units left, 32.5
// right, 24 top, 32.5 bottom, unusually generous for this set. At full peak the
// apex reaches y4, still 4 units inside the wall, so `overflow: hidden` holds
// and nothing paints outside the box at rest or in motion.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - LIFTING THE ROOF (see above). Tears the mark at both eaves.
//   - SCALING THE HOUSE TALLER to raise the roof without a tear. Non-uniform
//     scale on a rigid mark is stretch, and rigid things do not squash (§9).
//   - A SQUASH-INTO-THE-FOUNDATION settle, same §9 reason. A house is masonry;
//     the barn glyph gets away with it, this one should not.
//   - A DRAW-ON BUILD (walls rise, then the roof lands) — it is honest here,
//     since the mark is natively stroked, and it survives as `3 · Build` in
//     app/lab/house. It is not what shipped: it opens on `pathLength: 0`, so
//     frame 0 is not the icon (§1), which a Home button in a toolbar cannot
//     afford even though blueprint can.
//   - A WHOLE-HOUSE NOD (6° about the ground line), kept as `4 · Nod` in the
//     lab. It clears the amplitude floor, but a tilting building reads as
//     subsidence rather than a greeting in someone else's product.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating
// to do — the hover replay loop in use-hover is already gated.

/** Right eave -> apex -> left eave. The endpoints are the eaves; they never move. */
const ROOF =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120";
/** The same roof with the apex 20 units higher; eave endpoints byte-identical. */
const ROOF_PEAK =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-100a8,8,0,0,0-11.32,0l-80,100A8,8,0,0,0,40,120";
/** Both side walls. */
const WALLS = "M104,216h-64V120M152,216h64V120";
/** The doorway: left jamb, header, right jamb. */
const DOOR = "M104,216V152h48v64";
/** Full original glyph, for the reduced-motion static render. */
const HOUSE =
  "M104,216V152h48v64h64V120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120v96Z";

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
const HINGE = AT(104, 216); // the door's left jamb, where it meets the ground

const DUR = 1.4;
const roof: Variants = {
  normal: { d: ROOF, transition: RETURN_TRANSITION },
  animate: {
    d: [ROOF, ROOF_PEAK, ROOF_PEAK, ROOF],
    transition: { duration: DUR, ease: ARRIVE, times: [0, 0.3, 0.6, 1] },
  },
};
const door: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // opens 0.10 behind the roof's peak — follow-through, not a separate phase
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.4, 0.6, 1] },
  },
};

export const HouseIcon = forwardRef<IconHandle, IconProps>(function HouseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={HOUSE} {...STROKE} />
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
        <motion.path d={ROOF} {...STROKE} variants={roof} />
        <path d={WALLS} {...STROKE} />
        <motion.path d={DOOR} {...STROKE} variants={door} style={HINGE} />
      </motion.svg>
    </div>
  );
});
