"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bird, five takes.
 *
 * THE EYE IS SEPARATELY ADDRESSABLE, AND THAT IS THE WHOLE OPPORTUNITY. The mark
 * splits into three subpaths: the eye, the outer body boundary, and the body's
 * inner counter. Measured at 512x512, rendering `BODY` + `EYE` instead of the
 * single authored `d` flips 3 of 50,248 ink pixels — 0.006%, i.e. antialiasing
 * round-off at the split boundary and nothing else. So the eye can be lifted out
 * and animated on its own without touching the resting picture, which is what
 * `1 · Blink` and `5 · Tilt` are built on.
 *
 * ONLY THE EYE MAY BE LIFTED OUT, and that is a property of the path data rather
 * than a stylistic choice. The eye starts `M176,68` — ABSOLUTE. The other two
 * subpaths start `m64,12` and `m-22.42,0` — RELATIVE, positioned by whatever
 * precedes them. Copy either out verbatim and it lands somewhere else entirely
 * (the counter renders at x-22.42). `BODY` below therefore resolves both by hand:
 * after a `Z` the current point returns to that subpath's own start, so the body
 * opens at (176+64, 68+12) = (240,80) and the counter at (240-22.42, 80) =
 * (217.58, 80). Those two numbers are why the split measures clean; get them
 * wrong and the mark comes apart.
 *
 * MEASURED OFF THE RENDERED GLYPH (256 grid):
 *   ink bbox     x8..240, y16..224 — 8 units of margin on the left, 16 on the
 *                right. There is no real lateral lane, so pops stay near 1.04
 *                and the travel in `2 · Take Off` is vertical-dominant.
 *   bbox centre  (124, 120)
 *   eye centre   (164, 68), r12
 *   tail tip     the arc runs (24,224) -> (11.51,198); (18,208) is the pivot
 *                `3 · Bob` rotates about, i.e. the point the bird sits on.
 *
 * THE MARK IS A SILHOUETTE WITH ONE LONG SWEPT TAIL, and every rotation variant
 * exploits that: turning about the HEAD throws the tail through a wide arc (a
 * wingbeat), turning about the TAIL throws the head through a small one (a bob).
 * Same property, opposite pivots, and they read as completely different gestures.
 * Rotating about the bbox centre gives neither and just looks like the icon is
 * askew — tried first, discarded.
 */
const BIRD =
  "M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Zm64,12a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80Zm-22.42,0L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208h26.9l70.94-85.12a8,8,0,1,1,12.29,10.24L71.75,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";

/** Subpath 0 verbatim — the only one that starts absolute, so the only one safe to lift. */
const EYE = "M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Z";
/** Subpaths 1 and 2 with their relative movetos resolved to (240,80) and (217.58,80). */
const BODY =
  "M240,80a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80ZM217.58,80L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208h26.9l70.94-85.12a8,8,0,1,1,12.29,10.24L71.75,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";

const CX = 124; // bbox centre
const CY = 120;
const EYE_X = 164; // eye centre — the blink pivot
const EYE_Y = 68;
const TAIL_X = 18; // where the bird sits — the bob pivot
const TAIL_Y = 208;
const HEAD_X = 176; // shoulder/head — the wingbeat pivot
const HEAD_Y = 76;

/* ══ 1. BLINK ════════════════════════════════════════════════════════════════
   The body never moves. The eye closes twice, and that is the entire icon.

   THIS IS THE ONE GESTURE THE GLYPH ALREADY CONTAINS. Every other variant here
   imposes motion on a silhouette; this one animates a feature that is actually
   drawn. It costs one transform on a 24-unit circle and reads instantly.

   SCALE-Y TO 0.08, NOT TO 0. At 0 the element vanishes and the eye pops out of
   existence — a hole appears in the head for two frames. At 0.08 the circle
   renders as a ~1.9-unit lens: a closed lid, still ink, still there. The floor
   matters more than the curve here.

   THE SECOND BLINK IS THE POINT. One blink reads as a rendering glitch; two,
   with the gap between them (176ms) longer than the blink itself (176ms
   close+open), reads as a living thing. Even the two intervals out and it
   becomes a flicker. */
