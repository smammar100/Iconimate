"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Binoculars, five takes.
 *
 * ANATOMY, measured off the rendered fill at 4x:
 *
 *   mark      x16..239.75, y40..215.75
 *   lenses    two counters, r32 about (64,168) and (192,168) — clean circles,
 *             each sitting inside an r48 barrel end
 *   bridge    the eyepieces meet across the top with the notch at x112..144
 *
 * THE APERTURE IS DRAWN ADDITIVELY, AND THAT WAS THE ONE REAL DECISION HERE.
 * The obvious way to animate a lens stopping down is to rebuild the body with
 * the counters removed and punch them back with a mask, so the punch can then be
 * animated. Measured, that construction costs 146 INK FLIPS against the original
 * at rest — the path's own counter and a mask punch antialias their rims
 * differently, and the two do not sum to the same edge. Small, but it is a
 * resting icon paying for something only the animation needs.
 *
 * So the body is never touched. The full glyph is drawn exactly as authored, and
 * the iris is an ANNULUS laid inside the existing hole: outer r32 matching the
 * counter, inner radius animating. At rest the annulus has zero area AND zero
 * opacity, so it contributes nothing and rest is the untouched mark. Closing the
 * aperture only ever ADDS ink into a hole that is already there.
 *
 * The inner circle floors at r4 rather than 0: `a0,0,...` is a degenerate arc
 * that SVG renders as a line, and a pupil that vanishes completely reads as the
 * lens filling in solid rather than as a stop.
 */
const BINOCULARS =
  "M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z";

const LENS = [
  { cx: 64, cy: 168 },
  { cx: 192, cy: 168 },
];
const R = 32;
const SHUT = 4;

/** An annulus inside a lens counter: outer r32, inner `ri`, opposite windings so
 *  nonzero leaves the pupil open. Same command skeleton at every radius, which
 *  is what lets `d` interpolate at all. */
const iris = (cx: number, cy: number, ri: number) =>
  `M${cx - R},${cy}a${R},${R},0,1,0,${2 * R},0a${R},${R},0,1,0,${-2 * R},0Z` +
  `M${cx - ri},${cy}a${ri},${ri},0,1,1,${2 * ri},0a${ri},${ri},0,1,1,${-2 * ri},0Z`;

/** C2 ramp — zero velocity AND zero acceleration at both ends, so two of them
 *  laid end to end, or a hold between them, cannot show a corner at the join. */
const step = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};
const rampAt = (s: number, s0: number, s1: number, a: number, b: number) =>
  a + (b - a) * step((s - s0) / (s1 - s0));

/* ══ 1. FOCUS ════════════════════════════════════════════════════════════════
   The lenses rack focus: both apertures stop down and open again, the right one
   trailing the left. The stagger is what sells it — two irises moving in perfect
   unison read as a single shutter, and binoculars are two instruments being
   brought into agreement.

   A ZERO-AREA ANNULUS IS NOT NOTHING. Its outer and inner rims coincide, and
   coincident opposite-wound edges do not cancel in rasterisation the way they do
   in theory — painted opaque at rest it costs 28 ink flips against the untouched
   mark, a faint rim around each lens. So opacity is 0 wherever the ring is
   degenerate. Both fades sit in spans where the inner radius is within a third
   of a unit of the outer, i.e. the ring is already thinner than a pixel at ship
   size, so the transition itself can never be seen — it exists only so the
   resting frame owes nothing to the animation. */
const OPEN = R * 0.99; // sub-pixel ring: safe to fade across
const focus = (i: number): Variants => {
  const at = (ri: number) => iris(LENS[i].cx, LENS[i].cy, ri);
  return {
    normal: { d: at(R), opacity: 0, transition: RETURN_TRANSITION },
    animate: {
      d: [at(R), at(R), at(SHUT), at(R * 0.86), at(OPEN), at(R)],
      opacity: [0, 1, 1, 1, 1, 0],
      transition: {
        duration: 0.86,
        delay: i * 0.1,
        times: [0, 0.05, 0.38, 0.7, 0.95, 1],
        ease: ["linear", "easeInOut", "easeOut", "easeInOut", "linear"],
      },
    },
  };
};

