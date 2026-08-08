"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// RIDE — the bike recoils, surges forward with four streaks tearing off it, then
// brakes: the weight transfers onto the front wheel, the rear lifts, and it rocks
// level at rest.
//
// THE CHOREOGRAPHY IS MEASURED, NOT DESIGNED. It mirrors a reference clip frame
// by frame: 50 frames at 25fps were dumped to raw RGB and thresholded into a
// body mask and an accent mask, then per frame the body's bbox gave its
// displacement and horizontal accent runs >= 30px wide that are absent from the
// settled frames gave the streaks. Three findings shaped the build:
//
//   1. THE BODY ONLY TRANSLATES. Its bbox is 147 wide with its top edge at y=58
//      in ALL 50 frames; only x moves. No rotation, no scale in the source.
//   2. IT RECOILS BEFORE IT SURGES. dx runs 0 -> -21 (frame 11) -> +17 (frame
//      20) -> 0 (frame 31). Backwards first: anticipation, then the drive.
//   3. THE GESTURE ENDS AT FRAME 31. Frames 31-50 are identical to each other —
//      the clip's whole second half is a pedal loop, and this glyph has no
//      pedals. So the gesture is 1.24s and no more.
//
// THE STOP IS BORROWED FROM `airplane-taxiing`, which rolls in decelerating and
// pitches onto the nose as it halts. Same shape — flat while still travelling, a
// dip as weight transfers, a smaller counter-rock, then level — but timed
// against the measured slide: the dip is held until 0.68 because while the bike
// still carries speed there is no weight to transfer, and it lands level exactly
// as travel reaches zero. THE PIVOT IS NOT THE ARTBOARD CENTRE. The front wheel
// is r48 about (208,160), so it meets the ground at (208,208) — and both
// coordinates being 208 means one number serves for x and y. Braking about that
// point lifts the REAR, which is what a bike does; pivoting about the centre
// would sink the front through the road. 3.5 deg already lifts the rear 11 units.
//
// THE LANE COSTS NOTHING IN SIZE — read this before touching the sizing. The
// glyph has NO horizontal lane: its ink bbox is x[0, 255.75], the wheels being
// r48 at (48,160) and (208,160), touching both walls at the equator. It cannot
// travel one unit without clipping, and a streak has nowhere to stream to. The
// body is therefore drawn at 0.824 INSIDE THE VIEWBOX — but the svg element is
// rendered at `size / 0.824` and pulled back by a negative margin of exactly
// half the difference, so:
//
//   · the LAYOUT BOX is `size`, identical to every other icon;
//   · the BODY renders at 0.824 x (size/0.824) = size — the same pixels-per-unit
//     as an unscaled glyph, so it matches its neighbours exactly;
//   · the freed 17.6% becomes real estate OUTSIDE the layout box, which is where
//     the travel and the streaks live.
//
// So this is a rendering-box decision, not a redraw: at rest the icon is the
// untouched Phosphor bicycle at the same size as everything else. Scaling the
// body without the compensating box is what makes it read as ~18% too small in
// a grid — that was shipped once and caught. Change one of the three and you
// must change all three.
//
// THE TRADE IS OVERFLOW, NOT SIZE. Nothing paints outside the layout box at
// rest; only the travel and the streaks use the margin, and only while playing.
// `airplane-taxiing` makes the same trade for the same reason.
//
// 0.824 IS THE CLIP'S OWN NUMBER — 211/256, the reference bike's width as a
// fraction of its frame. It lands the geometry almost exactly on the clip's:
// wheels r39.6 vs 38, centres x62.1/193.9 vs 60/195, hub y154.4 vs 156 — so
// every streak track transfers ~1:1, within about two units.
//
// WHY THE WHEELS DO NOT SPIN. They are plain rings, and a circle rotated about
// its centre IS ITSELF — there is no rotation of this glyph, at any speed, that
// a viewer could see. Making them read as rolling needs spokes, which are not in
// the mark; that was prototyped in `app/lab/bicycle/page.tsx` and not taken.
const BICYCLE =
  "M208,112a47.81,47.81,0,0,0-16.93,3.09L165.93,72H192a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H152a8,8,0,0,0-6.91,12l11.65,20H99.26L82.91,60A8,8,0,0,0,76,56H48a8,8,0,0,0,0,16H71.41L85.12,95.51,69.41,117.06a48.13,48.13,0,1,0,12.92,9.44l11.59-15.9L125.09,164A8,8,0,1,0,138.91,156l-30.32-52h57.48l11.19,19.17A48,48,0,1,0,208,112ZM80,160a32,32,0,1,1-20.21-29.74l-18.25,25a8,8,0,1,0,12.92,9.42l18.25-25A31.88,31.88,0,0,1,80,160Zm128,32a32,32,0,0,1-22.51-54.72L201.09,164A8,8,0,1,0,214.91,156L199.3,129.21A32,32,0,1,1,208,192Z";

