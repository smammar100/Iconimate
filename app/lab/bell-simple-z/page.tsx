"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bell Simple Z, 5 candidates.
 *
 * THE VERB IS THE ARGUMENT HERE. Every other bell in the set rings; this one is asleep, and
 * the Z is the only thing in the family that says so. A bell that swings hard and then shows
 * you a Z is telling you two contradictory things at once, so the five candidates are really
 * five answers to one question: how much is this bell allowed to move?
 *
 * 1 is the family ring, unchanged, included as the CONTROL — the others exist to be judged
 * against it. 2 lets it ring and then puts it to sleep. 3 holds the bell dead still and moves
 * only the Z. 4 has it nod off mid-swing. 5 lets the Z rise off the bell and settle back.
 * 6, 7 and 8 stop treating the Z as a shape: 6 WRITES it, 7 breathes the bell around it, and
 * 8 multiplies it into the sleep motif everyone already knows.
 *
 * THE GLYPH SPLITS CLEANLY — no winding trap, unlike bell and bell-ringing where the clapper
 * is negative space. Shell, bar and Z are disjoint: the collar runs straight across at y=200,
 * the bar is a separate capsule at y216..232, and the Z floats inside the dome's cavity
 * touching nothing. Verified, and the control is the point:
 *
 *     SHELL + BAR + Z as ONE path vs the source ....... 0 differing pixels
 *     the three filled SEPARATELY vs the source ....... 1101 px, max alpha gap 75
 *     the source drawn over ITSELF twice (control) .... 4695 px, max alpha gap 64
 *
 * The decomposition is exact — the first line proves the geometry, and the third proves the
 * second line is antialias compositing rather than error, since drawing the identical path
 * twice produces MORE noise than the split does. Do not go hunting for a missing subpath.
 *
 * EVERY NUMBER IS MEASURED OFF THE PATH.
 *   · the bell is bell-simple: dome r=80 about (128,104), hanging from its crown (128,24).
 *     Rotating shell + bar + Z together about that crown, the largest angle keeping every
 *     sampled point on the artboard is 12.12°, so the ring swings 12;
 *   · the bar travels 17 — the shipped bell's clapper hangs 184 below its crown and moves 16,
 *     an angular swing of 4.99°, which at this bar's 200-unit radius is 17.4. That is what
 *     keeps the family one idea rather than five;
 *   · the Z spans x104..152 y88..152, so its centre is (128,120) — it scales about that;
 *   · the Z's diagonal runs 123.69° along its CENTRELINE, (144,96) to (112,144), for 57.69
 *     units. Measure that off the stroke's outer edge instead and you get 138.9°, which is
 *     the angle of a boundary rather than of the letter — an easy and wrong reading, and the
 *     one Float shipped with first. Drifting along the centreline is the one direction the
 *     glyph itself nominates, and there are 39.6 units of clearance that way before the Z
 *     leaves the dome's cavity at full size (50.7 at 0.7 scale, 58.1 at 0.5).
 *
 * THE Z IS A PEN STROKE, WHICH IS WHAT MAKES 6 AND 8 POSSIBLE. Phosphor drew it as an
 * outline, but those A8,8 arcs are a round JOIN centred exactly on the vertex (144,96) —
 * the two arc endpoints measure 8.04 and 7.99 units out, half of the icon's 16 weight — and
 * the ends are round CAPS on (112,96) and (144,144). So the whole letter is one 16-wide
 * round-capped, round-joined polyline, `M112,96 H144 L112,144 H144`, 121.69 units long:
 * 32 across the top, 57.69 down the diagonal, 32 across the bottom. Verified:
 *
 *     stroke rebuild vs the filled source Z ... 323 px (237 fill-only, 86 stroke-only)
 *     the source Z drawn over ITSELF ......... 595 px  <- the noise floor it beats
 *
 * 323 is 1% of the Z's 32,721 ink pixels and below the cost of drawing the fill twice, so
 * the rebuild is exact. That means the Z can be DRAWN, which no other bell in the set can do.
 */
const SHELL =
  "M221.84,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Z";
const Z =
  "M144,136H127l23.7-35.56A8,8,0,0,0,144,88H112a8,8,0,0,0,0,16h17.05l-23.7,35.56A8,8,0,0,0,112,152h32a8,8,0,0,0,0-16Z";