/* ══ 2. SCAN ═════════════════════════════════════════════════════════════════
   A horizon being swept: the mark travels left, crosses to the right and comes
   back, and TILTS AGAINST ITS OWN TRAVEL. The counter-tilt is the whole trick —
   panned flat, the icon reads as sliding on a rail; leaning slightly into each
   end of the sweep reads as something being aimed by hand.
   Densely sampled with linear easing so the reversals carry no keyframe stall. */
const SCAN_N = 20;
const scanClock = Array.from({ length: SCAN_N + 1 }, (_, k) => k / SCAN_N);
const scanX = scanClock.map((t) => +(-13 * Math.sin(2 * Math.PI * t)).toFixed(2));
const scanR = scanClock.map((t) => +(2.4 * Math.sin(2 * Math.PI * t)).toFixed(2));
const scan: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: scanX,
    rotate: scanR,
    transition: { duration: 1.5, times: scanClock, ease: "linear" },
  },
};

/* ══ 3. SPOT ═════════════════════════════════════════════════════════════════
   The opposite temperament to `scan`: a fast snap onto something, a HOLD dead
   still while it is looked at, then an unhurried return. The hold is the whole
   gesture — without it this is just a nudge. Out fast on easeOut, back slow on
   easeInOut, so arriving and leaving do not read as the same move reversed. */
const spot: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 16, 16, 0],
    rotate: [0, -3.2, -3.2, 0],
    transition: {
      duration: 1.05,
      times: [0, 0.22, 0.6, 1],
      ease: ["easeOut", "linear", "easeInOut"],
    },
  },
};

/* ══ 4. RAISE ════════════════════════════════════════════════════════════════
   Brought up to the eyes: the mark rises from below, overshoots a little and
   settles, growing slightly as it comes. The scale is small on purpose — the
   lift is the gesture and the growth is only there to keep it from reading as a
   flat slide. Anticipation is a short dip BELOW the start, so the rise reads as
   caused rather than as a value changing. */
const raise: Variants = {
  normal: { y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 5, -26, 3, 0],
    scale: [1, 0.985, 1.06, 0.995, 1],
    transition: {
      duration: 0.94,
      times: [0, 0.12, 0.52, 0.78, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "easeOut"],
    },
  },
};

/* ══ 5. ZOOM ═════════════════════════════════════════════════════════════════
   Magnification going up: the whole mark grows while the irises stop down and
   snap back — the lens compensating for the light it loses as it zooms. Two
   tracks on one clock, the aperture DELIBERATELY LAGGING the scale, because the
   compensation is a consequence of the zoom and has to arrive after it. */
const zoomBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.13, 1.13, 1],
    transition: { duration: 1.02, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "linear", "easeInOut"] },
  },
};
const zoomIris = (i: number): Variants => {
  const at = (ri: number) => iris(LENS[i].cx, LENS[i].cy, ri);
  return {
    normal: { d: at(R), opacity: 0, transition: RETURN_TRANSITION },
    animate: {
      d: [at(R), at(R), at(R), at(11), at(OPEN), at(R)],
      opacity: [0, 1, 1, 1, 1, 0],
      transition: {
        duration: 1.02,
        delay: i * 0.07,
        times: [0, 0.05, 0.26, 0.52, 0.9, 1],
        ease: ["linear", "linear", "easeOut", "easeInOut", "linear"],
      },
    },
  };
};

/* ══ 7. LOCK ON — 3 x 5 ══════════════════════════════════════════════════════
   `spot`'s snap followed by `zoom`'s magnification, which is the order the two
   actually happen in: you find the thing first, then you look closer at it.
   Chaining them is what makes the hold in `spot` earn its keep — on its own it
   is a pause, here it is the moment the zoom happens in.

   IT CHECKS BOTH SIDES. A single snap reads as the target having been known
   about already; sweeping right, then left, then settling is what SEARCHING
   looks like, and it earns the lock that follows. Each side gets its own hold —
   without them the two snaps run together into one wobble.

   THE ZOOM RUNS INSIDE THE FINAL HOLD, NOT AFTER IT. Once centred, x and rotate
   are FLAT from 0.60 to the release while the scale climbs underneath them.
   Letting the position drift during the magnification would read as the
   instrument being moved again, which is precisely what somebody who has just
   found their target does not do.

   THE IRIS LAGS THE SCALE, deliberately. The lens compensating for the light it
   loses is a CONSEQUENCE of the zoom, so it has to arrive after it: the stop is
   still opening at 0.3 when the scale is already climbing, and bottoms at 0.52,
   a beat behind. Aligned, the two would read as one keyframe and the causal
   order would be lost.

   Everything returns together on one easeInOut, so the release reads as letting
   go rather than as the gesture rewound. */
