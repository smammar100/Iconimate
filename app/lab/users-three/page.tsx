"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Users-three icon, 5 animation candidates.
 *
 * NOTHING IS SPLIT. Phosphor's `users-three` is already six separate stroked
 * elements — three heads and three shoulder arcs, all `fill="none"
 * stroke-width="16"`. Rest parity is exact by construction (§1), and every
 * element is natively stroked, so `pathLength` is honest (§5).
 *
 * THE STRUCTURE, MEASURED. Three figures, mirror-symmetric about x128 to within
 * 0.333%:
 *   LEFT    head arc centred (64,88) r32   + shoulders (16,144)->(64,120)
 *   CENTRE  head circle     (128,144) r40  + shoulders (72,216)->(184,216)
 *   RIGHT   head arc centred (192,88) r32  + shoulders (192,120)->(240,144)
 * EACH HEAD IS TANGENT TO ITS OWN SHOULDER ARC — the head's lowest point IS the
 * shoulder endpoint, at (64,120), (128,184) and (192,120) respectively. That is
 * the same structural fact `user` has, and it is why those three points are the
 * neck pivots below: a tilt there swings the head without opening the joint.
 *
 * THIS IS THE TIGHTEST LANE IN THE SET (§4). Whole-mark ink bbox is
 * x[8, 247.5], y[48, 223.5]:
 *     left 8 · right 8.5 · top 48 · bottom 32.5
 * EIGHT units of lateral margin. Nothing may travel outward as a whole — this
 * is `bicycle`'s both-walls problem. Up is the free direction with 48 units, and
 * inward is free because the figures do not touch at rest. Every gesture below
 * therefore moves UP, INWARD, or pivots in place. None moves the group sideways.
 *
 * TWO THINGS §3 SAYS ABOUT ROTATION HERE, AND THEY DISAGREE.
 *   - The CENTRE head is a full circle: rotated 25° about its own centre it
 *     differs from itself by 0.4% — invisible, `bicycle`'s wheel trap, `user`'s
 *     head again.
 *   - The SIDE heads are OPEN arcs: the same test gives 18.55% and 18.52%.
 *     Rotation there is genuinely visible.
 *  That asymmetry is a trap, not an opportunity — see the rejected list.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - SPINNING THE SIDE HEADS about their own centres, which §3's numbers say
 *     you CAN see. Do not. Each arc's gap is not decoration: it is the segment
 *     facing the centre figure, i.e. where that person is drawn as standing
 *     behind. Rotating the arc carries the gap round to the outside, so the head
 *     reads as having a bite missing rather than as being occluded. The
 *     measurement says visible; the drawing says wrong.
 *   - ANY OUTWARD OR SIDEWAYS GROUP TRAVEL. Eight units of margin; it clips
 *     before it reaches a third of the amplitude floor.
 *   - A SHRUG, on all three, for the reason `user` documents: every head is
 *     tangent to its shoulder line, so lifting shoulders drives the arc through
 *     the face, and §1 bars hiding a line collision with opacity.
 *
 * MATERIAL (§9): people — soft and organic. ARRIVE with small overshoots, never
 * mechanical detents, never springy enough to read as rubber.
 */

/* ── Geometry — the glyph's own six elements, untouched ───────────────────── */

const HEAD_L = "M64,120A32,32,0,1,1,95,80";
const HEAD_R = "M161,80a32,32,0,1,1,31,40";
const HEAD_C = { cx: 128, cy: 144, r: 40 };
const SH_L = "M16,144a59.91,59.91,0,0,1,48-24";
const SH_R = "M192,120a59.91,59.91,0,0,1,48,24";
const SH_C = "M72,216a65,65,0,0,1,112,0";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Neck pivots — each is the exact point where that head meets its shoulders. */
const NECK_L = AT(64, 120);
const NECK_C = AT(128, 184);
const NECK_R = AT(192, 120);

const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/**
 * TILT ANGLES ARE NOT EQUAL, AND THAT IS THE POINT. The side heads pivot 64
 * units from their necks, the centre head 80. Giving all three the same ANGLE
 * would make the centre nod visibly harder than its neighbours and the wave
 * would read as lopsided. These angles are chosen so the CROWN TRAVEL matches
 * instead: 64 × 17° = 19.0 units, 80 × 14° = 19.5 units. Both clear the 18-unit
 * floor (§2); at 16°/13° the sides drop to 17.9 and fall under it.
 */