/** The same letter as a pen stroke — see the header. Only usable with width 16, round caps
 *  and round joins; any other combination stops reproducing the source. */
const Z_STROKE = "M112,96H144L112,144H144";
const Z_W = 16;

const CROWN = AT(128, 24); // the shell hangs here
const ZC = AT(128, 120); // the Z's own centre
const COLLAR = AT(128, 200); // where the bell meets its bar — the pivot a breath works about

const SWING = 12; // inside the measured 12.12° cap
const TRAVEL = 17; // the shipped bell's 4.99° swing, at this bar's 200-unit radius

// The Z's centreline diagonal as a unit vector pointing UP-RIGHT along it — the direction
// the glyph nominates for itself. 22 is comfortably inside the measured 39.6 clearance.
const UP_RIGHT = -56.31; // = 123.69° - 180°
const RISE = 22;
const DX = Math.cos((UP_RIGHT * Math.PI) / 180) * RISE; // +12.2
const DY = Math.sin((UP_RIGHT * Math.PI) / 180) * RISE; // -18.3
/** Ghost drift, same direction, at the two distances 8 uses. */
const ghostAt = (d: number) => ({
  x: Math.cos((UP_RIGHT * Math.PI) / 180) * d,
  y: Math.sin((UP_RIGHT * Math.PI) / 180) * d,
});

/* ------------------------------------------------------------------ 1 · Ring (control) */
// The bell-simple spine, untouched, Z welded on. Here so the other four can be judged
// against the thing they are departing from.
const ringShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, SWING, -9.5, 7.4, -2.5, 0],
    transition: { duration: 0.85, times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1], ease: "easeInOut" },
  },
};
const ringBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, TRAVEL, -14, 9.5, -3.7, 0],
    transition: { duration: 0.85, times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1], ease: "easeInOut" },
  },
};
const zStill: Variants = { normal: {}, animate: {} };

/* ------------------------------------------------------------------------- 2 · Snooze */
// It rings, and then it doesn't. Two full swings at family amplitude, then the Z swells and
// the swing collapses under it — 11 and 10 degrees, then 3 and 1. Same argument as the slash
// icon's Silenced: the sleep is something that HAPPENS, which is the only reading that earns
// a whole animation rather than a static state.
const snoozeShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 10, -3, 1, 0],
    transition: { duration: 0.95, times: [0, 0.16, 0.36, 0.62, 0.82, 1], ease: "easeOut" },
  },
};
const snoozeBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, 15, -4.2, 1.4, 0],
    transition: { duration: 0.95, times: [0, 0.2, 0.4, 0.66, 0.86, 1], ease: "easeOut" },
  },
};
// The Z arrives late — it does nothing while the bell is still ringing, then swells once as
// the swing dies. It is part of the glyph, so it returns to scale 1 rather than fading in.
const snoozeZ: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.3, 1],
    transition: { duration: 0.95, times: [0, 0.42, 0.66, 1], ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------------ 3 · Breathe */
// The bell is DEAD STILL and only the Z moves — two slow swells, the rhythm of sleeping
// breath. This is the candidate that obeys the one-part-moves rule most strictly, and the
// only one where the bell reads as genuinely asleep rather than recently disturbed.
const stillShell: Variants = { normal: { rotate: 0 }, animate: { rotate: 0 } };
const stillBar: Variants = { normal: { x: 0 }, animate: { x: 0 } };
const breatheZ: Variants = {
  normal: { scale: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.22, 1, 1.22, 1],
    // A touch of lift with each swell — breath goes up, not just out. 6 units, well inside
    // the 45.5 of headroom the cavity allows.
    y: [0, -6, 0, -6, 0],
    transition: { duration: 1.3, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" },
  },
};

/* ------------------------------------------------------------------------ 4 · Nod off */
// A head going under: it lifts, tips further than it means to, catches itself, then gives in.
// The rotation never crosses zero after the first beat — it is a fall, not an oscillation,
// which is what separates nodding off from ringing. The Z swells as the tip deepens.
const nodShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -6, 2, 9, 5.5, 0],
    transition: { duration: 1.1, times: [0, 0.14, 0.3, 0.58, 0.74, 1], ease: "easeInOut" },
  },
};
const nodBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -9, 3, TRAVEL, 8, 0],
    transition: { duration: 1.1, times: [0, 0.18, 0.34, 0.62, 0.78, 1], ease: "easeInOut" },
  },
};
const nodZ: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.26, 1.1, 1],
    transition: { duration: 1.1, times: [0, 0.3, 0.62, 0.78, 1], ease: "easeInOut" },
  },
};