/**
 * THE SMOOTHNESS IS IN THE SAMPLING, NOT IN THE EASING — the same fix the
 * bezier-curve and bicycle notes record, and it matters more here than usual.
 * Hand-placed keyframes with a per-segment ease have motion easing BETWEEN
 * keyframes, so every junction drops the velocity to nothing and starts it
 * again. On a gesture that already contains deliberate dead stops that is fatal:
 * the intentional holds and the accidental ones become indistinguishable, and
 * the whole thing reads as hesitant rather than as decisive-then-still.
 *
 * So all four tracks are written as continuous functions of ONE clock and
 * sampled. Every ramp is a smootherstep — C2, zero velocity and zero
 * acceleration at both ends — so a ramp can butt straight against a hold with no
 * corner at the join, and the holds are then genuinely still rather than a place
 * where an ease happens to bottom out. Keyframes are uniform and the easing is
 * `linear`: the shape is already in the samples.
 *
 * ROTATION IS DERIVED FROM POSITION, not keyed alongside it. Leaning is a
 * consequence of aiming, so `lockR` is simply `lockX` scaled — they cannot drift
 * apart, and there is one fewer track to keep in sync.
 */
const LOCK_N = 60;
const lockClock = Array.from({ length: LOCK_N + 1 }, (_, k) => k / LOCK_N);
const LOCK_DUR = 2.0;
const SWING = 14;

/**
 * THE RAMP LENGTHS ARE WHERE THE SMOOTHNESS ACTUALLY LIVES, not the easing.
 * Sampling the sweep instead of keyframing it fixed the SCALE track — 72% less
 * jerk — but left the sweep untouched, because the sweep's harshness was never
 * coming from keyframe junctions. It was the moves themselves: 16 units crossed
 * in 0.12 of the clock, then 32 units in 0.14. Measured over the whole gesture:
 *
 *   16 units, ramps 0.12 / 0.14 ... jerk 0.113, peak speed 3.78
 *   14 units, ramps 0.22 / 0.22 ... jerk 0.053, peak speed 2.11
 *
 * So the ramps were lengthened and the swing eased from 16 to 14 — 53% less
 * jerk, 44% off the peak speed. The gesture keeps its shape (out, hold, across,
 * hold, home, magnify) and simply stops snatching between the poses.
 */
/** Right, hold, across to the left, hold, back to centre, still. */
const lockX = (s: number) =>
  s < 0.02 ? 0
  : s < 0.24 ? rampAt(s, 0.02, 0.24, 0, SWING)
  : s < 0.32 ? SWING
  : s < 0.54 ? rampAt(s, 0.32, 0.54, SWING, -SWING)
  : s < 0.6 ? -SWING
  : s < 0.72 ? rampAt(s, 0.6, 0.72, -SWING, 0)
  : 0;
const lockR = (s: number) => (-3.2 * lockX(s)) / SWING;
/** Magnification, entirely inside the final hold. */
const lockS = (s: number) =>
  s < 0.72 ? 1
  : s < 0.84 ? rampAt(s, 0.72, 0.84, 1, 1.14)
  : s < 0.9 ? 1.14
  : rampAt(s, 0.9, 1, 1.14, 1);

const lockBody: Variants = {
  normal: { x: 0, rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    x: lockClock.map((s) => +lockX(s).toFixed(3)),
    rotate: lockClock.map((s) => +lockR(s).toFixed(3)),
    scale: lockClock.map((s) => +lockS(s).toFixed(4)),
    transition: { duration: LOCK_DUR, times: lockClock, ease: "linear" },
  },
};