const TILT_SIDE = 17;
const TILT_CENTRE = 14;

/* ── 1 · WAVE ────────────────────────────────────────────────────────────────
   Verb: SWAYS. Each head tips one way, swings through to the other, and
   centres — and the whole motion travels along the row, left to centre to
   right. A stadium wave rather than a single nod.

   THE TWO-SIDED SWING CHANGES WHAT THIS MEANS, WORTH SAYING OUT LOUD. A single
   tilt reads as acknowledgement — one person agreeing. Tipping both ways is not
   a stronger version of that; it is a different gesture, reading as swaying,
   considering, or a crowd moving together. It cannot read as a head SHAKE, the
   obvious worry, because a shake is rotation about the vertical axis and these
   heads are circles seen flat — §3 again. The name fits the two-sided version
   better than it fitted the one-sided one: a wave is a thing that passes
   through a crowd, which is exactly what this now is.

   THE STAGGER IS THE WHOLE IDEA (§11). `staged(i)` at the 0.09 default puts the
   spread inside 180ms, well under the 500ms budget past which the last element
   reads as a straggler rather than part of a cascade. Fire all three together
   and there is no group here at all, just one three-headed object swaying.

   BOTH FLANKS NOW REACH THEIR OUTWARD EXTREME, so the wall clearance had to
   hold in both directions, not one. Measured: the left head's outward extreme
   puts its ink at x14.5 and the right head's at x241, against walls at 0 and
   256 — about 15 units spare on each side. The eight-unit lateral margin
   belongs to the SHOULDERS, which never move in this variant, which is the only
   reason a two-sided head swing fits in a glyph this tight.

   easeInOut, not ARRIVE: the head is travelling THROUGH centre to the far side
   rather than settling into a position, and §8 gives a symmetric curve to
   motion that crosses the frame and an ARRIVE tail only to motion that lands.
   The holds are unequal (0.14 then 0.12) because §10 wants decaying repeats and
   two identical pauses read as a metronome. */
const waveHead = (i: number, tilt: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, tilt, tilt, -tilt, -tilt, 0],
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: [0, 0.18, 0.32, 0.58, 0.7, 1],
      delay: staged(i),
    },
  },
});
const waveL = waveHead(0, TILT_SIDE);
const waveC = waveHead(1, TILT_CENTRE);
const waveR = waveHead(2, TILT_SIDE);

const UsersWaveIcon = forwardRef<IconHandle, IconProps>(function UsersWaveIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={HEAD_L} {...STROKE} variants={reduced ? undefined : waveL} style={NECK_L} />
        <path d={SH_L} {...STROKE} />
        <motion.circle
          cx={HEAD_C.cx}
          cy={HEAD_C.cy}
          r={HEAD_C.r}
          {...STROKE}
          variants={reduced ? undefined : waveC}
          style={NECK_C}
        />
        <path d={SH_C} {...STROKE} />
        <motion.path d={HEAD_R} {...STROKE} variants={reduced ? undefined : waveR} style={NECK_R} />
        <path d={SH_R} {...STROKE} />
      </Svg>
    </div>
  );
});

/* ── 2 · HUDDLE ──────────────────────────────────────────────────────────────
   Verb: GATHERS. The two flanking figures lean in toward the centre, hold, and
   drift back out.

   INWARD IS THE ONLY LATERAL DIRECTION THIS GLYPH HAS, and it happens to be the
   one the verb wants — the constraint and the meaning agree, which is luck
   worth naming rather than skill. Eighteen units in, exactly the amplitude
   floor, because there is nothing to spare.

   THE FIGURES DO NOT TOUCH AT REST — measured, 0 px of shared ink between the
   left figure and the centre one. At full lean they graze by 156 px, roughly a
   five-unit sliver of one stroke. That contact IS the gesture: a huddle that
   never closes the gap is just two things sliding. It is small enough not to
   read as mush and was checked rather than hoped for.

   Head and shoulders of each flank move as ONE group, preserving the tangency
   at the neck exactly (see the header), so no joint opens while they travel. */