/* --------------------------------------------------------------------------- 5 · Float */
// The Z leaves. It rises along ITS OWN DIAGONAL — 123.69°, the angle the glyph already
// contains — thins out as it goes, and settles back. The shell counter-rocks 3° against it,
// far under the ring's 12, so the bell reads as breathing rather than ringing. This is the
// only candidate that uses the Z's geometry as the source of its direction.
const floatShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -3, 2.2, -1, 0],
    transition: { duration: 1.2, times: [0, 0.28, 0.55, 0.8, 1], ease: "easeInOut" },
  },
};
const floatBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -5, 3.6, -1.6, 0],
    transition: { duration: 1.2, times: [0, 0.32, 0.59, 0.84, 1], ease: "easeInOut" },
  },
};
const floatZ: Variants = {
  normal: { x: 0, y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, DX * 0.55, DX, 0],
    y: [0, DY * 0.55, DY, 0],
    // shrinking as it rises reads as distance rather than as the Z getting smaller
    scale: [1, 0.94, 0.8, 1],
    opacity: [1, 0.75, 0.3, 1],
    transition: { duration: 1.2, times: [0, 0.3, 0.62, 1], ease: "easeInOut" },
  },
};

/* --------------------------------------------------------------------- 6 · Handwritten */
// THE Z WRITES ITSELF, which is the one thing this glyph can do that no other bell in the
// set can — see the header for why the letter is a stroke rather than an outline. The bell
// holds perfectly still and a hand draws the Z onto it.
//
// The corner hesitation is the whole trick. A pen does not cross a corner at speed: it
// arrives, stops, and leaves again. So the keyframes are pinned to the letter's own segment
// boundaries — 32/121.69 = 0.263 at the top-right vertex, 89.69/121.69 = 0.737 at the
// bottom-left — and each is held for 0.06 of the timeline while the pen turns. What is left
// runs the diagonal fastest (0.474 of the length in 0.28 of the time, against the top bar's
// 0.263 in 0.22), which is exactly how a hand writes: long strokes quick, ends deliberate.
// Ease is linear on purpose — the segment timing IS the feel, and an ease on top would
// smear the stops back out.
const writeZ: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 0.263, 0.263, 0.737, 0.737, 1],
    // Same round-cap trap as the slash icon: at pathLength 0 a round cap renders a full
    // 16-wide dot parked on (112,96). Staying invisible until the pen is moving kills it
    // without giving up the round caps the source has.
    //
    // THE FADE MUST FINISH LATER THAN THE STROKE STARTS, not just after it. Ramping opacity
    // over 0.11..0.13 was measured showing the dot for 19 frames: the pen starts at 0.12, so
    // at 0.13 the stroke is 0.012 long — 1.5 units — and already fully opaque. The cap is 8
    // units in radius, so the mark only stops reading as a dot past ~0.066 of the length,
    // which this pace reaches at 0.175. The fade ends at 0.20, safely after it.
    opacity: [0, 0, 1, 1],
    transition: {
      pathLength: {
        duration: 1.05,
        times: [0, 0.12, 0.34, 0.4, 0.68, 0.74, 1],
        ease: "linear",
      },
      opacity: { duration: 1.05, times: [0, 0.15, 0.21, 1], ease: "linear" },
    },
  },
};

/* --------------------------------------------------------------------------- 7 · Snore */
// A BREATH IS NOT A SINE WAVE — it is slow in and quick out, and building the asymmetry in
// is what stops this reading as a throb. The inhale takes 0.42 of each cycle and the exhale
// 0.18, and the two run twice.
//
// The whole glyph swells about the COLLAR (128,200), not the artboard centre: a bell resting
// on its mouth grows upward from there, the way a chest does. Measured cap about that point
// is 1.136 before the dome leaves the artboard, so it breathes to 1.07 — half the headroom.
//
// The Z is in COUNTER-PHASE, and that is the causal bit: it is squeezed small while the bell
// fills, then pops as the bell empties. The air goes somewhere, and where it goes is the Z.
const snoreBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.07, 1, 1.07, 1],
    transition: { duration: 1.5, times: [0, 0.42, 0.6, 0.92, 1], ease: "easeInOut" },
  },
};
const snoreZ: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.88, 1.24, 0.9, 1.2, 1],
    transition: { duration: 1.5, times: [0, 0.4, 0.62, 0.9, 0.96, 1], ease: "easeOut" },
  },
};

