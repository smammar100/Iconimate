"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Gear, five takes, each built on what the one before it got wrong.
 *
 * VERB: the gear TURNS UNDER LOAD. Not "spins" — a gear that free-spins is a
 * fidget toy; a gear that indexes, seats and stops is a mechanism. Every
 * candidate here is a different honesty about that one verb.
 *
 * MATERIAL: mechanical / geared (MOTION.md §9). So: `linear` or detented steps,
 * ZERO overshoot past the target, 1.0x base duration. A gear that springs past
 * its detent reads as stripped, not as playful.
 *
 * ── MEASURED, not assumed (rasterised at 512x512, counting only pixels that
 *    flip ink/no-ink so antialiasing cannot inflate the figure) ──────────────
 *
 *   ink bbox        x23.5..232, y23.5..232.5. Centre (127.75, 128) — the
 *                   artboard centre to within a quarter unit, so every rotation
 *                   here pivots on (128,128) and none of them wobble.
 *   LANE            ~23.5 units clear on all four sides. Unlike `bicycle` or
 *                   `biohazard`, this mark does NOT touch a wall, so it has room
 *                   for a mate to enter (5 · Drive) without any body scaling.
 *
 *   EIGHT TEETH — the whole opportunity. Rotate the mark and diff against rest:
 *
 *        45deg -> 0.46%        90deg -> 0.59%       180deg -> 0.73%
 *        22.5deg -> 93.94%     30deg -> 84.27%      15deg -> 84.25%
 *
 *   Sweeping the rendered mark for its outermost ink at every angle puts the
 *   TOOTH CENTRES at 22.5deg + k*45, tip radius 108.25, valley floor 87.75 —
 *   so the VALLEYS fall on multiples of 45. 5 · Drive is built on those numbers.
 *
 *   A 45deg turn maps the gear onto itself almost exactly, so ANY multiple of 45
 *   is a settled pose that reads as "at rest". A HALF-tooth is 93.94% different —
 *   a plainly broken picture. So detents land on multiples of 45 and NEVER
 *   anywhere else. Same trade `biohazard` makes at 120deg, but 8-fold instead of
 *   3-fold gives five times the vocabulary.
 *
 * ── REJECTED, with the measurement that killed it ──────────────────────────
 *
 *   · ANIMATING THE HUB RING SEPARATELY (counter-rotating it against the rim —
 *     the obvious "two moving parts" idea). The ring is a perfect circle:
 *     rotated 45deg it differs from itself by **0.00%**. Invisible at any angle
 *     and any speed — §3, exactly the trap `bicycle`'s wheels fell into. Do not
 *     re-try. The ring rides inside the rotating group because that is
 *     geometrically true, not because it contributes motion.
 *   · PAUSING AT 22.5deg to sit "between teeth". 93.94% off rest. It does not
 *     read as a gear mid-travel, it reads as a rendering fault.
 *   · OVERSHOOTING the landing with OVERSHOOT_BACK. Correct for `heart`, wrong
 *     here: §9 puts mechanical overshoot at 0%. What 3 and 5 use instead is a
 *     RECOIL — a small bounce BACKWARDS off a hard stop, which is what a real
 *     geartrain does when the shaft's wind-up releases. It never passes the
 *     detent, so it never lands on a wrong pose.
 *   · LIFTING ONE TOOTH OUT to animate it alone. The cog is a single stroked
 *     `d` whose eight outer arcs are relative (`a99.43,...`), positioned by the
 *     running current point; and a lifted tooth would need end caps the source
 *     mark does not have. The teeth move as a body, or not at all.
 *
 * ── INTERRUPTION: why every `normal` carries a non-zero rotation ────────────
 *
 * Because 45deg-multiples ARE rest, each variant parks `normal` on its own FINAL
 * angle instead of 0. Two things fall out, both better than the usual
 * arrangement:
 *
 *   · Hover-out after the gesture completes is a no-op. Park `normal` at 0 and
 *     RETURN_TRANSITION plays the whole turn BACKWARDS on mouse-out — a gear
 *     visibly un-turning, the single worst thing this icon could do.
 *   · Hover-out MID-gesture completes the turn forward to the next detent rather
 *     than reversing it. Machines finish their stroke. This is the correct
 *     mechanical read and it comes free.
 *
 * The one cost, stated plainly: an interrupt in the first ~15% of a pass has to
 * travel nearly the whole way to reach the final angle, so a very fast in-and-out
 * flick shows a quick forward turn instead of nothing. That is still a forward
 * turn landing on a detent — a valid pose either way (§13).
 *
 * ── THE STANDING TEST — the failure I was most worried about ────────────────
 *
 * **5 · Drive puts a SECOND OBJECT inside a 24px button.** That is the one thing
 * here that could fail "in someone else's product". Resolved by clipping the mate
 * to the artboard, so it never reads as a whole second gear crowding the box —
 * only as the three teeth nearest the corner entering and leaving. At rest its
 * opacity is 0, so the resting picture is the authored glyph untouched, and
 * nothing paints outside the box on any frame. It is still the one candidate that
 * must be reviewed at 20px before promotion; 1 and 3 are the safe picks.
 *
 * Second worry: **the fiftieth hover**. 4 · Spin-down runs 1.4s and 5 · Drive
 * 1.8s — both Expressive tier (§8), right for a gallery piece and long for a
 * settings button fired forty times a day. 1 (0.5s) and 3 (0.95s) are the
 * candidates that survive that room.
 *
 * Amplitude (§2): tips sit at r=108.25, so 1 unit of arc = 0.529deg and the 18-unit
 * floor is cleared by any rotation over 9.6deg — every primary here is 45deg or
 * more (>=84 units). The sub-degree seat and recoil in 3 and 5 are far under the
 * floor deliberately: §2's exception for secondary detail riding a primary that
 * clears the floor twenty-fold. Alone they would be invisible; on the front and
 * back of a stroke this size they are what makes it feel loaded.
 */

