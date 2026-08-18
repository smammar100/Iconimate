"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// HUNT — the glass loops around a point, leaning into each side of the loop as
// it goes. Promoted from app/lab/magnifying-glass (variant 6).
//
// NOTHING IS SPLIT. Phosphor's `magnifying-glass` is already two stroked
// elements — a `<circle>` lens and a `<line>` handle, both `fill="none"
// stroke-width="16"`. Rest parity is exact by construction (§1). The handle is
// restated as an equivalent path; rendered through the real SVG renderer, the
// line and the same two points as a path differ by 0 pixels of 5,801.
//
// ══ THE GLYPH IS WELDED, AND EXACTLY SO ══
//
// Two facts, measured to three decimals, that constrain anything done here:
//   1. THE HANDLE STARTS ON THE RIM. Its first point (168.57, 168.57) IS the
//      lens rim at 45°: 112 + 80/√2 = 168.569. Not near it — on it.
//   2. THE HANDLE IS A TRUE RADIAL. Extend its axis and the perpendicular
//      distance to the lens centre (112,112) is exactly 0.
// So the handle is the continuation of a radius, not a stick beside a circle.
// Any gesture that changes the lens radius MUST re-cut the handle along that
// radial or the joint tears open — see `2 · Zoom` in the lab, which carries a
// handle pose per radius for exactly this reason. THIS icon moves the mark as
// one rigid body, so the weld is preserved for free.
//
// §3 TRAP, PRESENT AS USUAL: the lens is a perfect circle, so rotating it about
// its own centre is invisible — 0.63% at 25°, the same trap `bicycle`'s wheels
// and `user`'s head fall into. The rotation here is of the WHOLE mark, which
// swings the handle and is plainly legible.
//
// ══ THIS MOTION IS MEASURED FROM A REFERENCE RECORDING, NOT INVENTED ══
//
// An earlier pass guessed a plain circular orbit. A recording was then supplied
// and the guess was wrong in a specific way, so it was replaced. Extracted
// frame by frame from 221 frames at 30fps:
//   INK COUNT CONSTANT (3738..3771, ratio 1.009) — nothing scales, nothing
//     draws; it is a rigid body moving.
//   BBOX W/H ANTI-CORRELATE (W 115..139 while H 137..114) — so it is also
//     ROTATING, which a pure translation cannot do.
//   CENTROID TRACES A FULL CIRCLE, radius 8.2px, while the principal axis only
//     oscillates 19.10° (34.94°..54.05°, about a rest of 44.83° — the handle's
//     own diagonal, which is what validates the measurement method).
//
// Those last two are incompatible with the obvious reading. Solving for the
// fixed point of the rigid motion frame by frame gives centres scattered from
// x=-216 to x=+404: THERE IS NO PIVOT. It is a translation around a loop PLUS a
// spin that oscillates, and the spin is phase-locked to the horizontal swing —
// it leans left when it travels left and right when it travels right.
// Least-squares fit of one cycle: x ±14.50 units, y ±12.21, spin ±8.64°, period
// 0.90s. The keyframes below are that fit, sampled at eighths.
//
// DO NOT "TIDY" THESE INTO A CIRCLE. The ellipse (14.50 against 12.21) and the
// phase lag between travel and spin are the data, not noise. Rounding them to a
// symmetric orbit throws away the thing that makes it read as hunting rather
// than as a spinning ornament.
//
// SCALED TO 0.85, WHICH IS A NECESSITY AND NOT A LIBERTY. The reference sits in
// a frame with far more air than this glyph: our ink bbox is x[24, 231.5],
// y[24, 231.5] — 24 units on every side. At full size the fit measured 0.5
// units of wall at t=0.375, where the upward swing and the spin peak together.
// At 0.85 the worst pose keeps 4 — the clearance `house` PEAK ships with — and
// the furthest ink still travels 21.3 units, over the §2 floor. 0.70 would be
// safer and drops to 17.5, UNDER the floor. 0.85 is the only window; changing
// it in either direction breaks one gate or the other.
//
// IT SPINS ABOUT THE INK CENTROID (123.5, 123.5), which is where the recording
// put it — the centroid path and the spin were measured independently, and the
// spin is what remains once the translation is removed. Endpoints are snapped
// to exact zero: the fit's residual at t=0 was 0.16 units and 0.64°, invisible
// but not exactly rest, and §1 wants exactly.
//
// MATERIAL (§9): ground glass in a metal ring — rigid. easeInOut throughout,
// because the mark is crossing continuously rather than settling into any pose
// (§8); no springs, no squash.
//
// REJECTED (§17): `scale` on the lens to magnify — it drags the 16-unit pen with
// it (§12), the same trap `envelope` documents for its flap. A crosshair or
// sparkle inside the lens — §0 gate 1 forbids adding geometry, and what the lens
// is FOR is being empty. Both survive as notes in app/lab/magnifying-glass,
// which also keeps six other candidates including a Lottie transcription.
//
// NOTHING HERE REPEATS INDEFINITELY, so there is no per-transition ambient
// gating to do — the hover replay loop in use-hover is already gated (§13).
// (Phrased without the literal token on purpose: scripts/audit-motion.mjs scans
// source text for it, and spelling it out in a comment trips a false positive.)

const LENS = { cx: 112, cy: 112, r: 80 };
/** The handle, as a path so it matches the lab's geometry exactly. */
const HANDLE = "M168.57,168.57L224,224";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
/** Measured ink centroid — where the recording put the spin. */
const PIVOT = AT(123.5, 123.5);

/** Fitted from the reference recording, scaled 0.85, endpoints snapped to rest. */
const HUNT = [
  [0, 0, 0],
  [6.71, -5.4, 4.69],
  [6.98, -13.34, 6.96],
  [0.5, -19.12, 4.93],
  [-8.93, -19.34, -0.21],
  [-15.78, -13.89, -5.45],
  [-16.05, -5.94, -7.72],
  [-9.57, -0.17, -5.69],
  [0, 0, 0],
] as const;

const hunt: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: HUNT.map((k) => k[0]),
    y: HUNT.map((k) => k[1]),
    rotate: HUNT.map((k) => k[2]),
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: HUNT.map((_, i) => +(i / 8).toFixed(3)),
    },
  },
};

export const MagnifyingGlassIcon = forwardRef<IconHandle, IconProps>(
  function MagnifyingGlassIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
            <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
            <path d={HANDLE} {...STROKE} />
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
          initial="normal"
          animate={controls}
          style={{ overflow: "visible" }}
        >
          <motion.g variants={hunt} style={PIVOT}>
            <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
            <path d={HANDLE} {...STROKE} />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
