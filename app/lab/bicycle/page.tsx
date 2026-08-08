"use client";

import { forwardRef, useId, useImperativeHandle, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bicycle, mirroring a reference clip frame by frame.
 *
 * EVERY NUMBER BELOW WAS MEASURED OFF THE VIDEO, not eyeballed. 50 frames at
 * 25fps were dumped to raw RGB and thresholded into a black mask (the frame)
 * and a cyan mask (wheels, saddle, streaks), then per frame: the black bbox
 * gives the body's displacement, and horizontal cyan runs >= 30px wide that are
 * absent from the settled frames give the streaks.
 *
 * WHAT THE CLIP ACTUALLY DOES — three findings that decided the build:
 *
 *   1. THE BODY ONLY TRANSLATES. Its black bbox is 147 wide and its top edge is
 *      at y=58 in ALL 50 frames; only x moves. No rotation, no scale, no bob.
 *      The bbox HEIGHT varies (160..185) purely because the crank swings below
 *      it — which is the part being dropped, this glyph having no pedals.
 *   2. IT RECOILS BEFORE IT SURGES. dx runs 0 → −21 (frame 11) → +17 (frame 20)
 *      → 0 (frame 31). Backwards first: anticipation, then the drive.
 *   3. THE GESTURE IS OVER AT FRAME 31. Frames 31–50 are byte-identical to each
 *      other — the clip's whole second half is the pedal loop, and nothing else
 *      moves. So the icon's animation is the first 1.24s and no more.
 *
 * THE ONE THING THAT CANNOT BE COPIED. The clip's bike sits at ~82% of frame
 * with ~22 units of margin each side, and it spends that margin sliding. The
 * Phosphor bicycle has NO margin: its ink bbox is x[0, 255.75] — the wheels are
 * r48 at (48,160) and (208,160) and touch both walls at the equator. At full
 * size it cannot slide one unit without clipping a wheel, and a streak has
 * nowhere to stream to. Hence SCALE, and hence the candidates below: it is a
 * straight trade of glyph size against how much of the clip survives.
 *
 * THE SCALE IS NOT A TASTE VALUE. 211/256 = 0.824 is the clip's own bike width
 * as a fraction of its frame. It also lands the geometry almost on top of the
 * clip's: wheels r39.6 vs 38, centres x62.1/193.9 vs 60/195, hub y154.4 vs 156.
 * Every streak track below therefore transfers ~1:1, within about two units.
 */
const BIKE =
  "M208,112a47.81,47.81,0,0,0-16.93,3.09L165.93,72H192a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H152a8,8,0,0,0-6.91,12l11.65,20H99.26L82.91,60A8,8,0,0,0,76,56H48a8,8,0,0,0,0,16H71.41L85.12,95.51,69.41,117.06a48.13,48.13,0,1,0,12.92,9.44l11.59-15.9L125.09,164A8,8,0,1,0,138.91,156l-30.32-52h57.48l11.19,19.17A48,48,0,1,0,208,112ZM80,160a32,32,0,1,1-20.21-29.74l-18.25,25a8,8,0,1,0,12.92,9.42l18.25-25A31.88,31.88,0,0,1,80,160Zm128,32a32,32,0,0,1-22.51-54.72L201.09,164A8,8,0,1,0,214.91,156L199.3,129.21A32,32,0,1,1,208,192Z";

/** The clip's own bike width as a fraction of its frame. */
const SCALE = 0.824;
/** Phosphor's stroke is 16; inside a scaled body a streak must match it. */
const WEIGHT = 16 * SCALE;

/* ── the measured tracks, frames 1..31 ───────────────────────────────────── */

const N = 31;
const clock = Array.from({ length: N }, (_, i) => i / (N - 1));
/** Body displacement per source frame, in units of the clip's 256 frame. */
const DX = [
  0, -1, -2, -4, -7, -11, -14, -17, -19, -20, -21, -20, -17, -12, -5, 2, 8, 13, 16, 17, 17, 16, 15,
  13, 11, 8, 6, 4, 2, 1, 0,
];

/**
 * EVERY STREAK IS A LEFTWARD WIPE, and the two edges do it in turn: the tail
 * runs left while the head stands still, then the head runs left after it. That
 * is why they read as thrown off the bike rather than as bars being scaled —
 * a length keyframed about its own centre cannot produce it.
 *
 * `from`/`to` are source frame numbers; x1 is the tail, x2 the head. y values
 * carry a −1.6 offset, the difference between the clip's hub (156) and the
 * scaled glyph's (154.4).
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
 * A ZERO-LENGTH ROUND-CAPPED STROKE IS A FULL-WIDTH DOT, not nothing — the same
 * trap the bell-slash note records. So a streak is never collapsed to hide it;
 * it is faded, and it holds its end geometry while invisible.
 */
const streakVariants = (s: Streak, k: number, y0: number, smooth = false): Variants => {
  const line = (x1: number, x2: number) =>
    `M${(128 + (x1 - 128) * k).toFixed(2)},${y0.toFixed(2)}L${(128 + (x2 - 128) * k).toFixed(2)},${y0.toFixed(2)}`;
  if (!smooth) {
    const d: string[] = [];
    const op: number[] = [];
    for (let f = 1; f <= N; f++) {
      d.push(line(hold(s.x1, s.from, f), hold(s.x2, s.from, f)));
      op.push(f >= s.from && f <= s.to ? 1 : 0);
    }
    return {
      normal: { d: d[0], opacity: 0, transition: RETURN_TRANSITION },
      animate: { d, opacity: op, transition: { duration: 1.24, times: clock, ease: "linear" } },
    };
  }
  /* Smoothed: the held 31-frame tracks are denoised and resampled, and opacity
     gets a real ramp instead of a one-frame step — a step at 40ms reads as a
     pop, and a streak that pops in has no leading edge to follow. The ramp is
     kept inside the streak's own life so it still never outlives the wipe. */
  const heldA = Array.from({ length: N }, (_, i) => hold(s.x1, s.from, i + 1));
  const heldB = Array.from({ length: N }, (_, i) => hold(s.x2, s.from, i + 1));
  const A = resample(heldA);
  const B = resample(heldB);
  const d = A.map((_, i) => line(A[i], B[i]));
  const fadeIn = 0.06;
  const opacity = fine.map((t) => {
    const f = 1 + t * (N - 1);
    if (f < s.from || f > s.to) return 0;
    const in0 = (f - s.from) / (N - 1);
    const out0 = (s.to - f) / (N - 1);
    return Math.min(1, smoother(Math.min(in0, out0) / fadeIn + 0.0001));
  });
  return {
    normal: { d: d[0], opacity: 0, transition: RETURN_TRANSITION },
    animate: { d, opacity, transition: { duration: 1.24, times: fine, ease: "linear" } },
  };
};

/* ── smoothing ───────────────────────────────────────────────────────────────
   Three separate things make the raw build judder, and they need three fixes:

   1. THE MEASURED TRACKS ARE QUANTISED TO WHOLE PIXELS. dx steps 0,-1,-2,-4,-7
      — at 24 fps of keyframes that is a staircase, and a staircase in POSITION
      is a square wave in velocity. The underlying motion is smooth, so filtering
      the quantisation out is recovering the signal, not editing the measurement.
   2. RESAMPLING LINEARLY BETWEEN SAMPLES LEAVES CORNERS. Catmull-Rom passes
      through every sample but is C1, so a denser resample adds no new corners.
   3. THE BRAKE'S PER-SEGMENT EASING COLLAPSES VELOCITY AT EVERY KEYFRAME —
      the same fault the bezier-curve note records. Its shape is written as
      continuous ramps and sampled instead, so no easing is laid on top.

   Everything below therefore lands on ONE dense uniform clock with `linear`
   easing: the shape is already in the samples, and any easing over it would
   re-time the measurement rather than smooth it. */
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
/** C2 ramp — zero velocity AND zero acceleration at both ends, so two of them
 *  laid end to end cannot show a corner at the join. */
const smoother = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};
const rampAt = (s: number, s0: number, s1: number, a: number, b: number) =>
  a + (b - a) * smoother((s - s0) / (s1 - s0));

