"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPIN-DOWN — the gear is driven hard, released, and coasts to a stop on its own
// inertia, stalling just short of a tooth before the detent pulls it the last few
// degrees in.
//
// VERB: it TURNS UNDER LOAD. Not "spins" — a gear that free-spins is a fidget toy;
// a gear that coasts, stalls and seats is a mechanism.
//
// MATERIAL: mechanical / geared (MOTION.md §9) — linear between keys, and ZERO
// overshoot past the target. A gear that springs past its detent reads as
// stripped, not as playful.
//
// Promoted from `app/lab/gear/page.tsx` (variant 4 of 5); the other four takes,
// and the measurements below, are documented there at length.
//
// ── MEASURED (rasterised at 512x512 / 1024x1024, counting only pixels that flip
//    ink/no-ink so antialiasing cannot inflate the figure) ────────────────────
//
//   ink bbox   x23.5..232, y23.5..232.5 → centre (127.75, 128), the artboard
//              centre to within a quarter unit, so the rotation does not wobble.
//   EIGHT TEETH, centres at 22.5deg + k*45, tip radius 108.25, valley floor 87.75.
//   Rotate the mark and diff it against rest:
//
//        45deg -> 0.46%      90deg -> 0.59%      180deg -> 0.73%
//        22.5deg -> 93.94%   30deg -> 84.27%     15deg -> 84.25%
//
//   A 45deg turn maps the gear onto itself almost exactly, so ANY multiple of 45
//   is a settled pose that reads as "at rest". A HALF-tooth is 93.94% different —
//   a plainly broken picture. The gesture therefore lands only on multiples of 45.
//
// ── WHY THE KEYFRAMES LOOK LIKE THIS ───────────────────────────────────────
//
// THE DECAY LIVES IN THE KEYFRAME SPACING, NOT IN AN EASE. Near-equal time steps
// with shrinking angular steps — 108, 90, 72, 45, 27, 14 degrees — is what
// momentum bleeding off actually looks like. An ease-out over a single 360 gives
// the same start and end and a visibly different middle: smooth, where a coasting
// mass is lumpy. `linear` between the keys, because between two keys the rate IS
// constant (§8: linear is for rotation and progress, and this is both).
//
// THE LAST 7deg IS THE WHOLE IDEA. The coast dies at 353 — seven degrees short of
// a tooth — holds there for 0.14 of the pass, then CLICKS the rest of the way in
// under ARRIVE. A mechanism running out of energy does not glide to a halt on its
// detent; it stalls just off it and gets pulled the last few degrees by the detent
// itself. Remove that hold and the whole thing collapses back into an ease-out.
//
// Amplitude (§2): tips at r=108.25 → 1 unit of arc = 0.529deg, so the 18-unit floor
// is cleared by anything over 9.6deg. The full turn is 360deg (~680 units). Even
// the closing 7deg click is 13 units — under the floor on its own, and correct as
// §2's exception: secondary detail riding a primary that clears it fortyfold.
//
// ── WHY `normal` PARKS ON 360 AND NOT 0 ────────────────────────────────────
//
// Because 360 IS rest (0.00% — it is the same angle) and, more usefully, so is
// every multiple of 45. Parking `normal` at 0 would make RETURN_TRANSITION play
// the whole turn BACKWARDS on mouse-out: a gear visibly un-turning, the single
// worst thing this icon could do. Parked at 360, hover-out after the gesture
// completes is a no-op, and hover-out MID-gesture completes the turn FORWARD to
// the detent instead of reversing it. Machines finish their stroke.
//
// The one cost, stated plainly: an interrupt in the first ~10% of the pass has to
// travel nearly the whole way round to reach 360, so a very fast in-and-out flick
// shows a quick forward turn rather than nothing. That is still a forward turn
// landing on a settled pose — a valid exit either way (§13).
//
// ── REJECTED, with the measurement that killed it (§17) ────────────────────
//
//   · ANIMATING THE HUB RING SEPARATELY — counter-rotating it against the rim,
//     the obvious "two moving parts" idea. The ring is a perfect circle: rotated
//     45deg it differs from itself by 0.00%. Invisible at any angle and any speed
//     (§3), exactly the trap `bicycle`'s wheels fell into. DO NOT RE-TRY. The ring
//     rides inside the rotating group because that is geometrically true, not
//     because it contributes motion.
//   · PAUSING AT 22.5deg to sit "between teeth". 93.94% off rest — it does not
//     read as a gear mid-travel, it reads as a rendering fault.
//   · OVERSHOOTING the landing with OVERSHOOT_BACK. Correct for `heart`, wrong
//     here: §9 puts mechanical overshoot at 0%. The gesture decelerates INTO its
//     detent and stops; it never passes it, so it never lands on a wrong pose.
//   · LIFTING ONE TOOTH OUT to animate it alone. The cog is a single stroked `d`
//     whose eight outer arcs are relative (`a99.43,...`), positioned by the running
//     current point; and a lifted tooth would need end caps the source mark does
//     not have. The teeth move as a body, or not at all.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// THE FIFTIETH HOVER. At 1.4s this is Expressive tier (§8), and `gear` is a
// settings icon — the one most likely to sit in a toolbar and fire all day, which
// is exactly the room a long gesture fails in. Resolved on the grounds that the
// length here is not decoration but the content: the pass is one continuous
// decelerating turn with a single hold in it, so at any moment it is either
// visibly slowing or visibly stopped. Nothing repeats, nothing waits for
// attention, and it never loops. The hit area is fixed (pure rotation about the
// centre, max ink radius 108.25 < 128, so it cannot leave the box or move out from
// under the cursor), and every exit lands on a multiple of 45 — i.e. on the
// resting picture.
//
// Peripheral vision passes trivially: there is no ambient layer, no accent, and no
// `repeat` anywhere in the file, so nothing moves unless the user is pointing at it.

const COG =
  "M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z";

// The mark is stroked (fill none), not a filled compound path, so the gesture
// transforms it as a body rather than faking a draw (§5).
const HUB_R = 40;
const STROKE = 16;

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const CENTRE = AT(128, 128); // the measured symmetry centre, not a guess

const spinDown: Variants = {
  normal: { rotate: 360, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 108, 198, 270, 315, 342, 353, 353, 360],
    transition: {
      duration: 1.4,
      times: [0, 0.1, 0.2, 0.31, 0.43, 0.56, 0.72, 0.86, 1],
      ease: ["linear", "linear", "linear", "linear", "linear", "easeOut", "linear", ARRIVE],
    },
  },
};

export const GearIcon = forwardRef<IconHandle, IconProps>(function GearIcon(
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
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="128" cy="128" r={HUB_R} />
          <path d={COG} />
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
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
      >
        {/* Hub and cog turn as one body — the hub is a perfect circle and shows no
            rotation of its own (0.00% at 45deg), so it is here for fidelity, not
            for motion. */}
        <motion.g variants={spinDown} style={CENTRE}>
          <circle cx="128" cy="128" r={HUB_R} />
          <path d={COG} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
