"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ZZZ — the bell is asleep, so two more Z's rise off the one the glyph already has, staggered
// and shrinking, along the diagonal the letter itself contains. The shell exhales each one out
// with a small dip. Nothing here is a ring: this is the one bell in the set that does not.
//
// THE GHOSTS ARE ADDED INK, DELIBERATELY. They exist only mid-gesture — both sit at opacity 0
// in the `normal` variant AND carry opacity={0} as an attribute, so the resting icon is the
// untouched Phosphor mark to the pixel and the server-rendered first paint is too. Skip the
// attribute and the two extra Z's flash at full strength before motion hydrates. The precedent
// for transient ink is ambulance's speed streaks.
//
// THE GLYPH SPLITS CLEANLY — no winding trap, unlike bell and bell-ringing where the clapper is
// negative space. Shell, bar and Z are disjoint: the collar runs straight across at y=200, the
// bar is a separate capsule at y216..232, and the Z floats inside the cavity touching nothing.
// Verified, and the control is the point:
//
//     SHELL + BAR + Z as ONE path vs the source ....... 0 differing pixels
//     the three filled SEPARATELY vs the source ....... 1101 px, max alpha gap 75
//     the source drawn over ITSELF twice (control) .... 4695 px, max alpha gap 64
//
// The first line proves the geometry; the third proves the second is antialias compositing
// rather than error, since drawing the identical path twice costs MORE. Do not go hunting for
// a missing subpath.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · the bell is bell-simple: dome r=80 about (128,104), hanging from its crown (128,24);
//   · the Z spans x104..152 y88..152, so its centre is (128,120) — the ghosts scale about it;
//   · the Z's diagonal runs 123.69° along its CENTRELINE, (144,96) to (112,144). Measure it off
//     the stroke's outer edge instead and you get 138.9°, which is the angle of a boundary and
//     not of the letter — an easy and wrong reading. The ghosts rise along the centreline;
//   · both stay INSIDE the dome's cavity rather than escaping through the shell wall, which
//     would read as a rendering fault rather than a dream. Clearance along that centreline is
//     47.0 units at 0.8 scale and 57.4 at 0.52, so 30 and 52 are comfortably inside.
const SHELL =
  "M221.84,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Z";
const Z =
  "M144,136H127l23.7-35.56A8,8,0,0,0,144,88H112a8,8,0,0,0,0,16h17.05l-23.7,35.56A8,8,0,0,0,112,152h32a8,8,0,0,0,0-16Z";
// Full original glyph, for the reduced-motion static render.
const BELL_SIMPLE_Z =
  "M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Zm-24-88H127l23.7-35.56A8,8,0,0,0,144,88H112a8,8,0,0,0,0,16h17.05l-23.7,35.56A8,8,0,0,0,112,152h32a8,8,0,0,0,0-16Zm77.84,56A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192ZM208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };
const ZC = { transformBox: "view-box" as const, originX: 0.5, originY: 120 / 256 };

// The Z's centreline diagonal, as a unit vector pointing up-right along it.
const UP_RIGHT = -56.31; // = 123.69° - 180°
const drift = (d: number) => ({
  x: Math.cos((UP_RIGHT * Math.PI) / 180) * d,
  y: Math.sin((UP_RIGHT * Math.PI) / 180) * d,
});

const ghostA: Variants = {
  normal: { opacity: 0, scale: 1, x: 0, y: 0 },
  animate: {
    opacity: [0, 0.55, 0.5, 0],
    scale: [1, 0.86, 0.72, 0.62],
    x: [0, drift(12).x, drift(23).x, drift(30).x],
    y: [0, drift(12).y, drift(23).y, drift(30).y],
    transition: { duration: 1.45, times: [0, 0.22, 0.5, 0.78], ease: "easeOut" },
  },
};
const ghostB: Variants = {
  normal: { opacity: 0, scale: 1, x: 0, y: 0 },
  animate: {
    // trails ghostA by 0.2 of the timeline — a stagger, not a second copy of the same move
    opacity: [0, 0, 0.4, 0.34, 0],
    scale: [1, 1, 0.66, 0.52, 0.42],
    x: [0, 0, drift(24).x, drift(40).x, drift(52).x],
    y: [0, 0, drift(24).y, drift(40).y, drift(52).y],
    transition: { duration: 1.45, times: [0, 0.2, 0.42, 0.68, 0.95], ease: "easeOut" },
  },
};

// A small dip per departure, nothing like the family's ring — this bell is not ringing.
const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2.4, 0.8, -1.6, 0],
    transition: { duration: 1.45, times: [0, 0.2, 0.45, 0.68, 1], ease: "easeInOut" },
  },
};
const bar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -4, 1.4, -2.7, 0],
    transition: { duration: 1.45, times: [0, 0.24, 0.49, 0.72, 1], ease: "easeInOut" },
  },
};

export const BellSimpleZIcon = forwardRef<IconHandle, IconProps>(function BellSimpleZIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

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
          <path d={BELL_SIMPLE_Z} />
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
        {/* The bar and the Z ride inside the shell's group, so they inherit its dip. */}
        <motion.g variants={shell} style={CROWN}>
          <path d={SHELL} />
          <motion.path d={BAR} variants={bar} />

          {/* Transient — opacity 0 at rest, and as an attribute so SSR paints them hidden. */}
          <motion.path d={Z} variants={ghostA} style={ZC} opacity={0} />
          <motion.path d={Z} variants={ghostB} style={ZC} opacity={0} />

          {/* The Z that is really there never moves. */}
          <path d={Z} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