const huddleFlank = (dir: number, i: number): Variants => ({
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 18 * dir, 18 * dir, 0],
    transition: { duration: 0.95, ease: ARRIVE, times: [0, 0.32, 0.6, 1], delay: staged(i, 0.05) },
  },
});
const huddleL = huddleFlank(1, 0);
const huddleR = huddleFlank(-1, 1);

const UsersHuddleIcon = forwardRef<IconHandle, IconProps>(function UsersHuddleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : huddleL}>
          <path d={HEAD_L} {...STROKE} />
          <path d={SH_L} {...STROKE} />
        </motion.g>
        <circle cx={HEAD_C.cx} cy={HEAD_C.cy} r={HEAD_C.r} {...STROKE} />
        <path d={SH_C} {...STROKE} />
        <motion.g variants={reduced ? undefined : huddleR}>
          <path d={HEAD_R} {...STROKE} />
          <path d={SH_R} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 3 · ASSEMBLE ────────────────────────────────────────────────────────────
   Verb: ASSEMBLES. The centre figure draws itself, and the other two draw in
   after it — a group coming together one member at a time.

   Honest here because all six elements are natively stroked, so `pathLength`
   runs along a real stroke instead of being faked with clips (§5).

   CENTRE FIRST, FLANKS AFTER, AND THE ORDER CARRIES THE MEANING. Drawing left
   to right makes it a queue; drawing from the middle out makes it a group
   forming around someone. The flanks are staggered against each other by 0.09
   so they do not arrive as a matched pair.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Every element is
   round-capped, so `pathLength: 0` parks a full 16-wide DOT at six start points
   at once — the worst instance of this trap in the set, six blobs on the
   artboard through the hold. Long strokes, so each opacity gets its own fast
   tween over the first 0.05 of its own draw.

   NOTE — §1 TENSION, FLAGGED. This opens on `pathLength: 0`, so frame 0 is not
   the icon. §1 forbids it; §15B ships it (blueprint, arrow-bend-*) where the
   subject genuinely is an act of drawing. A team assembling arguably is; a
   members-count in a sidebar is not. Judge at 24px before promoting. */
const ASM = 1.9;
const assemble = (i: number): Variants => ({
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: ASM, times: [0, 0.55], ease: "easeInOut", delay: staged(i, 0.16) },
      opacity: { duration: ASM, times: [0, 0.05], ease: "linear", delay: staged(i, 0.16) },
    },
  },
});
const asmC = assemble(0);
const asmL = assemble(1);
const asmR = assemble(2);

const UsersAssembleIcon = forwardRef<IconHandle, IconProps>(function UsersAssembleIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={HEAD_C.cx}
          cy={HEAD_C.cy}
          r={HEAD_C.r}
          {...STROKE}
          variants={reduced ? undefined : asmC}
        />
        <motion.path d={SH_C} {...STROKE} variants={reduced ? undefined : asmC} />
        <motion.path d={HEAD_L} {...STROKE} variants={reduced ? undefined : asmL} />
        <motion.path d={SH_L} {...STROKE} variants={reduced ? undefined : asmL} />
        <motion.path d={HEAD_R} {...STROKE} variants={reduced ? undefined : asmR} />
        <motion.path d={SH_R} {...STROKE} variants={reduced ? undefined : asmR} />
      </Svg>
    </div>
  );
});

/* ── 4 · RISE ────────────────────────────────────────────────────────────────
   Verb: STANDS. Each figure lifts and settles in turn, left to right — a row
   standing up one after another.

   UP IS THE ONLY GENEROUS DIRECTION THIS GLYPH HAS: 48 units of top margin
   against 8 at the sides. A 20-unit lift takes the crown to y28, still 28 units
   clear of the wall, and the settle dips 3 below rest with 32.5 units of floor
   under it. This is the gesture the lane actually affords, which is why it is
   here and why nothing on this page travels sideways as a group.

   Each figure moves as ONE group — head and shoulders together — so the neck
   tangency is preserved at every frame (the header explains why that matters).
   The 3-unit dip past rest is the follow-through the parts cannot have between
   them (§10), and a person is soft enough to earn it where a mechanism gets
   none (§9). */
const rise = (i: number): Variants => ({
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -20, 3, 0],
    transition: { duration: 0.7, ease: ARRIVE, times: [0, 0.4, 0.72, 1], delay: staged(i) },
  },
});
const riseL = rise(0);
const riseC = rise(1);
const riseR = rise(2);