/** Stops down after the scale has begun and bottoms a beat behind its peak. */
const lockRi = (s: number) =>
  s < 0.74 ? R
  : s < 0.88 ? rampAt(s, 0.74, 0.88, R, 10)
  : s < 0.97 ? rampAt(s, 0.88, 0.97, 10, OPEN)
  : rampAt(s, 0.97, 1, OPEN, R);
/** Both fades sit where the ring is thinner than a pixel, so neither is seen. */
const lockOp = (s: number) =>
  s < 0.02 ? step(s / 0.02)
  : s > 0.985 ? 1 - step((s - 0.985) / 0.015)
  : 1;

const lockIris = (i: number): Variants => ({
  normal: { d: iris(LENS[i].cx, LENS[i].cy, R), opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    d: lockClock.map((s) => iris(LENS[i].cx, LENS[i].cy, +lockRi(s).toFixed(3))),
    opacity: lockClock.map((s) => +lockOp(s).toFixed(3)),
    transition: { duration: LOCK_DUR, delay: i * 0.06, times: lockClock, ease: "linear" },
  },
});

/* ══ 6. VISION — mirroring the reference clip ════════════════════════════════
   50 frames at 25fps dumped to raw RGB and thresholded into a body mask and an
   accent mask. Three findings decided the build:

     1. IT IS A PURE VERTICAL SQUASH, NOT A SPLAY. The barrels look like they
        swing apart, and they do not: the body's bbox WIDTH is 180-182 in every
        one of the 50 frames while its HEIGHT runs 173 -> 113 -> 173. A constant
        width under a changing height is a scaleY and nothing else. The apparent
        splay is the eye reading a shortened barrel as a leaning one.
     2. IT SQUASHES ABOUT ITS OWN CENTRE. The top edge comes down 28 and the
        bottom rises 32, so the centre moves 126.5 -> 124.5 — two units over a
        65-unit compression. Symmetric, so one origin serves.
     3. THE GESTURE ENDS AT FRAME 47. Frames 47-50 are identical, so the icon is
        1.84s and no more.

   THE SMALL ELEMENTS ARE 4-DOT DIAMONDS THAT TURN. At the deepest squash each
   cluster reads as four dots on the corners of a square about 15 across —
   frame 22 has them at (118,204) (118,219) (133,204) (133,219) — and by frame 11
   the same cluster sits at 0/180 degrees instead of 45/135. So it is one cluster
   rotating, not dots appearing in new places. Rotating exactly 90 degrees makes
   the loop seamless: a 4-fold cluster maps onto itself.
   They are NOT in the Phosphor mark, so they are drawn — and at one colour they
   have to sit in genuinely clear space. Measured against the fill, the largest
   empty disc at (128,214) is r30 and at (216,42) is r21+; a diamond of r11
   carrying r4 dots needs 15, so both clear it.
   Scale is 0 at both ends of the gesture, so nothing is added at rest. */
const VIS_H = [
  173, 173, 173, 173, 171, 171, 169, 167, 164, 160, 153, 147, 142, 137, 134, 131, 130, 129, 129,
  128, 128, 128, 127, 126, 124, 121, 117, 113, 116, 117, 119, 120, 120, 120, 120, 122, 124, 127,
  132, 139, 146, 154, 161, 165, 169, 171, 173,
];
/** Binomial [1,2,1]/4 with the ends pinned — the heights are whole-pixel
 *  measurements, and a staircase in scale is a square wave in its rate. */
const smooth3 = (a: number[], passes = 2) => {
  const v = a.slice();
  for (let p = 0; p < passes; p++) {
    const o = v.slice();
    for (let i = 1; i < v.length - 1; i++) v[i] = (o[i - 1] + 2 * o[i] + o[i + 1]) / 4;
  }
  return v;
};
const VIS_CLOCK = VIS_H.map((_, i) => i / (VIS_H.length - 1));
const VIS_SCALE = smooth3(VIS_H).map((h) => +(h / 173).toFixed(4));
const VIS_DUR = 1.84;