const SCALE = 0.824;
/** Phosphor's stroke is 16; a streak beside a scaled body must match it. */
const WEIGHT = 16 * SCALE;
/** The front wheel's contact patch, in view-box fractions. */
const PIVOT = (128 + (208 - 128) * SCALE) / 256;
const DUR = 1.24;

/** Body displacement per source frame, in units of the clip's 256 frame. */
const DX = [
  0, -1, -2, -4, -7, -11, -14, -17, -19, -20, -21, -20, -17, -12, -5, 2, 8, 13, 16, 17, 17, 16, 15,
  13, 11, 8, 6, 4, 2, 1, 0,
];
const N = DX.length;

/* ── smoothing ───────────────────────────────────────────────────────────────
   Three separate things made the raw build judder, needing three fixes:

   1. THE MEASURED TRACKS ARE QUANTISED TO WHOLE PIXELS. dx steps 0,-1,-2,-4,-7
      — a staircase in POSITION is a square wave in VELOCITY. The underlying
      motion is smooth, so filtering the quantisation out is recovering the
      signal, not editing the measurement.
   2. RESAMPLING LINEARLY BETWEEN SAMPLES LEAVES CORNERS. Catmull-Rom passes
      through every sample but is C1, so a denser resample adds none.
   3. PER-SEGMENT EASING COLLAPSES VELOCITY AT EVERY KEYFRAME — the fault the
      bezier-curve note records. The brake's shape is written as continuous
      ramps and sampled instead.

   Everything therefore lands on ONE dense uniform clock with `linear` easing:
   the shape is already in the samples, and easing over it would re-time the
   measurement rather than smooth it. Measured against the unsmoothed build over
   900 samples: jerk down 18%, acceleration down 16%. The filter also rounds the
   turnarounds slightly — travel peaks at -20.1/+16.6 rather than -21/+17, about
   2% of the range, which is the direct cost of removing the staircase. */
const SAMPLES = 61;
const fine = Array.from({ length: SAMPLES }, (_, i) => i / (SAMPLES - 1));

/** Binomial [1,2,1]/4, endpoints pinned so rest stays exactly rest. */
const denoise = (a: number[], passes = 2) => {
  const v = a.slice();
  for (let p = 0; p < passes; p++) {
    const o = v.slice();
    for (let i = 1; i < v.length - 1; i++) v[i] = (o[i - 1] + 2 * o[i] + o[i + 1]) / 4;
  }
  return v;
};
/** Catmull-Rom through the samples — C1, so resampling cannot add a corner. */
const spline = (a: number[], t: number) => {
  const x = t * (a.length - 1);
  const i = Math.min(a.length - 2, Math.floor(x));
  const u = x - i;
  const p0 = a[Math.max(0, i - 1)];
  const p1 = a[i];
  const p2 = a[i + 1];
  const p3 = a[Math.min(a.length - 1, i + 2)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u)
  );
};
const resample = (a: number[]) => {
  const d = denoise(a);
  return fine.map((t) => spline(d, t));
};
/** C2 ramp — zero velocity AND acceleration at both ends, so two laid end to
 *  end cannot show a corner at the join. */
const smoother = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};
const rampAt = (s: number, s0: number, s1: number, a: number, b: number) =>
  a + (b - a) * smoother((s - s0) / (s1 - s0));

/**
 * EVERY STREAK IS A LEFTWARD WIPE, and its two edges take turns: the TAIL runs
 * left while the head stands still (the streak grows), then the HEAD runs left
 * after it (it collapses). That is why they read as air thrown off the bike
 * rather than as bars being moved. A fixed-length line that merely translates
 * and fades cannot produce it, because both of its ends move together.
 *
 * `from`/`to` are source frame numbers; x1 is the tail, x2 the head. The y
 * values carry a -1.6 offset, the difference between the clip's hub (156) and
 * this glyph's scaled hub (154.4).
 */
