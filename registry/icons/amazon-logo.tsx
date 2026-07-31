"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW + KNOCK — the smile is an arrow, it gets drawn a → z, and the landing rocks the "a".
//
// The mark contains a real verb, which is why it does not need an invented one: the swoosh
// is an arrow running from the "a" to the "z", ending in its arrowhead. So the arrow writes
// itself left to right while the letter holds still, the head lands last — and only then
// does the letter rock, knocked by the arrival. The previous gesture rocked the whole glyph
// a few degrees on its own: a wobble applied to a noun, decoration that would have looked
// identical pasted onto any logo in the set. Here the same rock survives, but it is now an
// EFFECT with a visible cause, which is the difference between motion and decoration.
//
// Two countable beats: the draw, then the knock. Cause and effect, not two things at once.
//
// The glyph splits at its own subpath boundaries:
//   ARROW  — the swoosh and its arrowhead (subpath 1).
//   LETTER — the "a" plus its counter (subpaths 2-3, kept together so the winding that
//            punches the hole is exactly the original's).
// ARROW + LETTER recompose the Phosphor glyph exactly; nothing is added or redrawn.
const ARROW =
  "M248,168v32a8,8,0,0,1-16,0V187.31l-2.21,2.22C226.69,192.9,189.44,232,128,232c-62.84,0-100.38-40.91-101.95-42.65A8,8,0,0,1,38,178.65C38.27,179,72.5,216,128,216s89.73-37,90.07-37.36a3.85,3.85,0,0,1,.27-.3l2.35-2.34H208a8,8,0,0,1,0-16h32A8,8,0,0,1,248,168Z";
const LETTER =
  "M160,94.53V84A36,36,0,0,0,91.92,67.64a8,8,0,0,1-14.25-7.28A52,52,0,0,1,176,84v92a8,8,0,0,1-16,0v-6.53a52,52,0,1,1,0-74.94ZM160,132a36,36,0,1,0-36,36A36,36,0,0,0,160,132Z";

// Full original glyph, for the reduced-motion static render.
const AMAZON_LOGO = ARROW + LETTER;

// The reveal is a hard-edged wipe rather than a stroke traced along a spine, and that is a
// deliberate choice: the swoosh is MONOTONIC IN X (every x carries exactly one band of the
// curve), so sweeping a straight edge across it uncovers the shape in the same order a pen
// would lay it down — while guaranteeing the rest state is the untouched path. A stroked
// spine has to be fat enough to cover the glyph everywhere along its length, and anywhere
// it falls short leaves a permanent notch in the resting icon.
//
// The mask rect spans x[-256,0] and is translated right; its right edge is the pen tip.
// At x=256 it covers the whole artboard, so the arrow is fully revealed — the resting
// state is the plain filled path, pixel for pixel.
const WIPE_FROM = 0;
const WIPE_TO = 256;
const DRAW = 0.85;

// Never linear — a pen leaves fast and eases into its stop; linear reads as a progress bar.
const reveal: Variants = {
  normal: { x: WIPE_TO, transition: RETURN_TRANSITION },
  animate: {
    x: [WIPE_FROM, WIPE_TO],
    transition: { duration: DRAW, ease: [0.45, 0, 0.15, 1] },
  },
};

// The letter pivots about its lower centre, where it meets the swoosh.
const LETTER_PIVOT = { x: 0.5, y: 0.8 };

// KNOCK — the rock starts as the arrowhead lands and decays away. Deliberately NO
// anticipation keyframe: a wind-up would say the letter chose to move, and the whole point
// is that the arrow hit it. It starts on the impact and every swing after is smaller.
// The delay sits a hair before the wipe ends, so the knock overlaps the head arriving
// instead of waiting politely for it — contact and reaction should not be separated by a
// gap. Rest is the first and last keyframe, so the between-pass snap has nothing to snap.
const wobble: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, 6, -3.5, 1.5, 0],
    transition: { duration: 0.72, ease: "easeOut", delay: DRAW - 0.06 },
  },
};

export const AmazonLogoIcon = forwardRef<IconHandle, IconProps>(function AmazonLogoIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const maskId = `amazon-wipe-${useId()}`;

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
          <path d={AMAZON_LOGO} />
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
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <motion.rect
              x={-256}
              y={0}
              width={256}
              height={256}
              fill="#fff"
              variants={reveal}
              style={{ transformBox: "view-box" }}
            />
          </mask>
        </defs>
        {/* The letter holds still through the draw — the fixed frame the arrow is read
            against — then rocks once the head lands. */}
        <motion.path
          d={LETTER}
          variants={wobble}
          style={{ transformBox: "view-box", originX: LETTER_PIVOT.x, originY: LETTER_PIVOT.y }}
        />
        <g mask={`url(#${maskId})`}>
          <path d={ARROW} />
        </g>
      </motion.svg>
    </div>
  );
});