const blinkEye: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.08, 1, 1, 0.08, 1, 1],
    transition: {
      duration: 1.6,
      times: [0, 0.18, 0.235, 0.29, 0.4, 0.455, 0.51, 1],
      ease: ["linear", "easeIn", "easeOut", "linear", "easeIn", "easeOut", "linear"],
    },
  },
};

/* ══ 2. TAKE OFF ═════════════════════════════════════════════════════════════
   Crouch, launch up and to the right, glide back down to the perch.

   THE CROUCH IS NON-NEGOTIABLE. Without the dip at 0.22 the bird simply
   translates upward and reads as the icon being dragged. With it, the launch is
   caused by something.

   THE TRAVEL IS VERTICAL-DOMINANT (-22y against +16x) because the mark has 8
   units of margin on the left and 16 on the right but 16 above — the bbox is
   y16..224, so up is the only direction with room to read before the artboard
   runs out. It still passes outside on the way; the lab harness renders with
   overflow visible, and promoting this variant would need the wrapper opened up
   the way `airplane-taxiing` does.

   ROTATION LEADS THE TRANSLATION slightly (-11 at the apex): a body that stays
   level while rising reads as an elevator, one that pitches into the climb reads
   as flight. */
const takeOff: Variants = {
  normal: { x: 0, y: 0, rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -3, 16, 0],
    y: [0, 5, -22, 0],
    rotate: [0, 3, -11, 0],
    scale: [1, 0.97, 1.02, 1],
    transition: {
      duration: 1.25,
      times: [0, 0.22, 0.55, 1],
      ease: ["easeOut", [0.16, 0.9, 0.3, 1], "easeInOut"],
    },
  },
};

/* ══ 3. BOB ══════════════════════════════════════════════════════════════════
   A perched bird ducking its head — twice, the second smaller.

   THE PIVOT IS THE TAIL TIP (18,208), the point the bird rests on. Rotating
   there swings the head (the far end of a ~150-unit diagonal) through a visible
   arc while the contact point stays nailed down, which is exactly how a bob
   works. Clockwise is head-down, because the head is up and to the RIGHT.

   SEVEN DEGREES IS THE CEILING. At 10 the head leaves the artboard top; at 4 it
   reads as a wobble rather than a deliberate duck.

   THE RECOVERY IS SLOWER THAN THE DUCK (0.14 down, 0.20 up) — the down-stroke is
   the muscle and the return is gravity releasing. Symmetric timing reads
   mechanical. */
const bob: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 7, 0, 5, 0, 0],
    transition: {
      duration: 1.1,
      times: [0, 0.14, 0.34, 0.48, 0.66, 1],
      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "linear"],
    },
  },
};

/* ══ 4. FLAP ═════════════════════════════════════════════════════════════════
   Four wingbeats, decaying.

   THE PIVOT IS THE HEAD (176,76) — the opposite end from `3 · Bob`, and that
   single change is what turns the same rotation into a completely different
   gesture. The tail is the longest part of the mark; hung off a pivot up in the
   head it sweeps a wide arc and reads as a wing, not as the icon tilting.

   THE BEATS ARE UNEVEN AND DECAYING (-12, +7, -9, +5, -3) rather than a clean
   sine. A symmetric oscillation reads as a metronome; wingbeats lose energy, and
   the down-stroke (negative here) is always stronger than the recovery, which is
   why the negatives lead and stay larger.

   NO SCALE. Squash-and-stretch was tried and reads as the bird breathing rather
   than flying — the silhouette's mass is in the tail, so scaling it pumps the
   wrong end. */
const flap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -12, 7, -9, 5, -3, 0],
    transition: {
      duration: 1.15,
      times: [0, 0.13, 0.28, 0.43, 0.58, 0.73, 1],
      ease: "easeInOut",
    },
  },
};

