"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RING + EMIT — this glyph is bell-simple's straight collar and bar wearing bell-ringing's
// two sound arcs, so it gets both of their motions: the shell rocks about its crown with the
// bar trailing underneath, and the arcs travel outward and fade back twice.
//
// All four bells now share one spine, which is the point. A set where each icon invents its
// own gesture is four ideas; a set where the shell/clapper relationship is identical and only
// the extra parts differ is one idea, stated four ways.
//
// NO WINDING TRAP HERE, and that is worth stating because half the family has one. In bell
// and bell-ringing the clapper is negative space — the collar dips and the tongue sits inside
// that lobe wound the other way, cancelling under nonzero — so it has to be rebuilt as its
// own outline. Here, as in bell-simple, the collar runs STRAIGHT across at y=200 and the bar
// is a separate capsule at y216..232 with no overlap, so filling the parts independently
// reproduces the source. Verified: SHELL + BAR + ARC_R + ARC_L against the source glyph is
// 65 differing pixels at a max alpha gap of 63 — antialiasing where fills abut, not geometry.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · the dome is r=80 about (128,112), so the shell hangs from its crown (128,32). Rotating
//     shell AND bar together about that crown, the largest angle keeping every sampled point
//     on the artboard is 12.90°, so it swings 12;
//   · the bar's travel is DERIVED FROM THE SHIPPED BELL rather than picked. There the clapper
//     sits 184 units below the crown and travels 16 — an angular swing of 4.99°. This bar
//     sits 192 units below its crown, so the same 4.99° is 16.7 units: it travels 17. That is
//     what makes the family share a motion vocabulary instead of merely looking alike;
//   · the arcs are concentric on the dome centre (128,112) and scale about it, so they move
//     along their own radius rather than merely enlarging. The cap before they leave the box
//     is 1.165, so they peak at 1.14.
//
// The arcs are PART OF THE SOURCE GLYPH, not added ink, so they rest at scale 1 and opacity
// 1 — the resting icon is the untouched Phosphor mark, arcs included.
const ARC_R =
  "M227.39,60.32a111.36,111.36,0,0,0-39.12-43.08,8,8,0,1,0-8.54,13.53,94.13,94.13,0,0,1,33.46,36.91,8,8,0,0,0,14.2-7.36Z";
const ARC_L =
  "M35.71,72a8,8,0,0,0,7.1-4.32A94.13,94.13,0,0,1,76.27,30.77a8,8,0,1,0-8.54-13.53A111.36,111.36,0,0,0,28.61,60.32,8,8,0,0,0,35.71,72Z";
const SHELL =
  "M221.81,175.94A16,16,0,0,1,208,200H48a16,16,0,0,1-13.79-24.06C43.22,160.39,48,138.28,48,112a80,80,0,0,1,160,0C208,138.27,212.78,160.38,221.81,175.94Z" +
  "M208,184c-10.64-18.27-16-42.49-16-72a64,64,0,0,0-128,0c0,29.52-5.38,53.74-16,72Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z";
// Full original glyph, for the reduced-motion static render.
const BELL_SIMPLE_RINGING =
  "M168,224a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224ZM227.39,60.32a111.36,111.36,0,0,0-39.12-43.08,8,8,0,1,0-8.54,13.53,94.13,94.13,0,0,1,33.46,36.91,8,8,0,0,0,14.2-7.36ZM35.71,72a8,8,0,0,0,7.1-4.32A94.13,94.13,0,0,1,76.27,30.77a8,8,0,1,0-8.54-13.53A111.36,111.36,0,0,0,28.61,60.32,8,8,0,0,0,35.71,72Zm186.1,103.94A16,16,0,0,1,208,200H48a16,16,0,0,1-13.79-24.06C43.22,160.39,48,138.28,48,112a80,80,0,0,1,160,0C208,138.27,212.78,160.38,221.81,175.94ZM208,184c-10.64-18.27-16-42.49-16-72a64,64,0,0,0-128,0c0,29.52-5.38,53.74-16,72Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 32 / 256 };
const DOME = { transformBox: "view-box" as const, originX: 0.5, originY: 112 / 256 };

const SWING = 12; // inside the measured 12.90° cap
const TRAVEL = 17; // the shipped bell's 4.99° swing, at this bar's 192-unit radius
const LOUD = 1.14; // inside the measured 1.165 scale cap

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

// Both arcs travel out and back, twice. Two passes rather than one, because a single
// expansion reads as a throb where two read as sound leaving. They return to scale 1 /
// opacity 1 inside the animation — they are part of the glyph, so rest must be untouched.
const arcs: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, LOUD, 1, LOUD, 1],
    opacity: [1, 0.25, 1, 0.35, 1],
    transition: { duration: 0.85, times: [0, 0.22, 0.44, 0.66, 1], ease: "easeInOut" },
  },
};

export const BellSimpleRingingIcon = forwardRef<IconHandle, IconProps>(
  function BellSimpleRingingIcon({ size = 28, style, ...props }, ref) {
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
            <path d={BELL_SIMPLE_RINGING} />
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
          {/* The arcs sit OUTSIDE the shell group: sound does not swing with the thing
              emitting it, and a fixed reference is what makes the shell's rock readable. */}
          <motion.g variants={arcs} style={DOME}>
            <path d={ARC_L} />
            <path d={ARC_R} />
          </motion.g>

          <motion.g variants={shell} style={CROWN}>
            <path d={SHELL} />
            <motion.path d={BAR} variants={clapper} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
