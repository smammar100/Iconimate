"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING — the clapper crosses, strikes one wall, crosses back and strikes the other; the
// shell only answers once it has been hit.
//
// This replaces a gesture where the SHELL led and the clapper trailed it by a stagger step.
// That ordering is what being shaken looks like. A bell does not ring because someone
// waggled it — it rings because the clapper crosses and strikes, and the shell answers the
// impact. So the shell holds at exactly 0 through the clapper's fall and moves only after
// contact, which is the whole read.
//
// EVERY NUMBER IS READ OFF THE PATH.
//
// The collar's dip (`a40,40,0,0,0,78.38,0`) and the clapper's arcs (r=24) are CONCENTRIC
// about (128,192) — measured, not assumed — leaving a wall of exactly 40-24 = 16 units,
// which is Phosphor's stroke weight. From that:
//   · the clapper's true pivot is (128,192), NOT the collar line at y=200;
//   · about that centre the dip spans 11.55°..168.45° and the clapper 19.50°..160.50°, so
//     there is 7.95° of slack per side. STRIKE = 7.95°, the exact angle at which the
//     clapper's edge meets the wall. Past it the clapper cuts through the outline.
//   · the shell hangs from its crown (128,24) — the dome is r=80 about (128,104);
//   · the glyph's box is x32..224, y24..232, and the largest rotation about the crown that
//     keeps every sampled point on the artboard is 12.20°, so the shell swings 9°.
//
// The clapper lives in the mask, which lives in the shell's group, so its angle is measured
// RELATIVE to the shell — the quantity that decides contact, and the double-pendulum
// relationship a real bell has, for free.
//
// SPLITTING THIS GLYPH IS A TRAP. Dome = subpaths 1+3 and clapper = subpath 2 each FILLED
// adds 528px of ink (0.81% of the box), all in the y192..223 band: subpath 2 sits inside the
// collar's dip lobe wound the other way, so under nonzero they cancel and the clapper is a
// HOLE, not ink — which is what makes the resting bell read as an outline all the way round.
// Fill subpath 2 on its own and a solid blob hangs under the bell. A hole that has to move
// is a mask, so the dome is masked by the clapper and the path inside the mask swings.
const DOME =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";
const CLAPPER = "M128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z";
// Full original glyph, for the reduced-motion static render.
const BELL = DOME + CLAPPER;

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };
const YOKE = { transformBox: "view-box" as const, originX: 0.5, originY: 192 / 256 };

const STRIKE = 7.95; // measured slack between the clapper's edge and the collar wall
const SWING = 9; // shell, inside the 12.20° that keeps the glyph on the artboard

const clapper: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // falls under gravity (ease-in) into the first wall, crosses, hits the far one, decays
    rotate: [0, STRIKE, -STRIKE, 4.6, -2, 0],
    transition: {
      duration: 0.72,
      times: [0, 0.24, 0.48, 0.7, 0.88, 1],
      ease: ["easeIn", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // pinned at 0 until 0.24 — the frame the clapper lands — then recoils and rings down.
    // No anticipation keyframe: a wind-up would say the bell moved itself.
    rotate: [0, 0, -SWING, 6.4, -2.8, 0],
    transition: {
      duration: 0.72,
      times: [0, 0.24, 0.38, 0.62, 0.82, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};

export const BellIcon = forwardRef<IconHandle, IconProps>(function BellIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = `bell-clapper-${useId()}`;

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
          <path d={BELL} />
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
        <motion.g variants={shell} style={CROWN}>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              {/* white keeps, black cuts — the clapper subtracts itself from the collar */}
              <rect x="0" y="0" width="256" height="256" fill="#fff" />
              <motion.path d={CLAPPER} fill="#000" variants={clapper} style={YOKE} />
            </mask>
          </defs>
          <path d={DOME} mask={`url(#${maskId})`} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
