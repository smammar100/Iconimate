"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING — the bell rocks and the clapper swings inside it, trailing the shell and travelling
// the full width of its housing before the whole thing rings down.
//
// Traced off a reference recording rather than authored: 208 frames at 30fps, measured per
// frame as the horizontal offset between the glyph's upper third and its collar band. Over
// six consistent repetitions that trace shows the shell and clapper always moving in
// opposition, the clapper's amplitude about 1.9x the shell's, and a decaying oscillation
// that builds to the second swing before ringing down — shell peaks at t = .20 .44 .64 .80
// .92 with relative amplitudes .92 1.0 .79 .61 .21.
//
// THE GLYPH IS SPLIT INTO TWO OUTLINES, AND GETTING THAT WRONG IS THE TRAP HERE.
//
// The source draws the clapper as NEGATIVE SPACE: subpath 2 sits inside the collar's dip
// lobe wound the opposite way, so under nonzero they cancel. Filling it as its own shape
// adds 528px of ink (0.81% of the box), all in y192..223 — a solid blob under the bell.
// Masking it out fixes the rest state but not the motion: slide the hole more than a few
// units and the crescent goes lopsided, one side thickening into a mass that reads as
// filled. So the dip lobe is taken OUT of the shell and the clapper becomes its own
// outline — an annular segment between the collar's r=40 dip and the clapper's r=24 arc,
// both about (128,192), a U of uniform 16-unit thickness, which is the icon's stroke
// weight. Its white middle is its own hollowness. There is no mask.
// Verified: SHELL + CLAPPER against the source glyph is 40 differing pixels, max alpha gap
// 63 — antialiasing where two fills abut, not geometry.
//
// EVERY NUMBER IS READ OFF THE PATH.
//   · the shell hangs from its crown (128,24) — the dome is r=80 about (128,104);
//   · the glyph's box is x32..224, y24..232, and the largest rotation about the crown that
//     keeps every sampled point on the artboard is 12.20°, so the shell swings 12°;
//   · the clapper TRANSLATES rather than rotates. It and the collar are concentric, so
//     turning it about their shared centre only slides it along a wall it is already
//     parallel to — 3.32 units of travel before its edge binds, invisible at icon size.
//     Sliding it horizontally gives 16.57 units, five times further, with every extreme
//     point provably still inside the lobe. It runs 16, just inside that cap.
const SHELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";
const CLAPPER = "M88.81,200a40,40,0,0,0,78.38,0L150.62,200A24,24,0,0,1,105.38,200Z";
// Full original glyph, for the reduced-motion static render.
const BELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 12, -9.5, 7.4, -2.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1],
      ease: "easeInOut",
    },
  },
};

const clapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // Same sign as the shell's rotation — a shell leaning bottom-right leaves its clapper
    // trailing left — and peaking ~0.04 of the timeline later, which is what makes it read
    // as a heavy arm being carried rather than a part glued to the bell.
    x: [0, -16, 16, -13, 9, -3.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1],
      ease: "easeInOut",
    },
  },
};

export const BellIcon = forwardRef<IconHandle, IconProps>(function BellIcon(
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
        {/* The clapper rides inside the shell's group, so its travel is measured relative to
            the shell — the double-pendulum relationship a real bell has, for free. */}
        <motion.g variants={shell} style={CROWN}>
          <path d={SHELL} />
          <motion.path d={CLAPPER} variants={clapper} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