/* ----------------------------------------------------------------------------- 8 · Zzz */
// The sleep motif everyone actually knows, and the icon only has one Z. So two more rise off
// it — smaller, staggered, fading — along the same 123.69° centreline the letter contains.
//
// THIS IS ADDED INK, DELIBERATELY, and it is legal because it is only ever present mid-
// gesture: both ghosts sit at opacity 0 at rest, so the resting icon is the untouched
// Phosphor mark to the pixel. The precedent is ambulance's speed streaks.
//
// Both stay inside the dome's cavity rather than escaping through the shell wall, which
// would read as a rendering mistake rather than a dream. The clearances allow it: 30 units
// at 0.62 scale and 52 at 0.42 are both well inside the 50.7 and 58.1 measured at those
// sizes. The original Z never moves — it is the one that is really there.
const ghostA: Variants = {
  normal: { opacity: 0, scale: 1, x: 0, y: 0 },
  animate: {
    opacity: [0, 0.55, 0.5, 0],
    scale: [1, 0.86, 0.72, 0.62],
    x: [0, ghostAt(12).x, ghostAt(23).x, ghostAt(30).x],
    y: [0, ghostAt(12).y, ghostAt(23).y, ghostAt(30).y],
    transition: { duration: 1.45, times: [0, 0.22, 0.5, 0.78], ease: "easeOut" },
  },
};
const ghostB: Variants = {
  normal: { opacity: 0, scale: 1, x: 0, y: 0 },
  animate: {
    // trails ghostA by 0.2 of the timeline — a stagger, not a second copy of the same move
    opacity: [0, 0, 0.4, 0.34, 0],
    scale: [1, 1, 0.66, 0.52, 0.42],
    x: [0, 0, ghostAt(24).x, ghostAt(40).x, ghostAt(52).x],
    y: [0, 0, ghostAt(24).y, ghostAt(40).y, ghostAt(52).y],
    transition: { duration: 1.45, times: [0, 0.2, 0.42, 0.68, 0.95], ease: "easeOut" },
  },
};
// The bell exhales each Z out: a small dip timed to each departure, nothing like the ring.
const zzzShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2.4, 0.8, -1.6, 0],
    transition: { duration: 1.45, times: [0, 0.2, 0.45, 0.68, 1], ease: "easeInOut" },
  },
};
const zzzBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -4, 1.4, -2.7, 0],
    transition: { duration: 1.45, times: [0, 0.24, 0.49, 0.72, 1], ease: "easeInOut" },
  },
};

/* ------------------------------------------------------------------ 9 · Ring, then sink */
// 1 AND 7 IN ONE GESTURE — and they cannot simply be stacked, which is the interesting part.
// The ring rotates about the crown (128,24); the breath scales about the collar (128,200).
// Both push the dome toward the top-left corner, so their headroom is SHARED, not separate.
// Measured, with the breath wrapping the ring the way the groups actually nest:
//
//     ring at its full 12°  ->  the breath caps at 1.001   (no room at all)
//     breath at 7's 1.07    ->  the swing caps at 8.70°
//     both at full          ->  overflows the artboard by 8.85 units
//
// So one has to give. Rather than shrink both into a muddle, they HAND OFF: the bell rings
// at the family's full amplitude, and only once the swing has spent itself does the breath
// take over. Nothing is compromised because nothing overlaps — at every instant one of the
// two is at rest. The ring's own 0.85s occupies 0.567 of this 1.5s timeline, which is why
// its times are the family's scaled by exactly that.
//
// It also reads better than the simultaneous version would: a bell that rings and then
// breathes is falling asleep, where a bell doing both at once is just busy.
const sinkShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, SWING, -9.5, 7.4, -2.5, 0, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.113, 0.249, 0.363, 0.454, 0.522, 0.567, 1],
      ease: "easeInOut",
    },
  },
};
const sinkBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, TRAVEL, -14, 9.5, -3.7, 0, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.136, 0.272, 0.386, 0.476, 0.533, 0.567, 1],
      ease: "easeInOut",
    },
  },
};
// Held flat until the ring is done, then 7's asymmetry: 0.30 of the timeline to fill and
// 0.15 to empty, a 2:1 slow-in/quick-out. One breath, not two — it is the last thing that
// happens, so a second cycle would keep the icon awake.
const sinkBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.07, 1],
    transition: { duration: 1.5, times: [0, 0.55, 0.85, 1], ease: "easeInOut" },
  },
};
// Counter-phase, exactly as in 7 — squeezed while the bell fills, popping as it empties.
const sinkZ: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 0.88, 1.22, 1],
    transition: { duration: 1.5, times: [0, 0.55, 0.85, 0.93, 1], ease: "easeOut" },
  },
};