/**
 * THE STOP, TAKEN FROM `airplane-taxiing`. That icon rolls in decelerating and,
 * as it halts, the airframe pitches onto the nose and rocks level —
 * `rotate: [0, 0, 5, -1.4, 0]`: flat while it is still travelling, a dip as the
 * weight transfers, a smaller counter-rock, then level. Only the body does it
 * there; the wheels just roll.
 *
 * The same shape is used here, timed against the measured slide rather than
 * against a roll-in: the surge peaks at frame 20 (s=0.667) and bleeds off to
 * nothing by frame 31, so the dip is held until 0.68 — while the bike is still
 * carrying speed there is no weight to transfer — and lands level exactly as the
 * travel reaches zero. The angle is smaller than the plane's 5 deg because the
 * pivot is much further from the far end of the object: 3.5 deg about the front
 * contact already lifts the rear wheel 11 units.
 */
const brakeAt = (s: number) =>
  s < 0.68 ? 0
  : s < 0.85 ? rampAt(s, 0.68, 0.85, 0, 3.5)
  : s < 0.93 ? rampAt(s, 0.85, 0.93, 3.5, -1.1)
  : rampAt(s, 0.93, 1, -1.1, 0);

const brakeVariants = (smooth: boolean): Variants =>
  smooth ?
    {
      normal: { rotate: 0, transition: RETURN_TRANSITION },
      animate: {
        rotate: fine.map(brakeAt),
        transition: { duration: 1.24, times: fine, ease: "linear" },
      },
    }
  : {
      normal: { rotate: 0, transition: RETURN_TRANSITION },
      animate: {
        rotate: [0, 0, 3.5, -1.1, 0],
        transition: { duration: 1.24, times: [0, 0.68, 0.85, 0.93, 1], ease: "easeInOut" },
      },
    };

