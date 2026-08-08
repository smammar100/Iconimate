"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Binary, five takes.
 *
 * THE GLYPH IS A 2x2 GRID OF DIGITS, and that is the whole opportunity: almost
 * every other icon in this set is one connected mark, but this one is four
 * independent shapes that can be driven separately. Measured off the rendered
 * fill:
 *
 *   0  x56..131.75  y24..119.75   centre (93.9, 71.9)      row 1 reads "0 1"
 *   1  x144..183.75 y24..119.75   centre (163.9, 71.9)
 *   1  x64..103.75  y136..231.75  centre (83.9, 183.9)     row 2 reads "1 0"
 *   0  x128..203.75 y136..231.75  centre (165.9, 183.9)
 *
 * SPLITTING IT IS SAFE, AND WAS CHECKED RATHER THAN ASSUMED. The source is one
 * compound path whose subpaths chain by RELATIVE `m` commands — the second zero
 * begins `m72,32` from wherever the first one's hole ended — so the split is not
 * a matter of cutting the string at `M`. Each start point was resolved to an
 * absolute `M`, and the four pieces painted together measure 2 ink flips against
 * the original out of 174,649 ink pixels: antialiasing where separate fills abut,
 * not drift. Both zeros keep their outer AND inner subpath so the counter stays
 * punched.
 */
const ZERO_TL =
  "M94,24C71.63,24,56,43.74,56,72s15.63,48,38,48,38-19.74,38-48S116.37,24,94,24ZM94,104c-17.37,0-22-20.11-22-32s4.63-32,22-32,22,20.11,22,32S111.37,104,94,104Z";
const ONE_TR =
  "M145,49.22a8,8,0,0,1,3.11-10.88l24-13.33A8,8,0,0,1,184,32v80a8,8,0,0,1-16,0V45.6l-12.12,6.73A8,8,0,0,1,145,49.22Z";
const ONE_BL =
  "M104,144v80a8,8,0,0,1-16,0V157.6l-12.12,6.73a8,8,0,0,1-7.76-14l24-13.33A8,8,0,0,1,104,144Z";
const ZERO_BR =
  "M166,136c-22.37,0-38,19.74-38,48s15.63,48,38,48,38-19.74,38-48S188.37,136,166,136ZM166,216c-17.37,0-22-20.11-22-32s4.63-32,22-32,22,20.11,22,32S183.37,216,166,216Z";

/** Reading order — top-left, top-right, bottom-left, bottom-right. Every
 *  stagger below runs in this order, because that is how the number is read. */
const DIGITS = [
  { d: ZERO_TL, cx: 93.9, cy: 71.9 },
  { d: ONE_TR, cx: 163.9, cy: 71.9 },
  { d: ONE_BL, cx: 83.9, cy: 183.9 },
  { d: ZERO_BR, cx: 165.9, cy: 183.9 },
];

/* ══ 1. FLIP ═════════════════════════════════════════════════════════════════
   Each digit turns on its own vertical axis and comes back, one after another
   in reading order — a row of bits being flipped.

   scaleX BOTTOMS AT 0.04, NOT 0. A zero-width fill is not merely invisible, it
   is degenerate: the browser may drop the whole path for that frame and pop it
   back a frame later, which reads as a stutter exactly at the moment the eye is
   watching. 0.04 is under a pixel at ship size and cannot be seen, but it keeps
   the geometry non-degenerate the whole way through. The squash on scaleY is
   what stops it reading as a shutter closing rather than a card turning. */
const flip = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.04, 1],
    scaleY: [1, 1.06, 1],
    transition: {
      duration: 0.62,
      delay: i * 0.09,
      times: [0, 0.5, 1],
      ease: ["easeIn", "easeOut"],
    },
  },
});

/* ══ 2. CASCADE ══════════════════════════════════════════════════════════════
   A pop travels through the four digits in reading order, like a value being
   clocked through a register. The overshoot is followed by a small undershoot
   so each digit SETTLES rather than snapping — a pop that returns straight to 1
   reads as a glitch, not as a landing. */