/* ------------------------------------------------------- 10 · Written in its sleep (6+7) */
// 6 AND 7, AND UNLIKE 9 THESE DO NOT COMPETE. 9 had to hand off because the ring and the
// breath both spend the same headroom above the dome. Here the breath owns scale about the
// collar and the writing owns pathLength, so they occupy different channels entirely and can
// run at full amplitude at the same time. Nothing had to be reduced.
//
// The writing is PACED TO THE BREATH rather than merely overlapping it: the pen starts just
// after the first inhale begins and lifts exactly as that breath turns over at 0.60, so the
// letter is finished at the top of the exhale. The corner hesitations from 6 survive intact,
// pinned to the same 0.263 and 0.737 segment boundaries — the whole writing window is simply
// compressed into 0.10..0.60 instead of running the full timeline.
//
// Then the Z takes 7's counter-phase for the SECOND breath only, once it exists to be
// squeezed. Because it is a stroke, scaling it also scales its 16 weight — the letter
// thickens as it is pressed and thins as it lifts, which is what a pen actually does. That
// is a side effect worth keeping, not one to correct.
const sleepBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.07, 1, 1.07, 1],
    transition: { duration: 1.6, times: [0, 0.42, 0.6, 0.92, 1], ease: "easeInOut" },
  },
};
const sleepWriteZ: Variants = {
  normal: { pathLength: 1, opacity: 1, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 0.263, 0.263, 0.737, 0.737, 1, 1],
    opacity: [0, 0, 1, 1],
    // held at 1 through the writing, then squeezed and released on the second breath
    scale: [1, 1, 0.9, 1.2, 1],
    transition: {
      pathLength: {
        duration: 1.6,
        times: [0, 0.1, 0.24, 0.28, 0.46, 0.5, 0.6, 1],
        ease: "linear",
      },
      // late enough that the round cap is never opaque at zero length — see 6's note
      opacity: { duration: 1.6, times: [0, 0.12, 0.175, 1], ease: "linear" },
      scale: { duration: 1.6, times: [0, 0.62, 0.92, 0.97, 1], ease: "easeOut" },
    },
  },
};

/* --------------------------------------------------- 11 · Ringing in its sleep (9, at once) */
// WHAT 9 REFUSED TO DO. 9 handed off because the ring and the breath share headroom; this one
// runs them together for the whole gesture, which is only possible by paying for it in
// amplitude. The exchange rate is measured and almost perfectly linear — each 0.01 of breath
// costs 0.47° of swing:
//
//     breath  1.00  1.02  1.03  1.04  1.05  1.06  1.07  1.08
//     swing  12.12 11.10 10.61 10.14  9.67  9.22  8.77  8.34
//
// So this sits at 10° and 1.04, which clears by 0.36 units. THE POINT OF PICKING FROM THE
// CURVE rather than phasing the peaks apart is that 10/1.04 is legal at EVERY relative phase:
// the two can drift, the easing can be retimed, and it still cannot leave the artboard. A
// version that only fits because its peaks are interleaved is one edit away from breaking.
// The breath's first peak does land on a swing zero-crossing at 0.45, but that is for looks.
//
// The rock is SUSTAINED, not damped — the family's ring decays to nothing by design, and a
// bell that stops rocking halfway through is not ringing continuously. It tapers 10 -> 9.4 ->
// 8.6 instead, which keeps it alive without reading as a machine.
const sleepRingShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -10, 10, -9.4, 9.4, -8.6, 8.6, 0],
    transition: {
      duration: 1.7,
      times: [0, 0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 1],
      ease: "easeInOut",
    },
  },
};
// The bar keeps the family's RATIO rather than its number: 17 of travel goes with 12° of
// swing, so 10° gets 14.2. Rounded to 14, and still trailing the shell by ~0.04.
const sleepRingBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 14, -13.2, 13.2, -12, 12, 0],
    transition: {
      duration: 1.7,
      times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1],
      ease: "easeInOut",
    },
  },
};
const sleepRingBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.04, 1, 1.04, 1],
    transition: { duration: 1.7, times: [0, 0.45, 0.62, 0.9, 1], ease: "easeInOut" },
  },
};
const sleepRingZ: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.18, 0.92, 1.16, 1],
    transition: { duration: 1.7, times: [0, 0.45, 0.55, 0.9, 0.96, 1], ease: "easeOut" },
  },
};

