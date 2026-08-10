"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CHARGE — the heart fills from the bottom, and the instant it tops out it comes alive
// with a double heartbeat. Promoted from app/lab/heart (variant 7). Fill, then life.
//
// GLYPH CHANGE, DELIBERATE AND TOWARDS THE SOURCE. The previous heart was a hand-authored
// centreline path ("M128 216C112 204 40 160 40 104a48 48 0 0 1 88-26...") rendered as an
// 18-wide stroke — an approximation of the Phosphor mark, not the mark. This is the
// Phosphor `heart` outline as authored, so rest is now pixel-exact where it previously
// only resembled the source. Consumers upgrading will see the outline change slightly:
// that is the fidelity rule being satisfied, not broken.
//
// THE GLYPH IS A RING, and that is what makes this work: one compound path, a solid heart
// with a smaller heart punched out. The fill is the mark's FIRST SUBPATH on its own
// (`SOLID`) painted over the ring, never the counter dropped back into its hole. Two
// adjacent shapes sharing a boundary give two antialiased edges that do not sum to 1 in
// any renderer, and a pale thread shows along the join; `SOLID` wholly contains the ring,
// so the filled state has one edge and nothing to seam.
//
// THE CLIP IS A TRANSLATED FULL-BLEED RECT, not a rect whose height animates. Height would
// interpolate an attribute; translating a box that already covers the artboard is cheaper
// and exact at both ends. y231 sits on the point of the heart (nothing revealed), y30
// clears the top of the lobes (all revealed). It lives INSIDE the scaled group so the
// level rides the beat with the mark instead of shearing against it.
//
// THE BEAT IS A REAL LUB-DUB: two beats of unequal strength (1.16 then 1.09, roughly 0.6
// of it) with the gap between them shorter than the rest that follows. Even them out and
// the mark throbs like a notification badge instead of beating.
//
// THE OVERLAP IS THE POINT. The anticipation dip lands at 0.411 and the level tops out at
// 0.42, so the heart is already winding up on the last frames of the fill and the beat
// reads as CAUSED by it. Separate them and it becomes two animations played back to back.
//
// OVERFLOW IS MEASURED, NOT ASSUMED. The mark touches x16 and x240, so a 1.16 beat about
// (128,132) puts its edges at -1.9 and 257.9 — 1.9 units outside the viewBox, which at the
// 28px default is 0.21px a side. The standard `overflow: hidden` wrapper is therefore kept:
// there is nothing meaningful to clip. A larger pop would need the wrapper opened up.
const HEART =
  "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z";
// The mark's first subpath alone — the same outline with the hole simply absent.
const SOLID =
  "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z";

// Visual centre: the ink box is y40..231.95, but a heart's mass sits in the lobes, so the
// origin is nudged above the box centre (135.97) to keep the beat from looking bottom-heavy.
const CENTRE = { transformBox: "view-box" as const, originX: 0.5, originY: 132 / 256 };

const level: Variants = {
  normal: { y: 231, transition: RETURN_TRANSITION },
  animate: {
    y: [231, 30, 30, 231],
    transition: { duration: 1.8, times: [0, 0.42, 0.8, 1], ease: ["easeInOut", "linear", "easeIn"] },
  },
};
const body: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 0.95, 1.16, 1.01, 1.09, 1, 1],
    transition: {
      duration: 1.8,
      times: [0, 0.36, 0.411, 0.503, 0.626, 0.697, 0.871, 1],
      ease: ["linear", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};

export const HeartIcon = forwardRef<IconHandle, IconProps>(function HeartIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Every instance needs its own clip id, or the first one in the document captures them
  // all and only one icon on a page animates.
  const clipId = `heart-level-${useId()}`;

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
          <path d={HEART} />
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
          <clipPath id={clipId}>
            <motion.rect x={-20} y={0} width={296} height={280} variants={level} />
          </clipPath>
        </defs>
        <motion.g variants={body} style={CENTRE}>
          <path d={HEART} />
          <g clipPath={`url(#${clipId})`}>
            <path d={SOLID} />
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