/** Phosphor `gear` — a stroked mark (fill none), not a filled compound path, so
 *  every candidate transforms it as a body rather than faking a draw (§5). */
const COG =
  "M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z";

const CX = 128;
const CY = 128;

/** The mark's own pen. Anything added here inherits it (§12). */
const STROKE = 16;

/** Cog + hub, one definition, used by every variant AND the static fallback so
 *  rest cannot drift between four hand-copied versions of the same geometry. */
function Body() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={CX} cy={CY} r={40} />
      <path d={COG} />
    </g>
  );
}

/* == 1. TURN ================================================================
   The baseline, and deliberately the plainest thing that is still correct: two
   teeth of travel, decelerating into the detent, and nothing else.

   90deg NOT 45deg. One tooth clears the amplitude floor comfortably (84 units)
   but at 24px a single tooth of a mark this busy reads as a twitch — you register
   that something changed without registering what. Two teeth is the smallest
   amount that reads as rotation.

   ARRIVE, not linear: this turn STOPS, and §8 puts linear on constant-rate
   rotation only. No overshoot — §9, mechanical. */
const turn: Variants = {
  normal: { rotate: 90, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 90], transition: { duration: 0.5, ease: ARRIVE } },
};

/* == 2. INDEX ===============================================================
   Better than 1 because it stops SAYING "eight teeth" and starts USING them.

   Three clicks of 45deg with a hold on each. This is the variant the 0.46%
   measurement pays for: every stop is a pose indistinguishable from rest, so the
   gear appears to advance through three identical positions the way a mechanism
   indexes — rather than being caught mid-rotation twice on the way somewhere.

   THE HOLDS ARE LONGER THAN THE MOVES (0.18 travel against 0.23 dwell). Reverse
   that ratio and the detents read as a stutter in one continuous spin instead of
   three deliberate stops. `linear` across each dwell, `easeInOut` across each
   move — the moves start and stop, the dwells do not move at all. */
const index: Variants = {
  normal: { rotate: 135, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 45, 45, 90, 90, 135],
    transition: {
      duration: 1.0,
      times: [0, 0.18, 0.41, 0.59, 0.82, 1],
      ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut"],
    },
  },
};

/* == 3. BACKLASH ============================================================
   Better than 2 because 2 is a mechanism with no LOAD on it. Real gear teeth do
   not touch on both flanks — there is slack between them, and a driven gear
   spends the first moment of every stroke taking that slack up before any torque
   arrives. Four phases, and the two small ones are the whole point:

     0.00-0.14  DEAD BAND. Torque is applied and the gear does not move. Stillness
                as a keyframe — easy to leave out, impossible to fake afterwards.
     0.14-0.24  SEAT. -2.5deg. The tooth flank settles back onto its driving face.
                Backwards, against the direction of travel — which is what makes
                it read as slack being taken up rather than as a wind-up.
     0.24-0.66  DRIVE. 90deg under SWEEP, the token for crossing the artboard.
     0.66-1.00  RECOIL. Hard stop, then 1.6deg back and settle. NOT an overshoot:
                it never passes 90deg, so it never lands on a wrong pose. It is
                the shaft's elastic wind-up releasing against a stop that has
                already arrived. */
const backlash: Variants = {
  normal: { rotate: 90, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -2.5, 90, 88.4, 90],
    transition: {
      duration: 0.95,
      times: [0, 0.14, 0.24, 0.66, 0.78, 1],
      ease: ["linear", "easeOut", SWEEP, "easeOut", "easeInOut"],
    },
  },
};