const UsersRiseIcon = forwardRef<IconHandle, IconProps>(function UsersRiseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : riseL}>
          <path d={HEAD_L} {...STROKE} />
          <path d={SH_L} {...STROKE} />
        </motion.g>
        <motion.g variants={reduced ? undefined : riseC}>
          <circle cx={HEAD_C.cx} cy={HEAD_C.cy} r={HEAD_C.r} {...STROKE} />
          <path d={SH_C} {...STROKE} />
        </motion.g>
        <motion.g variants={reduced ? undefined : riseR}>
          <path d={HEAD_R} {...STROKE} />
          <path d={SH_R} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 5 · RALLY ───────────────────────────────────────────────────────────────
   The showcase, composing 4 into 1: the row stands up in turn, and once
   everyone is up the nod ripples back along it.

   THIS IS A §11 HANDOFF, NOT AN OVERLAP, AND THE GAP IS DELIBERATE. The last
   figure settles at 0.40 and the first nod does not begin until 0.46. Standing
   does not cause nodding — you stand, and then you agree. Start the ripple
   while the row is still rising and the two cascades interleave into noise,
   which is the failure §11 exists to prevent.

   THE NOD IS SHALLOWER THAN 1's (11°/9° against 17°/14°) because it rides a
   gesture that has already spent the viewer's attention. Crown travel drops to
   ~12 units, deliberately UNDER the §2 floor — legitimate under the section's
   one exception: a secondary accent riding a primary that already clears the
   floor may go below it, because it reads as texture on motion that is already
   legible. The 20-unit rise is the primary and carries the amplitude. */
const RALLY = 1.9;
const rallyBody = (i: number): Variants => ({
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -20, 3, 0, 0],
    transition: {
      duration: RALLY,
      ease: ARRIVE,
      times: [0, 0.15, 0.27, 0.37, 1],
      delay: staged(i, 0.06),
    },
  },
});
const rallyHead = (i: number, tilt: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, tilt, 3, 0],
    transition: {
      duration: RALLY,
      ease: ARRIVE,
      times: [0, 0.46, 0.62, 0.78, 1],
      delay: staged(i, 0.06),
    },
  },
});

const UsersRallyIcon = forwardRef<IconHandle, IconProps>(function UsersRallyIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const R = reduced;
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={R ? undefined : rallyBody(0)}>
          <motion.path
            d={HEAD_L}
            {...STROKE}
            variants={R ? undefined : rallyHead(0, 11)}
            style={NECK_L}
          />
          <path d={SH_L} {...STROKE} />
        </motion.g>
        <motion.g variants={R ? undefined : rallyBody(1)}>
          <motion.circle
            cx={HEAD_C.cx}
            cy={HEAD_C.cy}
            r={HEAD_C.r}
            {...STROKE}
            variants={R ? undefined : rallyHead(1, 9)}
            style={NECK_C}
          />
          <path d={SH_C} {...STROKE} />
        </motion.g>
        <motion.g variants={R ? undefined : rallyBody(2)}>
          <motion.path
            d={HEAD_R}
            {...STROKE}
            variants={R ? undefined : rallyHead(2, 11)}
            style={NECK_R}
          />
          <path d={SH_R} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

export default function UsersThreeLab() {
  return (
    <VariantGrid
      title="Users-three"
      cycleMs={4600}
      playMs={3000}
      variants={[
        {
          name: "1 · Wave",
          blurb: "Each head swings both ways, and it travels along the row.",
          Component: UsersWaveIcon,
        },
        {
          name: "2 · Huddle",
          blurb: "The flanks lean in to the centre, hold, and drift back.",
          Component: UsersHuddleIcon,
        },
        {
          name: "3 · Assemble",
          blurb: "The centre draws first, then the other two join it.",
          Component: UsersAssembleIcon,
        },
        {
          name: "4 · Rise",
          blurb: "Each figure stands and settles in turn, left to right.",
          Component: UsersRiseIcon,
        },
        {
          name: "5 · Rally",
          blurb: "The row stands up, then the nod ripples back. The showcase.",
          Component: UsersRallyIcon,
        },
      ]}
    />
  );
}
