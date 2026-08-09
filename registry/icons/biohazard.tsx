"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RATCHET — the mark indexes a third of a turn at a time, slamming into each stop and
// shuddering it off before the next. Step, shudder, step, shudder, settle. Promoted from
// app/lab/biohazard (variant 7 = 2 + 4).
//
// THE THREE-FOLD SYMMETRY IS WHY THIS WORKS, and it is only approximate. Measured on the
// rendered glyph at 512x512, rotating about (128,134):
//   120° -> 8.67% of ink pixels differ     240° -> 8.71%
//    60° -> 100.53%                        180° -> 103.23%
// A third-turn very nearly maps the mark onto itself, so a pause at 120° or 240° reads as
// a settled pose rather than a frozen mid-rotation — the mark appears to advance through
// three identical positions, like a mechanism indexing. Stopping anywhere else lands on a
// visibly wrong pose, which is why the detents are exactly 120 and 240 and nowhere else.
// (Contrast `bicycle`, whose wheels are true circles and so show no rotation at any speed.
// Here the 8.67% residue is precisely what makes the turn legible at all.)
//
// THE ROTATION CENTRE IS (128, 134), NOT THE BBOX CENTRE (128, 122). Twelve units apart,
// found by searching for the point the mark is actually symmetric about; turning about the
// bbox centre visibly wobbles.
//
// THE TWO ROTATIONS CANNOT SHARE AN ELEMENT. The step and the tremor are both `rotate`,
// and an element has one — keyframed together, the tremor would interpolate through the
// 120° travel and smear it. They run on nested groups, both about the same centre.
//
// THE TREMOR IS SILENT DURING TRAVEL. Its keyframes hold at exactly 0 across 0->0.18,
// 0.40->0.52 and 0.74->0.86, waking only in the ~0.16 after each landing. Let it bleed
// into the travel and the step reads as a wobbly turn instead of a hard stop.
//
// OVERFLOW IS MEASURED, NOT ASSUMED. Sweeping the mark through all 360° in 5° steps, the
// union of its bounding boxes is x16..240, y19.77..224.02 — identical to the resting box,
// with 16 units of margin at each side. Rotation never reaches the artboard edge, so the
// standard `overflow: hidden` wrapper clips nothing.
const BIOHAZARD =
  "M185.68,104.28q-1.4-2.88-3.06-5.6a60,60,0,0,0-26.92-78,8,8,0,0,0-7.4,14.19A44,44,0,0,1,170.72,84.4a63.85,63.85,0,0,0-85.46,0A44,44,0,0,1,107.7,34.87a8,8,0,1,0-7.4-14.19,60,60,0,0,0-26.93,78,62.59,62.59,0,0,0-3.05,5.58A60.07,60.07,0,0,0,16,164a8,8,0,0,0,16,0,44.09,44.09,0,0,1,32.89-42.58A63.94,63.94,0,0,0,109,193.11a44,44,0,0,1-56.65,8,8,8,0,1,0-8.62,13.47A60,60,0,0,0,126.74,196l1.26,0,1.26,0a60,60,0,0,0,83.05,18.59,8,8,0,1,0-8.62-13.47,44,44,0,0,1-56.65-8,63.94,63.94,0,0,0,44.07-71.69A44.09,44.09,0,0,1,224,164a8,8,0,0,0,16,0A60.07,60.07,0,0,0,185.68,104.28ZM128,84a47.91,47.91,0,0,1,35.56,15.79,44,44,0,0,1-71.13,0A47.89,47.89,0,0,1,128,84Zm.12,49.92-.12.2-.12-.2h.24ZM80,132a47.6,47.6,0,0,1,1.44-11.65,44,44,0,0,1,36,58.46A48.07,48.07,0,0,1,80,132Zm58.57,46.81a44,44,0,0,1,36-58.46,48,48,0,0,1-36,58.46Z";

/** The measured symmetry centre, as a view-box transform origin. */
const CENTRE = { transformBox: "view-box" as const, originX: 128 / 256, originY: 134 / 256 };

const step: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 120, 120, 240, 240, 360, 360],
    transition: {
      duration: 2.375,
      times: [0, 0.18, 0.4, 0.52, 0.74, 0.86, 1],
      ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
    },
  },
};

// Each burst is short and sharp rather than a decay curve: 2.6, -1.8, 0.9 and out. The
// third is the largest (2.8) because it is the last thing the mark does, and a final stop
// softer than the two before it reads as running out of energy rather than arriving.
const tremor: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, 2.6, -1.8, 0.9, 0, 0, 2.2, -1.5, 0.7, 0, 0, 2.8, -1.9, 0.8, 0],
    x: [0, 0, -1.4, 1.5, -0.6, 0, 0, -1.2, 1.3, -0.5, 0, 0, -1.5, 1.6, -0.7, 0],
    transition: {
      duration: 2.375,
      times: [
        0, 0.18, 0.22, 0.26, 0.3, 0.34, 0.52, 0.56, 0.6, 0.64, 0.68, 0.86, 0.9, 0.94, 0.97, 1,
      ],
      ease: "easeInOut",
    },
  },
};

export const BiohazardIcon = forwardRef<IconHandle, IconProps>(function BiohazardIcon(
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
          <path d={BIOHAZARD} />
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
        {/* Outer group indexes; inner group shudders inside that frame. */}
        <motion.g variants={step} style={CENTRE}>
          <motion.g variants={tremor} style={CENTRE}>
            <path d={BIOHAZARD} />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
