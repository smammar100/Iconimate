"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Behance logo icon (Phosphor "behance-logo"), candidates.
 *
 * The mark is "Bē", and it decomposes for free: the three parts are already
 * separate sub-paths with disjoint boxes, so splitting costs nothing and the
 * rest state is the original glyph reassembled.
 *
 *   BAR  x 160..240, y  72..88   the macron over the e
 *   B    x  24..136, y  56..200  the B and its two counters
 *   E    x 152..248, y 104..200  the e and its crossbar hole
 *   ALL  x  24..248, y  56..200
 *
 * Two facts drive every number below. First, the room is lopsided: 56 units of
 * air above and below, 24 to the left, but only 8 to the RIGHT — the e's edge
 * at x=248 is what caps every scale and rightward move. Second, the e is a
 * disc: every point on it is within 48.01 of (200,152), which is its own
 * bounding circle, so rotating it about that point is completely free — the
 * spin in v4 and the roll in v5 cost no bounds at all.
 *
 * Escalating: pop → bar drop → stagger → spin → roll in. v6 is the separately
 * requested App Store-style draw-on.
 */
const BAR = "M160,80a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H168A8,8,0,0,1,160,80Z";
const B =
  "M136,158a42,42,0,0,1-42,42H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H90a38,38,0,0,1,25.65,66A42,42,0,0,1,136,158ZM40,116H90a22,22,0,0,0,0-44H40Zm80,42a26,26,0,0,0-26-26H40v52H94A26,26,0,0,0,120,158Z";
const E =
  "M248,152a8,8,0,0,1-8,8H169a32,32,0,0,0,56.59,11.2,8,8,0,0,1,12.8,9.61A48,48,0,1,1,248,152Zm-17-8a32,32,0,0,0-62,0Z";
/** The three parts concatenated — byte-identical in effect to the original. */
const LOGO = BAR + B + E;

const CENTER = AT(136, 128); // centre of the whole mark
const B_CENTER = AT(80, 128);
const BAR_CENTER = AT(200, 80);
const BAR_FOOT = AT(200, 88); // the bar's underside, so it squashes on landing
const E_CENTER = AT(200, 152); // the e's own circle centre — a free pivot

/* ── 1. POP — the mark announces itself ──────────────────────────────────────
   The baseline: a single spring on the whole logo, dipping under 1 before it
   overshoots. Nothing moves relative to anything else, which is exactly the
   point — it's the version that can't be wrong.

   The peak is 1.05 and not more because of that 8-unit gutter on the right:
   scaling about the centre puts the e's edge at 136 + 112s, which reaches 256
   at s=1.071. 1.05 leaves 2.4 units. */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.93, 1.05, 0.99, 1],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.22, 0.5, 0.78, 1] },
  },
};

const BehancePopIcon = forwardRef<IconHandle, IconProps>(
  function BehancePopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : pop} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. BAR DROP — one part moves ────────────────────────────────────────────
   The first bit of character: the macron is the one piece that reads as
   separate, so it gets to act. It hops up, falls back, and SQUASHES on landing
   — scaleY about its underside (200,88) so the deformation happens against the
   ground rather than around its middle — while the e flinches down under the
   impact and recovers. Cause and effect in two layers.

   The hop clears easily (the bar's top at y=72 has 72 units of air) and the
   1.08 stretch keeps the bar between x 156.8 and 243.2, nowhere near the e,
   which starts 16 units lower at y=104. */
const barHop: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, 0, 0, 0],
    scaleY: [1, 1.06, 0.7, 1.05, 1],
    scaleX: [1, 0.96, 1.08, 0.98, 1],
    transition: { duration: 0.78, ease: "easeIn", times: [0, 0.34, 0.56, 0.78, 1] },
  },
};
const barImpact: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 3, 0, 0],
    transition: { duration: 0.78, ease: "easeOut", times: [0, 0.54, 0.64, 0.82, 1] },
  },
};