/**
 * A PURE X-TILT ON A SYMMETRIC SHAPE IS AMBIGUOUS, AND THAT IS WHY THE FIRST
 * 3D CUT STILL READ AS FLAT. rotateX foreshortens the top and bottom equally on
 * a mark that is already near-symmetric top to bottom, so nothing in the result
 * distinguishes a tilt from a squash. Binoculars read as three-dimensional for
 * one reason: ONE BARREL IS NEARER THAN THE OTHER. So the turn is the load
 * bearing axis here, not the tip.
 *
 * PERSPECTIVE STRENGTH IS THE OTHER HALF, and 900 was far too weak. A lens
 * centre sits 64 units off the vertical axis, so under rotateY it reaches a
 * depth of 64.sin(theta) and perspective P scales it by P/(P-+z):
 *
 *   P=900, 25deg -> near 1.031, far 0.971  ->  6% difference, invisible at 30px
 *   P=420, 25deg -> near 1.069, far 0.940  -> 14% difference, unmistakable
 *
 * Hence 420. THE DIP IS NOT A STYLE CHOICE: turning and tipping both push the
 * near side outward, and at these angles the silhouette grows past the artboard.
 * A uniform 0.9 at full tilt is what keeps it inside — the object receding
 * slightly as it turns, which is also what a real one would do.
 *
 * IT TILTS IN 3D; IT DOES NOT SQUASH. The clip's own body is a flat scaleY —
 * measured, width constant to within two units across all 50 frames — and
 * reproducing that literally reads as the mark being CRUSHED rather than turned.
 * The clip gets away with it because its icon is an outlined drawing whose
 * barrel outlines overlap as they close, which supplies the depth cue by
 * accident. A single filled path has no such luxury.
 *
 * So the vertical foreshortening is produced by a real rotateX under
 * perspective, which is what a receding object actually does — and crucially the
 * near edge GROWS while the far edge shrinks. That width change is the entire
 * difference between a tilt and a crush, and no combination of scaleX/scaleY can
 * fake it, because both edges of a scale move the same way.
 *
 * BOTH NUMBERS ARE CALIBRATED, NOT PICKED. Rendering the real glyph at
 * perspective 900 and sweeping the angle, 40.5deg is where the rendered height
 * lands on the clip's own measured minimum of 0.668. The width comes out +7.3%
 * there — 224 units becomes 240, so the mark still clears the artboard at 8 and
 * 248 rather than clipping.
 *
 * The ANGLE follows the clip's compression curve rather than its heights: height
 * is not linear in angle under perspective, so matching every intermediate frame
 * exactly would need a numeric inverse. Driving the angle by normalised
 * compression keeps the rhythm the clip actually has — the ramp, the plateau
 * around frames 17-23, the deeper second dip at 28 — and pins both the rest and
 * the peak exactly. Only the values between differ, by a few percent.
 */
const VIS_PERSPECTIVE = 420;
const VIS_RX = 30;
const VIS_RY = 26;
const VIS_DIP = 0.9;
const VIS_FLOOR = Math.min(...VIS_SCALE);
/** Normalised compression, 0 at rest and 1 at the clip's deepest frame. */
const VIS_T = VIS_SCALE.map((v) => +((1 - v) / (1 - VIS_FLOOR)).toFixed(4));

const tilt: Variants = {
  normal: { rotateX: 0, rotateY: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotateX: VIS_T.map((t) => +(VIS_RX * t).toFixed(2)),
    rotateY: VIS_T.map((t) => +(VIS_RY * t).toFixed(2)),
    scale: VIS_T.map((t) => +(1 - (1 - VIS_DIP) * t).toFixed(4)),
    transition: { duration: VIS_DUR, times: VIS_CLOCK, ease: "linear" },
  },
};

/** Present from frame 5, full by 12, held to 38, gone by 47. */
const sparkAt = (s: number) =>
  s < 0.087 ? 0
  : s < 0.239 ? step((s - 0.087) / 0.152)
  : s < 0.804 ? 1
  : 1 - step((s - 0.804) / 0.196);

