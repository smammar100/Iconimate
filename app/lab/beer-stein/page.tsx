"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Beer Stein icon (Phosphor "beer-stein"), candidates.
 *
 * Anatomy of the glyph (256 grid): a lidded tankard whose body occupies
 * x 40..184, y 16..224, with the handle hooked off the right at x 184..240,
 * y 88..200. Two rounded ridge bars stand inside the glass window
 * (x 88..104 and 136..152, both y 96..192) — they read as the beer level, and
 * they are the only sub-paths split out below.
 *
 * SHELL + BARS is an exact partition of the original compound path: the two
 * bars are self-contained closed sub-paths sitting inside the interior hole
 * (`M184,208V80H56V208H184Z`), so pulling them into their own element leaves
 * the rest state pixel-identical to the Phosphor original. Variants that don't
 * need the bars to move render the whole glyph as one rigid path.
 *
 * Bounds (why the angles look timid): the glyph nearly fills the box. About the
 * CENTER pivot the far bottom-left corner (40,224) is 130 units out and the lid
 * apex (104,16) is 114 — safe to ±12°. About the BASE pivot (120,224) the
 * handle tip swings widest: +8° already puts x at 254.5, so positives are
 * capped at +5.5°. About the HANDLE pivot (212,144) the body is 190 units out
 * and drops out of the bottom past −11°, so the swig stops at −8°. Every
 * keyframe below was checked against those three numbers.
 * Escalating: set down → clink → fill → swig → cheers → lid flip.
 */

/** The two ridge bars inside the glass — the "beer level". */
const BARS =
  "M104,104v80a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm40-8a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V104A8,8,0,0,0,144,96Z";

/** Everything else: outer tankard + handle, lid underside, interior and handle holes. */
const SHELL =
  "M240,112v64a24,24,0,0,1-24,24H200v8a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V72c0-30.88,28.71-56,64-56,16.77,0,32.91,5.8,44.82,16H160a40,40,0,0,1,40,40V88h16A24,24,0,0,1,240,112ZM57,64H182.62A24,24,0,0,0,160,48H145.74a8,8,0,0,1-5.53-2.22C131.06,37,117.87,32,104,32,80.82,32,61.43,45.76,57,64ZM184,208V80H56V208H184Zm40-96a8,8,0,0,0-8-8H200v80h16a8,8,0,0,0,8-8Z";

/** The full glyph, for the rigid variants. */
const STEIN = BARS + SHELL;

/**
 * LID / TANKARD — the second decomposition, used only by v6.
 *
 * Unlike SHELL+BARS this one is NOT a free split: the dome and the body are the
 * same sub-path in the original, so the cut had to be authored. The cut line is
 * y=64, chosen because the lid's inner boundary already ends there — its flat
 * underside runs y=64 from x=57 to x=182.62 — so half the seam costs nothing.
 *
 * The two ends did have to be solved. On the left, the wall curve
 * `C(40,72)(40,41.12)(68.71,16)(104,16)` crosses y=64 at t=0.0878; de Casteljau
 * splits it there into the body's stub `c0,-2.71 .22,-5.38 .65,-8` and the
 * lid's opening `C45.09,36.9 71.81,16 104,16`. On the right, the r=40 arc
 * centred at (160,72) crosses y=64 at θ=−11.54°, i.e. x=160+40cos θ=199.19,
 * which splits it into the lid's `a40,40,0,0,1,39.19,32` and the body's
 * `A40,40,0,0,1,200,72`. Union of the two paths reproduces the original.
 */
const LID =
  "M40.65,64C45.09,36.9,71.81,16,104,16c16.77,0,32.91,5.8,44.82,16H160a40,40,0,0,1,39.19,32H182.62A24,24,0,0,0,160,48H145.74a8,8,0,0,1-5.53-2.22C131.06,37,117.87,32,104,32,80.82,32,61.43,45.76,57,64Z";
const TANKARD =
  "M240,112v64a24,24,0,0,1-24,24H200v8a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V72c0-2.71.22-5.38.65-8H199.19A40,40,0,0,1,200,72V88h16A24,24,0,0,1,240,112ZM184,208V80H56V208H184Zm40-96a8,8,0,0,0-8-8H200v80h16a8,8,0,0,0,8-8Z";

const CENTER = AT(128, 128);
const BASE = AT(120, 224); // where the tankard meets the bar top
const HANDLE = AT(212, 144); // the middle of the grip — the pour pivot
const BAR_FOOT_L = AT(96, 192); // bottom of the left ridge, so it grows upward
const BAR_FOOT_R = AT(144, 192);
const HINGE = AT(196, 66); // the pin in the rim, on the handle side — see v6