/* ══ 5. TILT ═════════════════════════════════════════════════════════════════
   The bird cocks its head, blinks while held over, and straightens up.

   THE BLINK LANDS INSIDE THE HOLD, NOT BESIDE IT. The tilt reaches 12° at 0.22
   and stays there until 0.68; the eye closes at 0.40, dead centre of that
   plateau. Fire the blink during the travel and the two gestures compete and
   both get lost — the whole effect is that the bird arrives, looks at you, then
   leaves.

   THE EYE RIDES INSIDE THE TILTED GROUP so its own scale-Y is applied in the
   rotated frame — the lid closes along the head's axis rather than along the
   screen's. Hoist it out to a sibling and the closed eye visibly shears against
   the tilted head.

   TWELVE DEGREES ABOUT THE BBOX CENTRE, which is the one place a plain tilt is
   the right call: this gesture wants the WHOLE mark to lean, not to pivot off an
   anchor the way 3 and 4 do. */
const tiltBody: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 12, 12, 0],
    transition: { duration: 1.5, times: [0, 0.22, 0.68, 1], ease: ["easeOut", "linear", "easeInOut"] },
  },
};
const tiltEye: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.08, 1, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.36, 0.42, 0.48, 1],
      ease: ["linear", "easeIn", "easeOut", "linear"],
    },
  },
};

/* ══ 6. WINGS ════════════════════════════════════════════════════════════════
   The big one. The bird's OWN wing lifts out of its body and beats three times
   while the body rides the beats and the eye blinks twice.

   THE WING IS ALREADY IN THE GLYPH. It is the diagonal bar across the belly —
   easy to mistake for a decorative crease, but it is the wing, and it is drawn
   as a detour in the COUNTER subpath: `h26.9 l70.94-85.12 a8,8,0,1,1,12.29,10.24
   L71.75,208`. That detour makes the bar a peninsula of ink protruding into the
   hollow chest. An earlier take here drew two new wings onto the bird's back
   instead; that was wrong, and it was thrown away. Never add geometry a mark
   already contains.

   THE BAR IS A 16-WIDE ROUND-CAPPED STROKE, derived rather than guessed. Its two
   long edges run (50.9,208)->(121.84,122.88) and (134.13,133.12)->(71.75,208),
   so the centreline is (61.33,208)->(127.99,128). The two bottom points are
   20.85 apart along y=208; projected onto the bar's perpendicular that is 16.02
   — Phosphor's stroke weight exactly. The `a8,8` arc at the top is a round cap
   of the same 16. So the wing restates as one stroked line, and `BODY_NO_WING`
   is the mark with that detour replaced by a flat floor (`L24,208 H112`).

   MEASURED: `BODY_NO_WING` + the stroked wing + the eye differ from the authored
   `d` by 31 of 50,248 ink pixels at 512x512 — 0.062%, all of it antialiasing
   along the bar's edges where a stroke meets an outline. Rest is the source mark.

   IT HINGES AT THE SHOULDER (127.99,128), the round-capped end. That is both the
   anatomically right pivot and the convenient one — a round cap rotating about
   its own centre is invariant, so the joint never shows a corner.

   POSITIVE ROTATION IS UP AND OUT. Measured: at +45 the tip clears the body's
   back edge, at +68 the wing stands clear of the outline entirely, which is the
   "comes out of the body" read. NEGATIVE rotation drives the wing down through
   the belly floor and out of the bottom of the mark, so the down-strokes bottom
   out at +8 rather than going past 0 — the wing returns to its socket and stops.

   THE BODY RIDES, IT DOES NOT DRIVE. Its lift peaks (-8, -10, -7) sit between
   the wing's down-strokes, so the bird rises on each beat. Give the body a big
   rotation here as well and it competes with the wing; `4 · Flap` already owns
   that idea. */
const WING = "M61.33,208L127.99,128";
const WING_X = 127.99; // the shoulder — the round-capped end of the bar
const WING_Y = 128;
/** The mark with the wing detour replaced by a flat hollow floor. */
const BODY_NO_WING =
  "M240,80a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80ZM217.58,80L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";