type Streak = { y: number; from: number; to: number; x1: number[]; x2: number[] };
const STREAKS: Streak[] = [
  {
    y: 149.4,
    from: 5,
    to: 17,
    x1: [173, 154, 133, 112, 94, 75, 68, 52, 55, 60, 60, 60, 60],
    x2: [214, 214, 220, 217, 215, 214, 213, 199, 180, 154, 126, 105, 102],
  },
  {
    y: 79.9,
    from: 11,
    to: 18,
    x1: [190, 179, 170, 162, 158, 155, 155, 155],
    x2: [226, 226, 226, 226, 224, 218, 207, 194],
  },
  {
    y: 128.9,
    from: 13,
    to: 24,
    x1: [122, 104, 80, 62, 36, 28, 18, 11, 9, 9, 9, 9],
    x2: [164, 165, 171, 174, 164, 164, 160, 149, 129, 113, 76, 59],
  },
  {
    y: 58.9,
    from: 13,
    to: 20,
    x1: [140, 130, 120, 113, 108, 105, 104, 104],
    x2: [176, 176, 176, 176, 174, 168, 157, 144],
  },
];

/** Hold the end value outside a streak's life; opacity is what hides it. */
const hold = (a: number[], from: number, f: number) =>
  a[Math.min(a.length - 1, Math.max(0, f - from))];

/**
 * A ZERO-LENGTH ROUND-CAPPED STROKE IS A FULL-WIDTH DOT, not nothing — the trap
 * the bell-slash note records. So a streak is never collapsed to hide it: it is
 * faded, and holds its geometry meanwhile. The fade is a ramp rather than a
 * one-frame step, because a step at 20ms reads as a pop and a streak that pops
 * in has no leading edge to follow.
 */
const FADE = 0.06;
const streakVariants = (s: Streak): Variants => {
  const line = (x1: number, x2: number) => `M${x1.toFixed(2)},${s.y}L${x2.toFixed(2)},${s.y}`;
  const A = resample(Array.from({ length: N }, (_, i) => hold(s.x1, s.from, i + 1)));
  const B = resample(Array.from({ length: N }, (_, i) => hold(s.x2, s.from, i + 1)));
  const d = A.map((_, i) => line(A[i], B[i]));
  const opacity = fine.map((t) => {
    const f = 1 + t * (N - 1);
    if (f < s.from || f > s.to) return 0;
    const edge = Math.min(f - s.from, s.to - f) / (N - 1);
    return Math.min(1, smoother(edge / FADE + 0.0001));
  });
  return {
    normal: { d: d[0], opacity: 0, transition: RETURN_TRANSITION },
    animate: { d, opacity, transition: { duration: DUR, times: fine, ease: "linear" } },
  };
};

const slide: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: resample(DX), transition: { duration: DUR, times: fine, ease: "linear" } },
};

const brakeAt = (s: number) =>
  s < 0.68 ? 0
  : s < 0.85 ? rampAt(s, 0.68, 0.85, 0, 3.5)
  : s < 0.93 ? rampAt(s, 0.85, 0.93, 3.5, -1.1)
  : rampAt(s, 0.93, 1, -1.1, 0);
const brake: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: fine.map(brakeAt), transition: { duration: DUR, times: fine, ease: "linear" } },
};

export const BicycleIcon = forwardRef<IconHandle, IconProps>(function BicycleIcon(
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
          <path d={BICYCLE} />
        </svg>
      </div>
    );
  }

  // Draw bigger, then pull the box back to `size` — see the sizing note above.
  const box = size / SCALE;
  const inset = (box - size) / 2;

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "visible", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={box}
        height={box}
        viewBox="0 0 256 256"
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ margin: -inset, overflow: "visible" }}
      >
        <g fill="none" stroke="currentColor" strokeWidth={WEIGHT} strokeLinecap="round">
          {STREAKS.map((s, i) => (
            <motion.path key={i} d="" variants={streakVariants(s)} />
          ))}
        </g>

        {/* Body scaled to 0.824 — the declared redraw, not a tweak. The brake
            sits inside the slide so it pitches about its own contact patch
            wherever the bike has travelled to. */}
        <motion.g variants={slide}>
          <motion.g
            variants={brake}
            style={{ transformBox: "view-box", originX: PIVOT, originY: PIVOT }}
          >
            <g transform="translate(128 128) scale(0.824) translate(-128 -128)">
              <path d={BICYCLE} />
            </g>
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