/* ── 1. SET DOWN — planted on the bar ────────────────────────────────────────
   The plainest read, and the one that establishes weight: the stein falls the
   last few units, thuds, and rocks itself flat about its base. The rock decays
   asymmetrically — it leans away from the handle first, because that's the side
   the hand let go of. Capped at −7°/+5.5°: the handle tip is the widest point
   about this pivot and clears the right edge by under 4 units at +5.5°. */
const setDown: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [-9, 0, 0, 0, 0, 0],
    rotate: [0, -7, 5.5, -3, 1.2, 0],
    transition: { duration: 1.15, ease: "easeOut", times: [0, 0.18, 0.42, 0.63, 0.83, 1] },
  },
};

const SteinSetDownIcon = forwardRef<IconHandle, IconProps>(
  function SteinSetDownIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={STEIN} variants={reduced ? undefined : setDown} style={BASE} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. CLINK — a toast tap ──────────────────────────────────────────────────
   Now there's intent. The stein tips its rim toward an unseen partner on the
   left and lunges a few units the same way to make contact, then recoils
   through a small counter-swing. Sharp out, soft home — the asymmetry in the
   times array is the whole trick, and it's what separates a tap from a wave. */
const clink: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, 3, 0],
    x: [0, -7, 2, 0],
    transition: { duration: 0.68, ease: "easeOut", times: [0, 0.28, 0.64, 1] },
  },
};

const SteinClinkIcon = forwardRef<IconHandle, IconProps>(
  function SteinClinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={STEIN} variants={reduced ? undefined : clink} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. FILL — pouring one ───────────────────────────────────────────────────
   The first variant to move a part instead of the whole: the two ridge bars
   scale up from their feet (y=192) as the beer climbs, overshooting the top and
   sloshing back down. The far bar is a beat behind the near one, so the surface
   tilts on the way up the way a real pour does. The shell stays put but takes a
   small settling dip as the weight arrives. At rest both bars are scaleY 1 —
   the glyph is untouched. */
const fillBar = (delay: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.06, 0.55, 1.06, 0.94, 1],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.35, 0.66, 0.85, 1], delay },
  },
});
const fillNear = fillBar(0);
const fillFar = fillBar(0.12);
const fillShell: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 2.5, 0, 0],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.5, 0.72, 0.88, 1] },
  },
};

const SteinFillIcon = forwardRef<IconHandle, IconProps>(
  function SteinFillIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={SHELL} variants={reduced ? undefined : fillShell} />
          {reduced ? (
            <path d={BARS} />
          ) : (
            <>
              <motion.path
                d="M104,104v80a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"
                variants={fillNear}
                style={BAR_FOOT_L}
              />
              <motion.path
                d="M144,96a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V104A8,8,0,0,0,144,96Z"
                variants={fillFar}
                style={BAR_FOOT_R}
              />
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 4. SWIG — taking a drink ────────────────────────────────────────────────
   The narrative one. The stein rotates about the HANDLE — the way a hand
   actually holds it — so the body swings up and the rim tips toward the
   drinker, then GLUGS: three shallow pulses at the tipped angle, the rhythm of
   swallowing, before coming back down. −8° is the hard floor here; at −9° the
   bottom-left corner is already at y=250 and heading out of the box. */
const swig: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, -5.5, -8, -6, -8, 0],
    transition: { duration: 1.5, ease: "easeInOut", times: [0, 0.24, 0.37, 0.5, 0.63, 0.76, 1] },
  },
};

const SteinSwigIcon = forwardRef<IconHandle, IconProps>(
  function SteinSwigIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={STEIN} variants={reduced ? undefined : swig} style={HANDLE} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. CHEERS & FIZZ — the showpiece ────────────────────────────────────────
   The whole toast in one beat, with the beer finally alive inside it. The stein
   lifts along the empty up-left diagonal, clinks TWICE at the top (the
   double-tap is the "cheers!"), drops back to the bar and settles with the v1
   rock — every earlier candidate in story order.
   Underneath, carbonation runs the entire time: bubbles born small at the
   bottom of the glass rise up the three free columns of the interior window
   (x 56..88, 104..136, 152..184) and fade out below the rim. They live INSIDE
   the moving group, so they stay glued to the glass through the lift and the
   taps instead of sliding across it. Rest: the group is identity and every
   bubble is opacity 0, so the icon is the plain glyph. */
const cheers: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -6, -6, -6, -6, 0, 0, 0, 0],
    y: [0, -6, -6, -6, -6, 0, 0, 0, 0],
    rotate: [0, 0, -7, -2, -7, 0, 4.5, -2, 0],
    transition: {
      duration: 1.7,
      ease: "easeInOut",
      times: [0, 0.13, 0.25, 0.35, 0.47, 0.62, 0.76, 0.89, 1],
    },
  },
};