const cascade = (i: number): Variants => ({
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.24, 0.94, 1],
    transition: {
      duration: 0.66,
      delay: i * 0.11,
      times: [0, 0.4, 0.72, 1],
      ease: ["easeOut", "easeInOut", "easeOut"],
    },
  },
});

/* ══ 3. SWAP ═════════════════════════════════════════════════════════════════
   THE BEST TRICK THIS GLYPH ALLOWS. The two zeros trade places and the two ones
   trade places, all four orbiting at once — and because each pair is the SAME
   SHAPE, the arrangement it lands on is identical to the one it left. The digits
   visibly rearrange and the number is unchanged, which is exactly what shuffling
   bits looks like.

   The pairs are NOT point-symmetric about the artboard centre, so this cannot be
   a rotation: reflecting the top-left zero through (128,128) lands at (162.1,
   184.1) where the bottom-right zero actually sits at (165.9, 183.9), and the
   ones miss by 8.2. Each digit therefore carries its own measured delta.

   THEY TRAVEL ON ARCS, NOT CHORDS. Sent straight, opposite pairs pass through
   each other at the midpoint and merge into one blob for a frame — at one colour
   there is nothing to tell them apart. Bulging each path outward routes them
   around one another instead.

   IT LAGGED, AND THE ARC KEYFRAME WAS WHY. Written as three keyframes
   [start, via, end] with `easeInOut`, motion eases EACH SEGMENT — so a digit
   decelerated to a dead stop at the midpoint of its own arc and then set off
   again. Mid-orbit is the most conspicuous place on the path to stall, and it
   read as the whole gesture dragging. The arc is now SAMPLED: a quadratic
   Bezier through the same via point, evaluated at 24 points with the ease baked
   into the PARAMETER and `linear` laid over the samples, so the velocity profile
   runs end to end with nothing to catch on. Duration came down 0.86s -> 0.6s
   once the stall was gone; most of what felt slow was the pause, not the length.

   THE STAGGER WAS ALSO SPLITTING THE PAIRS — a real bug, not a taste call. It
   keyed off `i < 2`, but the pairs are (0,3) for the zeros and (1,2) for the
   ones, so it started each zero 60ms apart from its own partner. Two shapes that
   are meant to exchange places have to move in lockstep or the exchange stops
   reading as one. The stagger is now BY PAIR. */
const D = DIGITS;
const SWAP = [
  { to: [D[3].cx - D[0].cx, D[3].cy - D[0].cy], via: [56, 46], pair: 0 }, // 0: TL -> BR
  { to: [D[2].cx - D[1].cx, D[2].cy - D[1].cy], via: [-58, 46], pair: 1 }, // 1: TR -> BL
  { to: [D[1].cx - D[2].cx, D[1].cy - D[2].cy], via: [58, -46], pair: 1 }, // 1: BL -> TR
  { to: [D[0].cx - D[3].cx, D[0].cy - D[3].cy], via: [-56, -46], pair: 0 }, // 0: BR -> TL
];
const SWAP_STEPS = 24;
const swapClock = Array.from({ length: SWAP_STEPS + 1 }, (_, k) => k / SWAP_STEPS);
/** Cubic in/out, applied to the arc PARAMETER rather than between keyframes. */
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const swap = (i: number): Variants => {
  const { to, via } = SWAP[i];
  // Control point of a quadratic that passes exactly through `via` at u = 0.5,
  // given P0 = (0,0): C = 2*via - P2/2.
  const c = [2 * via[0] - to[0] / 2, 2 * via[1] - to[1] / 2];
  const pts = swapClock.map((t) => {
    const u = easeIO(t);
    const m = 1 - u;
    return [2 * m * u * c[0] + u * u * to[0], 2 * m * u * c[1] + u * u * to[1]];
  });
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: {
      x: pts.map((p) => +p[0].toFixed(2)),
      y: pts.map((p) => +p[1].toFixed(2)),
      transition: {
        duration: 0.6,
        delay: SWAP[i].pair * 0.05,
        times: swapClock,
        ease: "linear",
      },
    },
  };
};