/* ------------------------------------------------- 12 · Deeper (8, with the Z's asserting) */
// 8 INVERTED. There the ghosts faded as they climbed, so the sleep read as something trailing
// off. Here each rising Z is CLEARER than the one before it — 0.45, then 0.7, then a third at
// full strength — so the gesture builds instead of dissipating. Sleep getting deeper, not a
// thought drifting away. It is the same mechanism as 8 and the opposite claim.
//
// Clearer also means BIGGER: 8 shrank its ghosts to 0.62 and 0.42, which is most of why they
// read as faint. These hold 0.8, 0.66 and 0.56, close enough to full size to stay legible at
// 24px, and each still ends at opacity 0 so rest is the untouched Phosphor mark.
//
// Every one stays inside the dome's cavity, measured along the 123.69° centreline at the size
// each ghost actually reaches:
//
//     scale     0.80   0.66   0.56          (clearance 47.01, 52.20, ~55.9)
//     travel    26     42     54
//
// The last fades only in its final fifth, so it is at full clarity for most of its climb —
// that is the whole point of the variant, and it is why the timeline is the longest here.
const deepGhost = (
  travel: number,
  scale: number,
  peak: number,
  start: number,
  end: number,
): Variants => ({
  normal: { opacity: 0, scale: 1, x: 0, y: 0 },
  animate: {
    opacity: [0, 0, peak, peak, 0],
    scale: [1, 1, (1 + scale) / 2, scale, scale],
    x: [0, 0, ghostAt(travel * 0.45).x, ghostAt(travel * 0.85).x, ghostAt(travel).x],
    y: [0, 0, ghostAt(travel * 0.45).y, ghostAt(travel * 0.85).y, ghostAt(travel).y],
    transition: {
      duration: 1.9,
      times: [0, start, start + (end - start) * 0.35, end - (end - start) * 0.2, end],
      ease: "easeOut",
    },
  },
});
const deepA = deepGhost(26, 0.8, 0.45, 0.06, 0.5);
const deepB = deepGhost(42, 0.66, 0.7, 0.2, 0.72);
const deepC = deepGhost(54, 0.56, 1, 0.36, 0.95);
// The bell exhales each one out — three dips, one per Z, and nothing like the ring.
const deepShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2.6, -0.6, -2.2, -0.4, -1.8, 0],
    transition: {
      duration: 1.9,
      times: [0, 0.12, 0.26, 0.38, 0.52, 0.64, 1],
      ease: "easeInOut",
    },
  },
};
const deepBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -4.4, -1, -3.7, -0.7, -3, 0],
    transition: {
      duration: 1.9,
      times: [0, 0.16, 0.3, 0.42, 0.56, 0.68, 1],
      ease: "easeInOut",
    },
  },
};

type Cfg = {
  shell: Variants;
  bar: Variants;
  z: Variants;
  /** Wraps the whole glyph — used by Snore to breathe about the collar. */
  body?: Variants;
  bodyAt?: ReturnType<typeof AT>;
  /** Render the Z as its pen stroke instead of its outline, so it can be drawn. */
  draw?: boolean;
  /** Transient copies of the Z, invisible at rest. */
  ghosts?: Variants[];
};