const SPARKS = [
  { cx: 216, cy: 42 },
  { cx: 128, cy: 214 },
];
const DIAMOND = 11;
const DOT = 4;
const spark = (i: number): Variants => ({
  normal: { scale: 0, rotate: 0, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: VIS_CLOCK.map((s) => +sparkAt(s).toFixed(3)),
    // 90 degrees exactly: a 4-fold cluster maps onto itself, so the turn has no
    // visible start or end even though the cluster is fading at both.
    rotate: VIS_CLOCK.map((s) => +(90 * step(s)).toFixed(2)),
    opacity: VIS_CLOCK.map((s) => +sparkAt(s).toFixed(3)),
    transition: {
      duration: VIS_DUR,
      delay: i * 0.06,
      times: VIS_CLOCK,
      ease: "linear",
    },
  },
});

const VisionIcon = forwardRef<IconHandle, IconProps>(function BinocularsIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={tilt}
          style={{ ...AT(128, 126), transformPerspective: VIS_PERSPECTIVE }}
        >
          <path d={BINOCULARS} />
        </motion.g>
        {SPARKS.map((sp, i) => (
          <motion.g key={i} variants={spark(i)} style={AT(sp.cx, sp.cy)}>
            {[0, 90, 180, 270].map((a) => {
              const t = (a * Math.PI) / 180;
              return (
                <circle
                  key={a}
                  cx={sp.cx + DIAMOND * Math.cos(t)}
                  cy={sp.cy + DIAMOND * Math.sin(t)}
                  r={DOT}
                />
              );
            })}
          </motion.g>
        ))}
      </Svg>
    </div>
  );
});

/* ── assembly ────────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: ReturnType<typeof useHover>["bind"] }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
      >
        <path d={BINOCULARS} />
      </svg>
    </div>
  );
}

/** Whole-mark transforms: the body is never split, so rest is exact by
 *  construction — there is no second edge anywhere to misalign. */
function makeBody(v: Variants) {
  return forwardRef<IconHandle, IconProps>(function BinocularsIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={v} style={AT(128, 168)}>
            <path d={BINOCULARS} />
          </motion.g>
        </Svg>
      </div>
    );
  });
}

/** Body plus the two additive irises. The body may carry a transform of its own
 *  — the irises ride INSIDE it, so they cannot drift off their own lenses. */
function makeIris(per: (i: number) => Variants, body?: Variants) {
  return forwardRef<IconHandle, IconProps>(function BinocularsIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    const inner = (
      <>
        <path d={BINOCULARS} />
        {LENS.map((_, i) => (
          <motion.path key={i} d="" variants={per(i)} />
        ))}
      </>
    );
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          {body ? (
            <motion.g variants={body} style={AT(128, 168)}>
              {inner}
            </motion.g>
          ) : (
            inner
          )}
        </Svg>
      </div>
    );
  });
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Focus",
    blurb: "Both apertures stop down and open again, the right lens trailing the left.",
    Component: makeIris(focus),
  },
  {
    name: "2 · Scan",
    blurb: "A horizon swept left and right, tilting against its own travel so it reads as aimed.",
    Component: makeBody(scan),
  },
  {
    name: "3 · Spot",
    blurb: "A fast snap onto something, a hold while it is looked at, then an unhurried return.",
    Component: makeBody(spot),
  },
  {
    name: "4 · Raise",
    blurb: "Dips, then lifts to the eyes and settles — brought up rather than slid into place.",
    Component: makeBody(raise),
  },
  {
    name: "5 · Zoom",
    blurb: "Magnification climbs and the irises stop down after it, compensating for the light.",
    Component: makeIris(zoomIris, zoomBody),
  },
  {
    name: "6 · Vision",
    blurb: "The clip's rhythm, but tilted in 3D — near edge grows as the far one recedes. Sparkles turn 90°.",
    Component: VisionIcon,
  },
  {
    name: "7 · Lock on",
    blurb: "3 × 5 — snaps onto something, then magnifies while holding it, the iris trailing behind.",
    Component: makeIris(lockIris, lockBody),
  },
];

export default function BinocularsLab() {
  return <VariantGrid title="Binoculars" variants={VARIANTS} cycleMs={3200} playMs={1700} />;
}