const BehanceBarDropIcon = forwardRef<IconHandle, IconProps>(
  function BehanceBarDropIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={B} />
          <motion.path d={E} variants={reduced ? undefined : barImpact} />
          <motion.path d={BAR} variants={reduced ? undefined : barHop} style={BAR_FOOT} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. STAGGER — the mark assembles ─────────────────────────────────────────
   Now all three parts move, and each enters from the direction it has room in:
   the B from the left (24 units of gutter), the e from BELOW (56 units) rather
   than from the right where there are only 8, and the bar from above. Each
   overshoots its resting place and settles, 0.09s apart, so the eye reads an
   order rather than a single event. */
const ENTER_TIMES = [0, 0.72, 1];
const enterX = (from: number, delay: number): Variants => ({
  normal: { x: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [from, -from * 0.18, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.62, ease: "easeOut", times: ENTER_TIMES, delay },
  },
});
const enterY = (from: number, delay: number): Variants => ({
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [from, -from * 0.18, 0],
    opacity: [0, 1, 1],
    transition: { duration: 0.62, ease: "easeOut", times: ENTER_TIMES, delay },
  },
});
const enterB = enterX(-22, 0);
const enterE = enterY(26, 0.09);
const enterBar = enterY(-28, 0.18);

const BehanceStaggerIcon = forwardRef<IconHandle, IconProps>(
  function BehanceStaggerIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={B} variants={reduced ? undefined : enterB} />
          <motion.path d={E} variants={reduced ? undefined : enterE} />
          <motion.path d={BAR} variants={reduced ? undefined : enterBar} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. SPIN — the e is a wheel ──────────────────────────────────────────────
   The step up is that the geometry itself suggests the motion. The e is a disc:
   every point on it lies within 48.01 of (200,152), which is exactly its own
   bounding circle, so a full revolution about that point sweeps no new ground
   whatsoever — it cannot leave the box no matter how fast or far it turns. The
   crossbar inside is what makes the rotation legible.
   Around it, the other two react rather than compete: the bar tilts like a
   lever and levels off, and the B gives one small squash as the e comes to
   rest — the spin lands instead of just stopping. */
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 375, 360],
    transition: { duration: 1.05, ease: [0.65, 0, 0.35, 1], times: [0, 0.82, 1] },
  },
};
const spinBar: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 5, -2, 0],
    transition: { duration: 1.05, ease: "easeInOut", times: [0, 0.24, 0.55, 0.8, 1] },
  },
};
const spinB: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.94, 1.03, 1],
    scaleX: [1, 1, 1.05, 0.98, 1],
    transition: { duration: 1.05, ease: "easeOut", times: [0, 0.72, 0.84, 0.93, 1] },
  },
};

const BehanceSpinIcon = forwardRef<IconHandle, IconProps>(
  function BehanceSpinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={B} variants={reduced ? undefined : spinB} style={B_CENTER} />
          <motion.path d={E} variants={reduced ? undefined : spin} style={E_CENTER} />
          <motion.path d={BAR} variants={reduced ? undefined : spinBar} style={BAR_CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. ROLL IN — the showpiece ──────────────────────────────────────────────
   Everything above, arranged as one arrival. The B slides in from the left, the
   e ROLLS in from the right, and the bar drops onto it last and bounces.

   The roll is the reason this one is the showpiece: the e's rotation is locked
   to its travel the way a real wheel's is. Rolling a disc of radius r a
   distance d turns it by exactly d/r radians, so travelling 72 units in turns
   it 72/48 = 1.5 rad = 85.9°, and the 6-unit overshoot turns it a further
   6/48 = 7.2°. Every rotation number here is that quotient, not a guess — get
   it wrong and the wheel visibly skids.
   The entrances start outside the box on purpose and are clipped by the
   wrapper's overflow:hidden; from the overshoot onward everything is inside,
   and the B's rebound (right edge 141) never reaches the e's (left edge 146). */
const rollB: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [-70, 5, 0],
    transition: { duration: 0.66, ease: "easeOut", times: [0, 0.74, 1] },
  },
};
const rollE: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [72, -6, 0],
    rotate: [85.9, -7.2, 0], // d/r: 72/48 and 6/48 radians, in degrees
    transition: { duration: 0.78, ease: "easeOut", times: [0, 0.76, 1], delay: 0.12 },
  },
};
const rollBar: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-46, 0, 0, 0],
    scaleY: [1, 0.72, 1.06, 1],
    transition: { duration: 0.5, ease: "easeIn", times: [0, 0.6, 0.82, 1], delay: 0.5 },
  },
};