const wingBeat: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 68, 8, 58, 12, 48, 16, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.2, 0.34, 0.48, 0.62, 0.74, 0.86, 1],
      ease: "easeInOut",
    },
  },
};
const wingsBody: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 2, -10, 2, -7, 0],
    rotate: [0, -5, 3, -5, 2, -3, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.22, 0.36, 0.5, 0.64, 0.78, 1],
      ease: "easeInOut",
    },
  },
};
const wingsEye: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.08, 1, 1, 0.08, 1, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.3, 0.35, 0.4, 0.58, 0.63, 0.68, 1],
      ease: ["linear", "easeIn", "easeOut", "linear", "easeIn", "easeOut", "linear"],
    },
  },
};

/* ── variants ────────────────────────────────────────────────────────────── */

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
        <path d={BIRD} />
      </svg>
    </div>
  );
}

/** Whole-mark variants: one path, one transform — rest fidelity is trivially exact. */
function makeSimple(name: string, variants: Variants, ox: number, oy: number) {
  const C = forwardRef<IconHandle, IconProps>(function BirdIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BIRD} variants={variants} style={AT(ox, oy)} />
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const TakeOffIcon = makeSimple("TakeOffIcon", takeOff, CX, CY);
const BobIcon = makeSimple("BobIcon", bob, TAIL_X, TAIL_Y);
const FlapIcon = makeSimple("FlapIcon", flap, HEAD_X, HEAD_Y);

const BlinkIcon = forwardRef<IconHandle, IconProps>(function BlinkIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <path d={BODY} />
        <motion.path d={EYE} variants={blinkEye} style={AT(EYE_X, EYE_Y)} />
      </Svg>
    </div>
  );
});

const TiltIcon = forwardRef<IconHandle, IconProps>(function TiltIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {/* Eye nested inside the tilt so the lid closes along the head's axis. */}
        <motion.g variants={tiltBody} style={AT(CX, CY)}>
          <path d={BODY} />
          <motion.path d={EYE} variants={tiltEye} style={AT(EYE_X, EYE_Y)} />
        </motion.g>
      </Svg>
    </div>
  );
});

const WingsIcon = forwardRef<IconHandle, IconProps>(function WingsIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {/* Everything rides the body's lift, so the wing stays attached to it. */}
        <motion.g variants={wingsBody} style={AT(CX, CY)}>
          <path d={BODY_NO_WING} />
          {/* The mark's own wing, restated as the stroke it already is. */}
          <motion.path
            d={WING}
            variants={wingBeat}
            style={AT(WING_X, WING_Y)}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
          />
          <motion.path d={EYE} variants={wingsEye} style={AT(EYE_X, EYE_Y)} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── assembly ────────────────────────────────────────────────────────────── */

const VARIANTS: LabVariant[] = [
  { name: "1 · Blink", blurb: "Body still — the eye closes twice", Component: BlinkIcon },
  { name: "2 · Take Off", blurb: "Crouch, launch up-right, glide back", Component: TakeOffIcon },
  { name: "3 · Bob", blurb: "Ducks its head about the tail tip", Component: BobIcon },
  { name: "4 · Flap", blurb: "Tail sweeps off the head — four decaying beats", Component: FlapIcon },
  { name: "5 · Tilt", blurb: "Cocks its head, blinks, straightens", Component: TiltIcon },
  {
    name: "6 · Wings",
    blurb: "The glyph's own wing lifts out and beats — body rides, eye blinks",
    Component: WingsIcon,
  },
];

export default function BirdLabPage() {
  // playMs must outlast the LONGEST variant — 1 · Blink runs 1.6s, 5 · Tilt and
  // 6 · Wings 1.5s, so anything under 1600 truncates the second blink.
  return <VariantGrid title="Bird" variants={VARIANTS} cycleMs={3200} playMs={1900} />;
}