const bodyVariants = (travel: number, smooth = false): Variants => ({
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate:
    smooth ?
      {
        x: resample(DX).map((v) => v * travel),
        transition: { duration: 1.24, times: fine, ease: "linear" },
      }
    : {
        x: DX.map((v) => v * travel),
        transition: { duration: 1.24, times: clock, ease: "linear" },
      },
});

/* ── assembly ────────────────────────────────────────────────────────────── */

/**
 * @param scale   body scale about the artboard centre; 1 keeps rest exact
 * @param travel  multiplier on the measured displacement; 0 pins the body
 * @param k       multiplier on streak reach about the centre
 * @param lift    y offset applied to every streak (to clear a full-size body)
 * @param punch   cut the body out of the streaks so one colour still reads
 * @param bump    ride ambulance's suspension bob on top of the measured slide
 * @param brake   halt with airplane-taxiing's weight transfer (see `brake`)
 */
function make(opts: {
  scale: number;
  travel: number;
  k: number;
  lift?: number;
  punch?: boolean;
  only?: boolean;
  bump?: boolean;
  brake?: boolean;
  smooth?: boolean;
}) {
  const {
    scale,
    travel,
    k,
    lift = 0,
    punch = false,
    only = false,
    bump = false,
    brake = false,
    smooth = false,
  } = opts;
  const body = bodyVariants(travel, smooth);
  /* THE PIVOT IS THE FRONT CONTACT PATCH, not the artboard centre. The front
     wheel is r48 about (208,160), so it meets the ground at (208,208) — and
     both coordinates being 208 means one number serves for x and y. Braking
     about that point lifts the REAR, which is what a bike actually does when
     it stops; pivoting about the centre would sink the front through the road. */
  const pivot = (128 + (208 - 128) * scale) / 256;
  return forwardRef<IconHandle, IconProps>(function BicycleIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, ambient, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const cut = `bk-cut-${uid}`;

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 256 256"
            fill="currentColor"
          >
            <path d={BIKE} />
          </svg>
        </div>
      );
    }

    // The scaled body, optionally riding the bob. `custom` sits on the same
    // element as the dynamic variant — it does not inherit from a parent.
    const scaled = (cut = false) => (
      <g transform={`translate(128 128) scale(${scale}) translate(-128 -128)`}>
        <path d={BIKE} {...(cut ? { fill: "#000", stroke: "#000", strokeWidth: 6 } : {})} />
      </g>
    );
    const bumped = (inner: ReactNode) =>
      bump ? (
        <motion.g
          variants={bob}
          custom={ambient}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
        >
          {inner}
        </motion.g>
      ) : (
        inner
      );
    const braked = (inner: ReactNode) =>
      brake ? (
        <motion.g
          variants={brakeVariants(smooth)}
          style={{ transformBox: "view-box", originX: pivot, originY: pivot }}
        >
          {inner}
        </motion.g>
      ) : (
        inner
      );

    const streaks = (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={WEIGHT}
        strokeLinecap="round"
        mask={punch ? `url(#${cut})` : undefined}
      >
        {STREAKS.map((s, i) => (
          <motion.path key={i} variants={streakVariants(s, k, s.y + lift, smooth)} d="" />
        ))}
      </g>
    );

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          {punch ? (
            <defs>
              {/* The body, stroked 6 wide on top of its own fill, so the cut
                  clears the glyph instead of landing on its antialiased edge. */}
              <mask id={cut} maskUnits="userSpaceOnUse">
                <rect width={256} height={256} fill="#fff" />
                <motion.g variants={body}>{braked(bumped(scaled(true)))}</motion.g>
              </mask>
            </defs>
          ) : null}

          {streaks}

          {!only ? (
            <motion.g variants={body}>{braked(bumped(scaled()))}</motion.g>
          ) : (
            braked(bumped(scaled()))
          )}
        </Svg>
      </div>
    );
  });
}