/* == 4. SPIN-DOWN ===========================================================
   Better than 3 because 3 is one stroke and this is a whole event: the gear is
   driven hard, released, and coasts to a stop on its own inertia.

   THE DECAY LIVES IN THE KEYFRAME SPACING, NOT IN AN EASE. Equal time steps with
   shrinking angular steps — 108, 90, 72, 45, 27, 14 degrees — is what momentum
   bleeding off actually looks like. An ease-out curve over a single 360 gives the
   same start and end and a visibly different middle: smooth where a coasting mass
   is lumpy. `linear` between the keys, because between two keys the rate IS
   constant (§8: linear is for rotation and progress, and this is both).

   THE LAST 7deg IS THE WHOLE IDEA. The coast dies at 353 — seven degrees short of
   a tooth — pauses there for 0.14 of the pass, then CLICKS the rest of the way
   in. A mechanism running out of energy does not glide to a halt on its detent;
   it stalls just off it and gets pulled the last few degrees by the detent
   itself. Remove that pause and the whole thing collapses back into an ease-out.

   A full 360 also means the coast passes eight settled poses on the way, which is
   why a decelerating gear reads as slowing rather than as struggling. */
const spinDown: Variants = {
  normal: { rotate: 360, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 108, 198, 270, 315, 342, 353, 353, 360],
    transition: {
      duration: 1.4,
      times: [0, 0.1, 0.2, 0.31, 0.43, 0.56, 0.72, 0.86, 1],
      ease: ["linear", "linear", "linear", "linear", "linear", "easeOut", "linear", ARRIVE],
    },
  },
};

/* == 5. DRIVE ===============================================================
   Better than all four because they all beg the same question — driven by WHAT?
   1 through 4 are a gear turning itself. A gear's verb is not "rotate", it is
   "transmit"; it is the one object in the set defined by another object touching
   it. So the mate arrives, meshes, indexes it two teeth with the load of 3 on
   every landing, and leaves.

   THE MESH GEOMETRY IS REAL, not eyeballed — and the first attempt at it was
   wrong in a way only measurement caught. The mate is THE SAME PATH at the same
   scale, so the tooth pitch matches by construction and the ratio is exactly 1:1
   — the mate's rotation is the main gear's, negated, key for key.

   THE LINE OF CENTRES MUST POINT AT A VALLEY. Sweeping the rendered mark for its
   outermost ink at every angle gives the teeth at **22.5deg + k*45**, tip radius
   **108.25**, valley floor **87.75**. So the valleys — the only place a mate's
   tooth can go — sit on MULTIPLES OF 45. The first build put the mate at 30deg,
   which is neither, and the teeth drove straight into each other: a 14-unit
   interpenetration, plainly visible the moment the pose was rendered at size.
   Corrected to 45deg, which is a valley, with the mate phase-offset 22.5deg so a
   tooth of ITS OWN points back down the line of centres. (The exact half-tooth
   that is a WRONG pose for the main gear is the RIGHT one for its mate — that is
   what interleaving means.)

   CENTRE DISTANCE 202 = 108.25 tip + 87.75 floor + 6 units of clearance, so the
   teeth nest without ever sharing an edge (§15-A: touching shapes grow a pale
   antialiased thread; keeping a gap is cheaper than fighting one). Verified by
   rendering the meshed pose at rest, mid-travel and on the detent rather than by
   trusting the arithmetic.

   CLIPPED TO THE ARTBOARD. The mate's centre sits well outside the 256 box, so
   unclipped it would paint a whole second gear over whatever the icon sits next
   to. Clipped, only the teeth nearest the corner are ever visible: it reads as
   something entering the frame and meshing, without ever claiming the space.

   IT ARRIVES BEFORE IT DRIVES (§11). Contact lands at 0.20 and the main gear does
   not move until 0.26 — a 6% beat of stillness so the mesh reads as CAUSING the
   turn. Overlap them and the gear is already moving when the mate reaches it,
   which reads as coincidence rather than transmission.

   §15's test, applied literally: delete the mate and the gear still indexes two
   teeth with backlash — it still expresses its verb. So the mate is a subordinate
   accent that earned its place, not an effect standing in for a missing idea. */
