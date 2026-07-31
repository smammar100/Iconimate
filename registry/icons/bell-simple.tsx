"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING — the same motion principle as bell.tsx and bell-ringing.tsx: the shell rocks about
// its crown, and the clapper bar trails it, sliding under the mouth a beat behind. Sharing
// the spine is the point — the three bells should read as one family, not three ideas.
//
// THIS GLYPH HAS NO WINDING TRAP, which is worth stating because its two siblings do.
// In bell and bell-ringing the clapper is negative space: the collar dips down and the
// tongue sits inside that lobe wound the other way, so under nonzero they cancel and the
// clapper has to be rebuilt as its own outline. Here the collar runs STRAIGHT across at
// y=200 and the bar is a separate rounded capsule at y216..232 — measured, no overlap — so
// filling the two parts independently reproduces the source exactly. Verified: SHELL + BAR
// against the source glyph is 55 differing pixels at a max alpha gap of 63, which is
// antialiasing where fills abut, not geometry. Do not go looking for a lobe to carve here.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · the shell spans x32..224 y24..200 and hangs from its crown (128,24) — the dome is
//     r=80 about (128,104). Rotating shell AND bar together about that crown, the largest
//     angle keeping every sampled point on the artboard is 12.15°, so it swings 12;
//   · the bar's travel is DERIVED FROM THE SHIPPED BELL rather than picked. There the
//     clapper sits 184 units below the crown and travels 16, which is an angular swing of
//     4.99°. This bar sits 200 units below the crown, so the same 4.99° is 17.4 units — it
//     travels 17. That is what makes the family share a motion vocabulary instead of merely
//     looking similar;
//   · the bar has 40 units of clearance before it would reach the dome's footprint edge
//     (x48..208 against the bar's x88..168), so 17 stays comfortably under the mouth.
const SHELL =
  "M221.85,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Z";
// Full original glyph, for the reduced-motion static render.
const BELL_SIMPLE =
  "M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Zm53.85-32A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192ZM208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };

const SWING = 12; // inside the measured 12.15° cap
const TRAVEL = 17; // the shipped bell's 4.99° swing, at this bar's 200-unit radius

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, SWING, -9.5, 7.4, -2.5, 0],
    transition: { duration: 0.85, times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1], ease: "easeInOut" },
  },
};

const clapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // Same sign as the shell's rotation — a shell leaning bottom-right leaves its bar
    // trailing left — peaking ~0.04 of the timeline later, which is what reads as a heavy
    // arm being carried rather than a part welded to the bell.
    x: [0, -TRAVEL, TRAVEL, -14, 9.5, -3.7, 0],
    transition: { duration: 0.85, times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1], ease: "easeInOut" },
  },
};

export const BellSimpleIcon = forwardRef<IconHandle, IconProps>(function BellSimpleIcon(
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
          <path d={BELL_SIMPLE} />
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
        {/* The bar rides inside the shell's group, so its travel is measured relative to the
            shell — the double-pendulum relationship a real bell has, for free. */}
        <motion.g variants={shell} style={CROWN}>
          <path d={SHELL} />
          <motion.path d={BAR} variants={clapper} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