/** One rising bubble: `x` is its column, `rise` how far up the glass it gets. */
const fizz = (rise: number, delay: number, duration: number): Variants => ({
  normal: { opacity: 0, y: 0, scale: 0.35, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 0.9, 0.75, 0],
    y: [0, -rise * 0.35, -rise * 0.72, -rise],
    scale: [0.35, 0.8, 1, 0.95],
    transition: {
      duration,
      ease: "easeOut",
      times: [0, 0.3, 0.65, 1],
      repeat: Infinity,
      repeatDelay: 0.15,
      delay,
    },
  },
});
const fizzA = fizz(96, 0, 1.25);
const fizzB = fizz(88, 0.42, 1.4);
const fizzC = fizz(80, 0.78, 1.15);
const fizzD = fizz(92, 1.05, 1.35);

const SteinCheersIcon = forwardRef<IconHandle, IconProps>(
  function SteinCheersIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : cheers} style={CENTER}>
            <path d={STEIN} />
            {!reduced && (
              <>
                {/* Left column (x 56..88), then the gap between the bars
                    (104..136), then the right column (152..184). */}
                <motion.g variants={fizzA}>
                  <circle cx={72} cy={196} r={8} />
                </motion.g>
                <motion.g variants={fizzB}>
                  <circle cx={120} cy={198} r={10} />
                </motion.g>
                <motion.g variants={fizzC}>
                  <circle cx={168} cy={196} r={7} />
                </motion.g>
                <motion.g variants={fizzD}>
                  <circle cx={119} cy={200} r={6} />
                </motion.g>
              </>
            )}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. LID FLIP — the thumb-lever pops ──────────────────────────────────────
   The only variant where the stein's mechanism moves. The lid hinges at the pin
   in the rim on the handle side (196,66), springs open, quivers at the top,
   then SLAMS shut and rebounds — while the whole stein dips on the recoil.

   That dip is not decoration, it's what buys the angle. The lid crown sits at
   y=16 with a mere 16 units of ceiling, so opening it at all drives the crown
   at the top edge; the same 11° flip with no dip puts it at y=−1.4, outside the
   box. Sinking the whole group 6 units first hands that headroom back, and the
   flip roughly doubles its read — the left tip rises 30 units instead of 16.
   The dip doubles as the body's reaction to the lever, so the physics and the
   bounds happen to want the same thing.

   The binding point is NOT the apex, which is what the arithmetic suggests: a
   dense sample of the real path puts it at (88.9,17.6) on the dome's left
   SHOULDER, which is further from the hinge than the peak is. That's why the
   swing stops at 11° — 12° leaves only 2.4 units of clearance there, while 11°
   restores the ~4 the other variants run with, at the cost of one degree. */
const lidDip: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 6, 6, 6, 6, 1.5, 0],
    transition: { duration: 1.25, ease: "easeOut", times: [0, 0.16, 0.34, 0.5, 0.68, 0.84, 1] },
  },
};
const lidFlip: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 11, 8.7, 11, 0, 3.2, 0],
    transition: { duration: 1.25, ease: "easeOut", times: [0, 0.16, 0.34, 0.5, 0.68, 0.84, 1] },
  },
};

const SteinLidFlipIcon = forwardRef<IconHandle, IconProps>(
  function SteinLidFlipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <Svg size={size} controls={controls}>
            <path d={STEIN} />
          </Svg>
        </div>
      );
    }
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={lidDip}>
            <path d={TANKARD} />
            <path d={BARS} />
            <motion.path d={LID} variants={lidFlip} style={HINGE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof SteinSetDownIcon }[] = [
  { name: "Set down", blurb: "Drops the last few units, thuds, and rocks flat about its base", Component: SteinSetDownIcon },
  { name: "Clink", blurb: "Tips and lunges toward an unseen partner, then recoils — a toast tap", Component: SteinClinkIcon },
  { name: "Fill", blurb: "The beer climbs both ridges from the foot, overshoots and sloshes back", Component: SteinFillIcon },
  { name: "Swig", blurb: "Swings about the handle and glugs three times — taking a drink", Component: SteinSwigIcon },
  { name: "Cheers & fizz", blurb: "Lifts, double-clinks, lands and settles while bubbles rise inside the glass", Component: SteinCheersIcon },
  { name: "Lid flip", blurb: "The hinged lid springs open, quivers, then slams shut as the stein dips", Component: SteinLidFlipIcon },
];

export default function BeerSteinLabPage() {
  return <VariantGrid title="Beer Stein" variants={VARIANTS} cycleMs={3600} playMs={2400} />;
}