/** 45deg is a VALLEY of the main gear (teeth sit at 22.5 + k*45). Not 30. */
const MATE_ANGLE = (45 * Math.PI) / 180;
/** 108.25 tip + 87.75 valley floor + 6 clearance. */
const MATE_DIST = 202;
const MATE_CX = CX + MATE_DIST * Math.cos(MATE_ANGLE);
const MATE_CY = CY + MATE_DIST * Math.sin(MATE_ANGLE);
/** Withdrawn along the line of centres — it backs off the way it came in. */
const MATE_OUT_X = 52 * Math.cos(MATE_ANGLE);
const MATE_OUT_Y = 52 * Math.sin(MATE_ANGLE);

const DRIVE_DUR = 1.8;
const DRIVE_TIMES = [0, 0.2, 0.26, 0.34, 0.5, 0.58, 0.64, 0.75, 0.8, 1];
const DRIVE_EASE = [
  "linear",
  "easeOut",
  SWEEP,
  "easeOut",
  "easeInOut",
  "linear",
  SWEEP,
  "easeOut",
  "easeInOut",
] as const;

/** Main gear: dead band, seat, 45, recoil, dwell, 45, recoil. */
const driveMain: Variants = {
  normal: { rotate: 90, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -2, 45, 43.6, 45, 45, 90, 88.6, 90],
    transition: { duration: DRIVE_DUR, times: DRIVE_TIMES, ease: [...DRIVE_EASE] },
  },
};

/** The mate, negated key for key — a 1:1 pair cannot do anything else. */
const driveMateSpin: Variants = {
  normal: { rotate: -90, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, 2, -45, -43.6, -45, -45, -90, -88.6, -90],
    transition: { duration: DRIVE_DUR, times: DRIVE_TIMES, ease: [...DRIVE_EASE] },
  },
};

/** Approach and withdrawal along the line of centres, plus the fade that keeps
 *  rest clean. Opacity only ever softens something already travelling (§1). */
const driveMateSlide: Variants = {
  normal: { x: MATE_OUT_X, y: MATE_OUT_Y, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [MATE_OUT_X, 0, 0, MATE_OUT_X],
    y: [MATE_OUT_Y, 0, 0, MATE_OUT_Y],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: DRIVE_DUR,
      times: [0, 0.2, 0.8, 1],
      ease: [ARRIVE, "linear", "easeIn"],
    },
  },
};

/* -- assembly ------------------------------------------------------------- */

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
        fill="none"
      >
        <Body />
      </svg>
    </div>
  );
}

/** 1-4 are whole-mark rotations about the measured centre, so they share a shell. */
function makeSimple(name: string, variants: Variants) {
  const C = forwardRef<IconHandle, IconProps>(function GearIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={variants} style={AT(CX, CY)}>
            <Body />
          </motion.g>
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const TurnIcon = makeSimple("TurnIcon", turn);
const IndexIcon = makeSimple("IndexIcon", index);
const BacklashIcon = makeSimple("BacklashIcon", backlash);
const SpinDownIcon = makeSimple("SpinDownIcon", spinDown);

const DriveIcon = forwardRef<IconHandle, IconProps>(function DriveIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Own clip id per instance, or the first tile on the page captures them all.
  const clipId = `gear-mate-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="256" height="256" />
          </clipPath>
        </defs>
        {/* Mate first, so the main gear's teeth draw over it at the mesh. */}
        <g clipPath={`url(#${clipId})`}>
          <motion.g variants={driveMateSlide}>
            <motion.g variants={driveMateSpin} style={AT(MATE_CX, MATE_CY)}>
              <g
                transform={`translate(${(MATE_CX - CX).toFixed(2)} ${(MATE_CY - CY).toFixed(2)}) rotate(22.5 ${MATE_CX.toFixed(2)} ${MATE_CY.toFixed(2)})`}
              >
                <Body />
              </g>
            </motion.g>
          </motion.g>
        </g>
        <motion.g variants={driveMain} style={AT(CX, CY)}>
          <Body />
        </motion.g>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  { name: "1 · Turn", blurb: "Two teeth, decelerating into the detent", Component: TurnIcon },
  { name: "2 · Index", blurb: "Three 45° clicks — every stop lands on rest", Component: IndexIcon },
  {
    name: "3 · Backlash",
    blurb: "Slack, seat, drive, recoil off a hard stop",
    Component: BacklashIcon,
  },
  {
    name: "4 · Spin-down",
    blurb: "Coasts, stalls 7° short, detent pulls it in",
    Component: SpinDownIcon,
  },
  { name: "5 · Drive", blurb: "A 1:1 mate meshes and indexes it two teeth", Component: DriveIcon },
];

export default function GearLabPage() {
  // playMs must outlast the LONGEST variant or the auto-cycle truncates it —
  // 5 · Drive runs 1.8s, so anything under 2000 cuts the mate's withdrawal off.
  return <VariantGrid title="Gear" variants={VARIANTS} cycleMs={4000} playMs={2200} />;
}
