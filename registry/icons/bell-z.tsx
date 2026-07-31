"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// ZZZ — the same gesture as bell-simple-z, on the bell that has a clapper. Two more Z's rise
// off the one the glyph already carries, staggered and shrinking, along the diagonal the
// letter itself contains, while the shell exhales each one out with a small dip. This is the
// second bell in the set that does not ring.
//
// THE Z IS THE SAME LETTER IN THE SAME PLACE as bell-simple-z's — measured, not assumed:
// both span x104..152 y88..152 about a centre of (128,120), and differ by 35 ink pixels out
// of ~32,700, which is the two encodings rounding differently. So the motion transfers
// unchanged and the two icons stay siblings rather than cousins.
//
// THE CLAPPER IS THE TRAP, and it is the one bell-simple-z did not have. The source draws it
// as NEGATIVE SPACE: the collar's dip (r=40, x88.81..167.19) and the tongue (r=24,
// x105.38..150.62) are concentric about (128,192), leaving a wall of exactly 40-24 = 16, the
// icon's stroke weight. Under nonzero the two cancel. So the dip comes OUT of the collar —
// which leaves the plain bell-simple shell — and the clapper is rebuilt as its own annular
// outline, whose white middle is its own hollowness. No mask. Verified:
//
//     SHELL + CLAPPER + Z as ONE path vs the source ... 0 differing pixels
//     the three filled SEPARATELY vs the source ....... 1695 px, max alpha gap 86
//     the source drawn over ITSELF twice (control) .... 5293 px, max alpha gap 64
//
// The first line proves the geometry exactly; the third proves the second is antialias
// compositing rather than error, since painting the identical path twice costs three times
// more. Deriving the subpaths from bell.tsx instead of from this glyph's own data scores 982
// on that first line rather than 0 — the two encode the same outline to different rounding,
// so take the strings from the source you are actually reproducing.
//
// THE GHOSTS ARE ADDED INK, DELIBERATELY, on the precedent of ambulance's speed streaks. Both
// sit at opacity 0 in `normal` AND carry opacity={0} as an attribute, so rest is the untouched
// Phosphor mark and the server-rendered first paint is too — without the attribute the two
// extra Z's flash at full strength before motion hydrates.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · dome r=80 about (128,104), so the shell hangs from its crown (128,24). Rotating shell,
//     clapper and Z together about that crown, the largest angle keeping every sampled point
//     on the artboard is 12.12° — the same cap the rest of the family measures;
//   · the ghosts rise along the Z's CENTRELINE diagonal, 123.69°, (144,96) to (112,144).
//     Measured off the stroke's outer edge instead you get 138.9°, which is the angle of a
//     boundary and not of the letter;
//   · both stay inside the dome's cavity rather than crossing the shell wall, which would read
//     as a rendering fault rather than a dream: 30 and 52 units against clearances of 47.0 at
//     0.8 scale and 57.4 at 0.52.
const SHELL =
  "M221.84,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const CLAPPER = "M167.19,200a40,40,0,0,1-78.38,0L105.38,200a24,24,0,0,0,45.24,0Z";
const Z =
  "M152,144a8,8,0,0,1-8,8H112a8,8,0,0,1-6.65-12.44L129.05,104H112a8,8,0,0,1,0-16h32a8,8,0,0,1,6.65,12.44L127,136h17A8,8,0,0,1,152,144Z";
// Full original glyph, for the reduced-motion static render.
const BELL_Z =
  "M152,144a8,8,0,0,1-8,8H112a8,8,0,0,1-6.65-12.44L129.05,104H112a8,8,0,0,1,0-16h32a8,8,0,0,1,6.65,12.44L127,136h17A8,8,0,0,1,152,144Zm69.84,48A15.8,15.8,0,0,1,208,200H167.19a40,40,0,0,1-78.38,0H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Zm-71.22,8H105.38a24,24,0,0,0,45.24,0ZM208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";

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
// The clapper trails the dip at the family's ratio: 16 of travel goes with 12° of swing, so
// 2.4° gets 3.2. It TRANSLATES rather than rotates — it and the collar are concentric about
// (128,192), so turning it about their shared centre would only slide it along a wall it is
// already parallel to.
const clapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -3.2, 1.1, -2.1, 0],
    transition: { duration: 1.45, times: [0, 0.24, 0.49, 0.72, 1], ease: "easeInOut" },
  },
};

export const BellZIcon = forwardRef<IconHandle, IconProps>(function BellZIcon(
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
          <path d={BELL_Z} />
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
        {/* The clapper and the Z ride inside the shell's group, so they inherit its dip. */}
        <motion.g variants={shell} style={CROWN}>
          <path d={SHELL} />
          <motion.path d={CLAPPER} variants={clapper} />

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