/* ══ 7. ROLL ═════════════════════════════════════════════════════════════════
   Built on `ambulance` rather than on the clip. Three things carry over from it:
   the vehicle BOBS IN PLACE instead of travelling, the streaks shoot off the
   back and fade on a stagger, and the whole thing LOOPS — the clip's one-shot
   lurch stops dead, which is what made v1 read as a slide rather than a ride.
   The 0.86 scale is ambulance's own declared value, and it frees the same lane.

   AND THE WHEELS ACTUALLY TURN, which the clip never solved and v1 inherited.
   The reason a Phosphor wheel cannot read as rolling is exact, not aesthetic: it
   is a plain ring, and a circle rotated about its centre IS ITSELF. There is no
   rotation of the glyph — none, at any speed — that a viewer could see. Symmetry
   has to be broken by something that is not in the glyph, so SPOKES are added.
   They are invisible at rest and fade in only while the icon plays, so the
   resting picture is still the untouched mark and nothing is owed to a consumer
   who never hovers.

   THE SPIN LOOPS ON 60 DEGREES, NOT 360. Three diameters at 60 deg apart draw a
   six-arm wheel, which maps onto itself every 60 deg — so the repeat boundary is
   geometrically invisible and the wheel never appears to snap back. A 360 deg
   cycle would be twenty-four times slower for the same apparent speed.

   The spokes sit OUTSIDE the scaled body in root coordinates, because
   `transform-box: view-box` resolves its origin against the viewport and would
   land in the wrong place inside a scaled group — the hub is at (48,160) local
   but (59.2,155.5) root. They ride the bob because they share its group. */
const HUB_Y = 128 + (160 - 128) * 0.86;
const HUBS = [128 + (48 - 128) * 0.86, 128 + (208 - 128) * 0.86];
const SPOKE = 21; // half-length; the scaled inner rim is 27.5, so ~6 of clearance
const SPOKES = [0, 60, 120].map((a) => {
  const r = (a * Math.PI) / 180;
  return [Math.cos(r) * SPOKE, Math.sin(r) * SPOKE];
});