const BehanceRollInIcon = forwardRef<IconHandle, IconProps>(
  function BehanceRollInIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={B} variants={reduced ? undefined : rollB} />
          <motion.path d={E} variants={reduced ? undefined : rollE} style={E_CENTER} />
          <motion.path d={BAR} variants={reduced ? undefined : rollBar} style={BAR_FOOT} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. DRAW — the App Store-style reveal ────────────────────────────────────
   The outline traces itself, then the solid mark fades up underneath it — the
   way the App Store draws its icons on.

   Two stacked layers per part: a stroked copy with no fill that animates
   `pathLength` 0 → 1, and the real filled copy that fades in behind it as the
   stroke retires. They draw in reading order, B → e → bar, each starting a
   little before the last one finishes so the line never appears to stop.
   The filled layer rests at opacity 1 and the stroke at 0, so the rest state is
   the plain glyph. The 6-unit stroke adds a 3-unit halo around the box
   (x 21..251, y 53..203), which still clears the edges. */
const DRAW_STROKE = 6;
const drawLine = (delay: number, duration: number): Variants => ({
  normal: { pathLength: 1, opacity: 0, transition: { duration: 0.2 } },
  animate: {
    pathLength: [0, 1, 1],
    opacity: [1, 1, 0],
    transition: { duration, ease: "easeInOut", times: [0, 0.78, 1], delay },
  },
});
const drawFill = (delay: number): Variants => ({
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1],
    transition: { duration: 0.85, ease: "easeOut", times: [0, 0.55, 1], delay },
  },
});
const lineB = drawLine(0, 0.85);
const lineE = drawLine(0.42, 0.85);
const lineBar = drawLine(0.84, 0.5);
const fillB = drawFill(0.5);
const fillE = drawFill(0.92);
const fillBar = drawFill(1.16);

const BehanceDrawIcon = forwardRef<IconHandle, IconProps>(
  function BehanceDrawIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <Svg size={size} controls={controls}>
            <path d={LOGO} />
          </Svg>
        </div>
      );
    }
    const stroke = {
      fill: "none",
      stroke: "currentColor",
      strokeWidth: DRAW_STROKE,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    };
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={B} variants={fillB} />
          <motion.path d={E} variants={fillE} />
          <motion.path d={BAR} variants={fillBar} />
          <motion.path d={B} {...stroke} variants={lineB} />
          <motion.path d={E} {...stroke} variants={lineE} />
          <motion.path d={BAR} {...stroke} variants={lineBar} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BehancePopIcon }[] = [
  { name: "Pop", blurb: "One spring on the whole mark — dips, overshoots, settles", Component: BehancePopIcon },
  { name: "Bar drop", blurb: "The macron hops, lands and squashes; the e flinches under it", Component: BehanceBarDropIcon },
  { name: "Stagger", blurb: "B, e and bar each fly in from the side they have room on", Component: BehanceStaggerIcon },
  { name: "Spin", blurb: "The e turns a full revolution inside its own circle; the bar levers", Component: BehanceSpinIcon },
  { name: "Roll in", blurb: "The e rolls in on locked wheel physics, the bar drops on last", Component: BehanceRollInIcon },
  { name: "Draw", blurb: "The outline traces itself B → e → bar, then the solid mark fades up", Component: BehanceDrawIcon },
];

export default function BehanceLogoLabPage() {
  return <VariantGrid title="Behance Logo" variants={VARIANTS} cycleMs={4000} playMs={2600} />;
}