/* ══ 6. SHUFFLE — 1 x 3 ══════════════════════════════════════════════════════
   `swap`'s orbit with `flip`'s turn laid over it: the digits trade places and
   each one turns edge-on on the way, so the bits are visibly rewritten as they
   are rearranged.

   THE TURN IS TIMED TO THE CROSSING, AND THAT IS THE WHOLE POINT OF COMBINING
   THEM. Each digit is thinnest at exactly the moment it passes its opposite
   number — which is the very problem the arc was introduced to work around.
   Two full-width shapes crossing at one colour merge into a blob for a frame;
   two shapes that are 4% wide as they cross do not touch at all. The bulge is
   kept anyway, so the paths separate in both axes rather than relying on the
   turn alone, but it no longer has to do the work by itself.

   BOTH TRACKS RIDE THE SAME 25 SAMPLES. Putting the turn on its own keyframe
   list would re-introduce exactly the stall that `swap` was just fixed for —
   two tracks of different lengths on one element get eased independently. So
   scale is evaluated per sample like position is, from a continuous function
   rather than from keyframes.

   sin^2 IS THE RIGHT SHAPE FOR IT: it is 0 at both ends and 1 in the middle, and
   its derivative is zero at ALL THREE, so the turn starts from rest, holds a
   beat edge-on, and arrives at rest. A plain sine would start the turn with the
   digit already moving, which reads as a snap at the moment of departure. */