const bob: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    y: [0, -2.5, 0, -1.5, 0],
    rotate: [0, -1.2, 0, 1, 0],
    transition: { duration: 1, ease: "easeInOut", repeat: ambient ? Infinity : 0 },
  }),
};
/** Clockwise — the bike faces right, so a wheel driving it forward turns that way. */
const roll: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    rotate: [0, 60],
    transition: { duration: 0.5, ease: "linear", repeat: ambient ? Infinity : 0 },
  }),
};
/** Rest owes nothing: the spokes are simply not there until the icon plays. */
const spokeFade: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: { opacity: [0, 0.45], transition: { duration: 0.22, ease: "easeOut" } },
};
const dash = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    x: [12, -18],
    opacity: [0, 0.9, 0],
    transition: {
      duration: 0.55,
      ease: "easeIn",
      repeat: ambient ? Infinity : 0,
      repeatDelay: 0.15,
      delay,
    },
  }),
});
/** Heights chosen where the glyph is genuinely narrow, so a streak has a lane:
 *  at the equator the wheels touch x=0 and there is none. */
const DASHES = [
  { y: 88, x1: 6, x2: 70, delay: 0 },
  { y: 112, x1: 4, x2: 48, delay: 0.12 },
  { y: 136, x1: 2, x2: 30, delay: 0.24 },
];

const RollIcon = forwardRef<IconHandle, IconProps>(function BicycleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, ambient, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d={BIKE} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {DASHES.map((s, i) => (
          <motion.line
            key={i}
            x1={s.x1}
            y1={s.y}
            x2={s.x2}
            y2={s.y}
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
            variants={dash(s.delay)}
            custom={ambient}
            style={{ transformBox: "view-box" }}
          />
        ))}

        <motion.g
          variants={bob}
          custom={ambient}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
        >
          <g transform="translate(128 128) scale(0.86) translate(-128 -128)">
            <path d={BIKE} />
          </g>

          {HUBS.map((cx, w) => (
            <motion.g key={w} variants={spokeFade}>
              <motion.g
                variants={roll}
                custom={ambient}
                style={{ transformBox: "view-box", originX: cx / 256, originY: HUB_Y / 256 }}
              >
                {SPOKES.map(([dx, dy], i) => (
                  <line
                    key={i}
                    x1={cx - dx}
                    y1={HUB_Y - dy}
                    x2={cx + dx}
                    y2={HUB_Y + dy}
                    stroke="currentColor"
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                ))}
              </motion.g>
            </motion.g>
          ))}
        </motion.g>
      </Svg>
    </div>
  );
});

/* ══ 8. RIDE — THE SHIPPED ONE ═══════════════════════════════════════════════
   Full size, and therefore rest-exact: no scale group at all. The measured
   slide was dropped rather than scaled around, because the lane it needs costs
   18% of the glyph and that reads as visibly smaller than every neighbour in a
   grid. What it needed the lane for was travel; the WIND does not need one at
   the equator, only somewhere on its own row — and the left margin is empty out
   to x41 at y60, x71 at y72, x85 at y96, x76 at y108. So the gusts moved up
   there, sized to stop short of the ink, and the body stayed full size.

   ONE PERIOD FOR EVERYTHING, which is the other fix. The bump and the wind
   previously ran on different clocks (1.0s against 1.24s), so the bike finished
   bouncing while the air was still moving and then bounced on alone. They now
   share PERIOD and repeat on it, so the phase between them never drifts: the
   bike is being buffeted exactly while the wind blows. A gust's `delay` offsets
   only its first run, so the stagger survives every repeat. */
const PERIOD = 1.24;
const bumpRide: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    y: [0, -3, 0, -2, 0],
    rotate: [0, -1.4, 0, 1.1, 0],
    transition: { duration: PERIOD, ease: "easeInOut", repeat: ambient ? Infinity : 0 },
  }),
};
/** The clip's own two-phase wipe — tail first, head after — mapped into the
 *  empty margin on each row. The motion is the clip's; only the reach shrinks. */