// The bar rides INSIDE the shell's group so its travel is relative to the shell — the
// double-pendulum relationship, for free. The Z rides inside too: it is painted on the bell,
// so it must inherit the swing, with its own scale/drift layered on top of that.
function makeZBell({ shell, bar, z, body, bodyAt, draw = false, ghosts }: Cfg) {
  return forwardRef<IconHandle, IconProps>(function LabZBell({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : body} style={bodyAt}>
            <motion.g variants={reduced ? undefined : shell} style={CROWN}>
              <path d={SHELL} />
              <motion.path d={BAR} variants={reduced ? undefined : bar} />

              {/* Ghosts sit BEHIND the real Z and are invisible at rest. */}
              {!reduced &&
                ghosts?.map((g, i) => (
                  <motion.path key={i} d={Z} variants={g} style={ZC} opacity={0} />
                ))}

              {draw && !reduced ? (
                <motion.path
                  d={Z_STROKE}
                  pathLength={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={Z_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={z}
                  style={ZC}
                />
              ) : (
                <motion.path d={Z} variants={reduced ? undefined : z} style={ZC} />
              )}
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const Ring = makeZBell({ shell: ringShell, bar: ringBar, z: zStill });
const Snooze = makeZBell({ shell: snoozeShell, bar: snoozeBar, z: snoozeZ });
const Breathe = makeZBell({ shell: stillShell, bar: stillBar, z: breatheZ });
const NodOff = makeZBell({ shell: nodShell, bar: nodBar, z: nodZ });
const Float = makeZBell({ shell: floatShell, bar: floatBar, z: floatZ });
const Handwritten = makeZBell({ shell: stillShell, bar: stillBar, z: writeZ, draw: true });
const Snore = makeZBell({
  shell: stillShell,
  bar: stillBar,
  z: snoreZ,
  body: snoreBody,
  bodyAt: COLLAR,
});
const Zzz = makeZBell({
  shell: zzzShell,
  bar: zzzBar,
  z: zStill,
  ghosts: [ghostA, ghostB],
});
const SleepRing = makeZBell({
  shell: sleepRingShell,
  bar: sleepRingBar,
  z: sleepRingZ,
  body: sleepRingBody,
  bodyAt: COLLAR,
});
const Deeper = makeZBell({
  shell: deepShell,
  bar: deepBar,
  z: zStill,
  ghosts: [deepA, deepB, deepC],
});
const SleepWritten = makeZBell({
  shell: stillShell,
  bar: stillBar,
  z: sleepWriteZ,
  body: sleepBody,
  bodyAt: COLLAR,
  draw: true,
});
const RingThenSink = makeZBell({
  shell: sinkShell,
  bar: sinkBar,
  z: sinkZ,
  body: sinkBody,
  bodyAt: COLLAR,
});

export default function BellSimpleZLab() {
  return (
    <VariantGrid
      title="Bell Simple Z"
      cycleMs={3200}
      playMs={1900}
      variants={[
        {
          name: "1 · Ring",
          blurb: "The family spine untouched — the control the others depart from",
          Component: Ring,
        },
        {
          name: "2 · Snooze",
          blurb: "Rings freely, then the Z swells and the swing collapses under it",
          Component: Snooze,
        },
        {
          name: "3 · Breathe",
          blurb: "Bell dead still; only the Z swells, twice, like sleeping breath",
          Component: Breathe,
        },
        {
          name: "4 · Nod off",
          blurb: "Tips, catches itself, gives in — a fall, never an oscillation",
          Component: NodOff,
        },
        {
          name: "5 · Float",
          blurb: "The Z rises along its own 123.69° diagonal and settles back",
          Component: Float,
        },
        {
          name: "6 · Handwritten",
          blurb: "A hand writes the Z on, hesitating at both corners like a real pen",
          Component: Handwritten,
        },
        {
          name: "7 · Snore",
          blurb: "Slow in, quick out — the bell fills and the Z takes what it empties",
          Component: Snore,
        },
        {
          name: "8 · Zzz",
          blurb: "Two more Z's rise off the first — present only mid-gesture",
          Component: Zzz,
        },
        {
          name: "9 · Ring, then sink",
          blurb: "1 + 7. They share headroom, so the ring spends itself and the breath takes over",
          Component: RingThenSink,
        },
        {
          name: "10 · Written in its sleep",
          blurb: "6 + 7. Different channels, so both run full — the pen lifts as the breath turns",
          Component: SleepWritten,
        },
        {
          name: "11 · Ringing in its sleep",
          blurb: "9 at once. 10° and 1.04 — a pair off the curve that fits at any phase",
          Component: SleepRing,
        },
        {
          name: "12 · Deeper",
          blurb: "8 inverted — each rising Z clearer and bigger than the last, not fainter",
          Component: Deeper,
        },
      ]}
    />
  );
}