const swapFlip = (i: number): Variants => {
  const { to, via } = SWAP[i];
  const c = [2 * via[0] - to[0] / 2, 2 * via[1] - to[1] / 2];
  const pts = swapClock.map((t) => {
    const u = easeIO(t);
    const m = 1 - u;
    return [2 * m * u * c[0] + u * u * to[0], 2 * m * u * c[1] + u * u * to[1]];
  });
  // turn is on the CLOCK, not the eased parameter — easeIO(0.5) === 0.5, so the
  // spatial midpoint and the edge-on moment coincide without forcing them to.
  const turn = swapClock.map((t) => Math.sin(Math.PI * t) ** 2);
  return {
    normal: { x: 0, y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
    animate: {
      x: pts.map((p) => +p[0].toFixed(2)),
      y: pts.map((p) => +p[1].toFixed(2)),
      scaleX: turn.map((s) => +(1 - 0.96 * s).toFixed(3)),
      scaleY: turn.map((s) => +(1 + 0.06 * s).toFixed(3)),
      transition: {
        duration: 0.72,
        delay: SWAP[i].pair * 0.05,
        times: swapClock,
        ease: "linear",
      },
    },
  };
};

/* ══ 4. SCAN ═════════════════════════════════════════════════════════════════
   A line crosses the mark top to bottom: each ROW dims a moment before it
   arrives, flares as it passes, and settles. Row-wise is what separates this
   from `cascade` — that one clocks through in reading order, one digit at a
   time; this one takes both digits of a row together, which is what a
   horizontal line sweeping down actually does.

   NEVER GATE AN ICON'S EXISTENCE ON AN ANIMATION FINISHING. The first cut of
   this drew the digits under a travelling clip so the mark wrote itself on —
   and it was wrong, because a clip REMOVES artwork. Any frame where that
   animation is interrupted or throttled leaves the tile completely EMPTY, and
   it is trivially reproducible: a background tab stops rAF, motion's sweep
   freezes wherever it stood, and the clip sits off-artboard admitting nothing.
   Measured in that state — clip covering y[-281, -5] against a glyph spanning
   y[24, 232] — the icon rendered as blank. The other four variants degrade
   gracefully because a frozen scale or translate still shows the glyph.
   So the paths here are ALWAYS drawn and the sweep only ever modulates them;
   opacity has a floor and never reaches 0. A stalled frame looks like a slightly
   dim icon, which is a non-event. */
const SCAN_FLOOR = 0.4;
const scan = (i: number): Variants => {
  const row = i < 2 ? 0 : 1;
  const t0 = 0.12 + row * 0.26;
  return {
    normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
    animate: {
      opacity: [1, SCAN_FLOOR, 1, 1],
      scale: [1, 0.95, 1.13, 1],
      transition: {
        duration: 0.92,
        times: [0, t0, t0 + 0.16, 1],
        ease: ["easeIn", "easeOut", "easeOut"],
      },
    },
  };
};

/* ══ 5. GLITCH ═══════════════════════════════════════════════════════════════
   Corruption: the digits tear sideways and flicker out of step, then lock back.
   The offsets are HAND-PICKED PER DIGIT, not random — a registry icon has to
   play the same way every time it is hovered, and a random glitch is a different
   icon on every pass. The flicker never reaches 0 for the same reason `flip`
   never reaches scaleX 0: a digit that vanishes completely reads as a dropped
   frame rather than as interference. */
const TEAR = [
  { x: [0, 7, -4, 9, -2, 0], o: [1, 0.3, 1, 0.45, 0.9, 1] },
  { x: [0, -6, 8, -3, 5, 0], o: [1, 0.85, 0.25, 1, 0.5, 1] },
  { x: [0, 5, -9, 4, -6, 0], o: [1, 0.4, 0.9, 0.3, 1, 1] },
  { x: [0, -8, 3, -7, 2, 0], o: [1, 0.9, 0.4, 0.85, 0.35, 1] },
];
const glitch = (i: number): Variants => ({
  normal: { x: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: TEAR[i].x,
    opacity: TEAR[i].o,
    transition: {
      duration: 0.78,
      times: [0, 0.14, 0.32, 0.5, 0.7, 1],
      ease: "linear", // steps, not curves — interference does not ease
    },
  },
});

/* ── assembly ────────────────────────────────────────────────────────────── */

/** Four independently driven digits, each spun about its OWN measured centre. */
function makeDigits(per: (i: number) => Variants) {
  return forwardRef<IconHandle, IconProps>(function BinaryIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          {DIGITS.map((g, i) => (
            <motion.path key={i} d={g.d} variants={per(i)} style={AT(g.cx, g.cy)} />
          ))}
        </Svg>
      </div>
    );
  });
}

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
        {DIGITS.map((g, i) => (
          <path key={i} d={g.d} />
        ))}
      </svg>
    </div>
  );
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Flip",
    blurb: "Each digit turns on its own axis, in reading order — a row of bits being flipped.",
    Component: makeDigits(flip),
  },
  {
    name: "2 · Cascade",
    blurb: "A pop clocks through the four digits and settles, like a value moving down a register.",
    Component: makeDigits(cascade),
  },
  {
    name: "3 · Swap",
    blurb: "The zeros trade places and the ones trade places — same shapes, so it lands unchanged.",
    Component: makeDigits(swap),
  },
  {
    name: "4 · Scan",
    blurb: "A line crosses top to bottom — each row dims, flares as it passes, then settles.",
    Component: makeDigits(scan),
  },
  {
    name: "5 · Glitch",
    blurb: "Digits tear sideways and flicker out of step, then lock back. Hand-picked, never random.",
    Component: makeDigits(glitch),
  },
  {
    name: "6 · Shuffle",
    blurb: "1 x 3 — the digits trade places and turn edge-on exactly as they cross each other.",
    Component: makeDigits(swapFlip),
  },
];

export default function BinaryLab() {
  return <VariantGrid title="Binary" variants={VARIANTS} cycleMs={3000} playMs={1500} />;
}