type Lane = { row: number; lane: [number, number]; from: number; x1: number[]; x2: number[] };
const LANES: Lane[] = [
  { row: 62, lane: [3, 38], from: 13, x1: STREAKS[3].x1, x2: STREAKS[3].x2 },
  { row: 78, lane: [3, 70], from: 11, x1: STREAKS[1].x1, x2: STREAKS[1].x2 },
  { row: 94, lane: [3, 80], from: 13, x1: STREAKS[2].x1, x2: STREAKS[2].x2 },
  { row: 110, lane: [3, 71], from: 5, x1: STREAKS[0].x1, x2: STREAKS[0].x2 },
];
const laneVariants = (s: Lane): Variants => {
  const to = s.from + s.x1.length - 1;
  const lo = Math.min(...s.x1);
  const hi = Math.max(...s.x2);
  const map = (x: number) => s.lane[0] + ((x - lo) / (hi - lo)) * (s.lane[1] - s.lane[0]);
  const at = (a: number[], f: number) => a[Math.min(a.length - 1, Math.max(0, f - s.from))];
  const d: string[] = [];
  const opacity: number[] = [];
  for (let f = 1; f <= N; f++) {
    d.push(`M${map(at(s.x1, f)).toFixed(2)},${s.row}L${map(at(s.x2, f)).toFixed(2)},${s.row}`);
    opacity.push(f >= s.from && f <= to ? 0.9 : 0);
  }
  return {
    normal: { d: d[0], opacity: 0, transition: RETURN_TRANSITION },
    animate: (ambient: boolean) => ({
      d,
      opacity,
      transition: { duration: PERIOD, times: clock, ease: "linear", repeat: ambient ? Infinity : 0 },
    }),
  };
};

const RideIcon = forwardRef<IconHandle, IconProps>(function BicycleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, ambient, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d={BIKE} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <g fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round">
          {LANES.map((s, i) => (
            <motion.path key={i} d="" variants={laneVariants(s)} custom={ambient} />
          ))}
        </g>
        <motion.g
          variants={bumpRide}
          custom={ambient}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
        >
          <path d={BIKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Faithful",
    blurb: "The clip verbatim: body at 0.824, recoil −21 then surge +17, streaks overlapping.",
    Component: make({ scale: SCALE, travel: 1, k: 1 }),
  },
  {
    name: "2 · Faithful, cut",
    blurb: "Same, but the body is punched out of the streaks — one colour, so overlap would blur.",
    Component: make({ scale: SCALE, travel: 1, k: 1, punch: true }),
  },
  {
    name: "3 · Gentle",
    blurb: "Body at 0.9, travel and reach at 55% — half the glyph loss, most of the read.",
    Component: make({ scale: 0.9, travel: 0.55, k: 0.72, punch: true }),
  },
  {
    name: "4 · Rest-exact",
    blurb: "Full size, body never moves, streaks only — rest stays pixel-identical to Phosphor.",
    Component: make({ scale: 1, travel: 0, k: 1, punch: true, only: true }),
  },
  {
    name: "5 · Rest-exact, bands",
    blurb: "Full size and still, streaks pushed into the empty y<56 / y>208 bands. Never crosses.",
    Component: make({ scale: 1, travel: 0, k: 1.06, lift: -34, only: true }),
  },
  {
    name: "6 · Slide only",
    blurb: "The measured recoil-and-surge at 0.824 with no streaks — what the body alone reads as.",
    Component: make({ scale: SCALE, travel: 1, k: 0 }),
  },
  {
    name: "7 · Roll",
    blurb: "Ambulance-style: bobs in place, streaks off the back, loops — and the wheels spin.",
    Component: RollIcon,
  },
  {
    name: "8 · Faithful + bump",
    blurb: "v1's measured recoil and surge at 0.824, riding the suspension. Superseded by 9.",
    Component: make({ scale: SCALE, travel: 1, k: 1, bump: true }),
  },
  {
    name: "9 · Ride — SHIPPED",
    blurb: "Full size, rest-exact. Bump and wind on one clock, gusts in the empty upper-left lane.",
    Component: RideIcon,
  },
  {
    name: "10 · Brake",
    blurb:
      "v1 halting like airplane-taxiing — pitches onto the front wheel, rocks level. Smoothed.",
    Component: make({ scale: SCALE, travel: 1, k: 1, brake: true, smooth: true }),
  },
];

export default function BicycleLab() {
  return <VariantGrid title="Bicycle" variants={VARIANTS} cycleMs={3200} playMs={1600} />;
}
