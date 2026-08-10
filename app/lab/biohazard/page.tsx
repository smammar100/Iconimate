"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Biohazard, seven takes. 1-5 are original, 6 is traced off the reference
 * clip, and 7 composes 2 with 4.
 *
 * THE MARK IS ONE INDIVISIBLE PATH, and that is a measured finding rather than an
 * assumption. The `d` splits into five subpaths — the outer trefoil, three blades
 * and a centre speck — which looks like an invitation to animate the blades
 * independently. It is not:
 *
 *   · Rebuilt as five separately-filled paths, the result differs from the original
 *     by 18,388 of 64,177 ink pixels — 28.65%. The blades are COUNTERS in a
 *     compound path; filled on their own they become solid shapes instead of holes,
 *     so any per-blade animation would change the resting picture and break the
 *     fidelity rule.
 *   · Two of those subpaths (`m.12,49.92…` and `m58.57,46.81…`) begin with a
 *     RELATIVE moveto, so they are positioned by whatever precedes them. Lifting
 *     them out without resolving that silently misplaces them — after a `Z` the
 *     current point returns to the subpath's own start, which puts them at
 *     (128.12, 133.92) and (138.57, 178.81).
 *   · The centre speck is a 0.24-unit triangle. It rasterises to nothing at any
 *     real icon size — an artefact in the source path, not a feature to animate.
 *
 * So every variant here transforms the whole mark. Measured off the rendered glyph
 * at 512x512:
 *
 *   ink bbox        x16..240, y20..224 — it TOUCHES BOTH SIDE WALLS, so there is no
 *                   lateral lane and pops stay near 1.06. Anything larger overflows
 *                   the artboard the way `heart` does.
 *   bbox centre     (128, 122)
 *   ROTATION CENTRE (128, 134) — twelve units BELOW the bbox centre. Turning about
 *                   the bbox centre visibly wobbles; this is the point the mark is
 *                   actually symmetric about, found by search.
 *
 * THE THREE-FOLD SYMMETRY IS THE WHOLE OPPORTUNITY, and it is only approximate:
 *   120° -> 8.67% of pixels differ      240° -> 8.71%
 *    60° -> 100.53%                     180° -> 103.23%
 * A third-turn very nearly maps the mark onto itself; a sixth- or half-turn lands
 * on a visibly wrong pose. So a rotation may pause at 120° or 240° and still read
 * as "at rest", which `2 · Step` is built on — and must never pause anywhere else.
 * (Compare `bicycle`, whose wheels are perfect circles and therefore show no
 * rotation at all. Here the 8.67% residue is exactly what makes the turn legible.)
 */
const BIOHAZARD =
  "M185.68,104.28q-1.4-2.88-3.06-5.6a60,60,0,0,0-26.92-78,8,8,0,0,0-7.4,14.19A44,44,0,0,1,170.72,84.4a63.85,63.85,0,0,0-85.46,0A44,44,0,0,1,107.7,34.87a8,8,0,1,0-7.4-14.19,60,60,0,0,0-26.93,78,62.59,62.59,0,0,0-3.05,5.58A60.07,60.07,0,0,0,16,164a8,8,0,0,0,16,0,44.09,44.09,0,0,1,32.89-42.58A63.94,63.94,0,0,0,109,193.11a44,44,0,0,1-56.65,8,8,8,0,1,0-8.62,13.47A60,60,0,0,0,126.74,196l1.26,0,1.26,0a60,60,0,0,0,83.05,18.59,8,8,0,1,0-8.62-13.47,44,44,0,0,1-56.65-8,63.94,63.94,0,0,0,44.07-71.69A44.09,44.09,0,0,1,224,164a8,8,0,0,0,16,0A60.07,60.07,0,0,0,185.68,104.28ZM128,84a47.91,47.91,0,0,1,35.56,15.79,44,44,0,0,1-71.13,0A47.89,47.89,0,0,1,128,84Zm.12,49.92-.12.2-.12-.2h.24ZM80,132a47.6,47.6,0,0,1,1.44-11.65,44,44,0,0,1,36,58.46A48.07,48.07,0,0,1,80,132Zm58.57,46.81a44,44,0,0,1,36-58.46,48,48,0,0,1-36,58.46Z";

/** The measured symmetry centre, not the bbox centre. */
const CX = 128;
const CY = 134;

/* ══ 1. SPIN ═════════════════════════════════════════════════════════════════
   One confident turn. The dip before it is the point: a mark that simply starts
   rotating reads as a loading spinner, and a mark that winds up first reads as
   something being examined.

   ROTATION AND SCALE RUN ON SEPARATE TWEENS so the wind-up can be short while the
   turn stays long. The pop is held to 1.06 because the mark already touches x16
   and x240 — at 1.14 it would clip the artboard walls. */
const spin: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -14, 360],
    scale: [1, 0.94, 1.06, 1],
    transition: {
      rotate: { duration: 0.92, times: [0, 0.18, 1], ease: ["easeOut", [0.2, 0.8, 0.25, 1]] },
      scale: { duration: 0.92, times: [0, 0.2, 0.6, 1], ease: ["easeOut", "easeOut", "easeInOut"] },
    },
  },
};

/* ══ 2. STEP ═════════════════════════════════════════════════════════════════
   A full turn taken in THREE CLICKS, pausing at each third.

   This is the variant the geometry pays for. At 120° only 8.67% of the mark's
   pixels differ from rest, so each detent looks like a settled pose rather than a
   frozen mid-rotation — the mark appears to advance through three identical
   positions, like a mechanism indexing. Pause anywhere else (60°, 180°) and the
   pose is 100%+ different, i.e. visibly wrong, which is why the stops are exactly
   at 120 and 240.

   The holds are longer than the moves (0.14 travel, 0.19 hold) so the detents read
   as deliberate stops rather than a stutter in one continuous spin. */
const step: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 120, 120, 240, 240, 360],
    transition: {
      duration: 1.35,
      times: [0, 0.24, 0.43, 0.67, 0.86, 1],
      ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut"],
    },
  },
};

/* ══ 3. ALERT ════════════════════════════════════════════════════════════════
   A warning throb. Two beats of unequal strength with the gap between them shorter
   than the rest that follows — the same asymmetry that makes `heart` read as a
   heartbeat rather than a pulse, borrowed here because a hazard light behaves the
   same way: it is not a metronome.

   NO ROTATION AT ALL. Scale alone. The mark is a warning sign, and a warning sign
   that spins reads as decorative; one that pulses in place reads as urgent. */
const alert: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.96, 1.06, 1.0, 1.04, 1],
    transition: {
      duration: 0.9,
      times: [0, 0.1, 0.28, 0.5, 0.64, 1],
      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeInOut"],
    },
  },
};

/* ══ 4. UNSTABLE ═════════════════════════════════════════════════════════════
   Nervous. A fast irregular tremor that decays — containment failing, not a tidy
   oscillation.

   THE AMPLITUDES ARE UNEVEN ON PURPOSE: 2.4, -3.1, 1.6, -2.2, 0.9, -0.4, 0. A
   decaying sine reads as a pendulum, which is a calm object; real instability is
   arrhythmic, so each swing is deliberately not a fixed fraction of the last. The
   tremor is rotation about the true centre plus a sub-unit x-jitter, because pure
   rotation alone reads as rocking rather than shaking. */
const unstable: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 2.4, -3.1, 1.6, -2.2, 0.9, -0.4, 0],
    x: [0, -1.6, 1.9, -1.1, 1.3, -0.5, 0.2, 0],
    transition: {
      duration: 0.78,
      times: [0, 0.1, 0.24, 0.38, 0.53, 0.68, 0.84, 1],
      ease: "easeInOut",
    },
  },
};

/* ══ 5. SWEEP ════════════════════════════════════════════════════════════════
   A scanner passes over the mark: a wedge of light rotates once around the centre,
   brightening whatever it crosses, then leaves.

   THE WEDGE IS CLIPPED TO THE MARK ITSELF, so nothing paints outside the glyph and
   the artboard stays clean — the beam only ever appears as the mark lighting up in
   sectors. At rest the wedge is fully transparent, so the resting picture is the
   authored glyph untouched.

   The beam is a 70° sector, wide enough to read at 24px where a thin line would
   vanish, and it fades out over the last third rather than snapping off, so the
   scan ends by dimming rather than by the light being switched off. */
const sweepBeam: Variants = {
  normal: { rotate: -90, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-90, 270],
    opacity: [0, 0.55, 0.55, 0],
    transition: {
      duration: 1.15,
      times: [0, 0.12, 0.66, 1],
      ease: ["easeOut", "linear", "easeIn"],
    },
  },
};
const sweepBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.03, 1],
    transition: { duration: 1.15, times: [0, 0.5, 1], ease: "easeInOut" },
  },
};

/* ══ 6. SHED — from the reference clip ═══════════════════════════════════════
   The mark turns once, and three arcs peel off it and expand outward as they
   orbit, then fade. Traced off the supplied 2.24s / 25fps clip.

   HOW CLOSE "EXACTLY" CAN GET, stated plainly: the clip's icon is a STROKED
   duotone drawing whose three outer hooks are separate strokes, so they can
   detach because they were never joined. Ours is Phosphor's FILLED compound path,
   and the header note above measures why it cannot be taken apart — splitting it
   costs 28.65% of the ink. So the arcs here are drawn fresh rather than lifted off
   the glyph. The motion matches; the mechanism cannot.

   THE ARCS ARE DRAWN, NOT EXTRACTED, and sit at 120° to echo the hooks they
   appear to leave. They ride inside the rotating group, so they orbit with the
   mark exactly as they do in the clip rather than expanding straight outward.

   Scale carries the travel instead of an animated radius: scaling the group
   widens the stroke with it, which is what the clip does — the arcs get longer
   AND heavier as they go — and it is one transform instead of interpolating path
   data. They pass outside the artboard on the way out, the same trade `3 · Echo`
   makes on `heart`; nothing paints outside at rest because opacity is 0 there.

   The turn ends on 360°, not 120°. Either lands on a correct-looking pose given
   the 8.67% figure above, but a full turn is what the clip does and it reads as
   one complete event rather than a third of one. */
const ARC_ANGLES = [-90, 30, 150];
const ARC_R = 104;
const ARC_SPAN = 58; // degrees of sweep per arc

function arcPath(startDeg: number, spanDeg: number, r: number) {
  const a0 = (startDeg * Math.PI) / 180;
  const a1 = ((startDeg + spanDeg) * Math.PI) / 180;
  const x0 = CX + r * Math.cos(a0);
  const y0 = CY + r * Math.sin(a0);
  const x1 = CX + r * Math.cos(a1);
  const y1 = CY + r * Math.sin(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 0,1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

const shedBody: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -10, 360],
    scale: [1, 0.96, 1.05, 1],
    transition: {
      rotate: { duration: 1.5, times: [0, 0.12, 1], ease: ["easeOut", [0.22, 1, 0.36, 1]] },
      scale: { duration: 1.5, times: [0, 0.16, 0.5, 1], ease: ["easeOut", "easeOut", "easeInOut"] },
    },
  },
};
const shedArcs: Variants = {
  normal: { scale: 0.82, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.82, 0.92, 1.5],
    opacity: [0, 0.9, 0],
    // Out fast then thinning: a wave that decelerates reads as something inflating,
    // one that leaves quickly and fades reads as shed.
    transition: { duration: 1.5, times: [0, 0.26, 0.92], ease: ["easeOut", "easeIn"] },
  },
};

/* ══ 7. RATCHET — 2 + 4 ══════════════════════════════════════════════════════
   `2 · Step` indexes the mark a third of a turn at a time; `4 · Unstable` gives it
   an arrhythmic tremor. Composed, the tremor stops being an ambient state and
   becomes the CONSEQUENCE of each detent: the mark slams into a stop, shudders it
   off, holds, then indexes again. Step, shudder, step, shudder, settle.

   THE TWO ROTATIONS CANNOT SHARE A PROPERTY. The step and the tremor are both
   `rotate`, and a single element has one — keyframing them together would force
   the tremor to interpolate through the 120° travel and smear it. They run on
   NESTED GROUPS instead, both about the measured centre, so the tremor is applied
   in the stepped frame and rides with it.

   THE TREMOR FIRES AFTER THE LANDING, NEVER DURING TRAVEL. Its keyframes hold at
   exactly 0 through each move (0->0.18, 0.40->0.52, 0.74->0.86) and only wake in
   the ~0.16 that follows. Let it bleed into the travel and the step reads as a
   wobbly turn rather than a hard stop.

   EACH BURST IS SHORTER AND SHARPER THAN A DECAY CURVE WOULD GIVE — 2.6, -1.8,
   0.9 and out. The third burst is the largest (2.8) because it is the last thing
   the mark does, and a final stop that lands softer than the two before it reads
   as running out of energy rather than arriving. */
const ratchetStep: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 120, 120, 240, 240, 360, 360],
    transition: {
      duration: 2.375,
      times: [0, 0.18, 0.4, 0.52, 0.74, 0.86, 1],
      ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
    },
  },
};
const ratchetTremor: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, 2.6, -1.8, 0.9, 0, 0, 2.2, -1.5, 0.7, 0, 0, 2.8, -1.9, 0.8, 0],
    x: [0, 0, -1.4, 1.5, -0.6, 0, 0, -1.2, 1.3, -0.5, 0, 0, -1.5, 1.6, -0.7, 0],
    transition: {
      duration: 2.375,
      times: [
        0, 0.18, 0.22, 0.26, 0.3, 0.34, 0.52, 0.56, 0.6, 0.64, 0.68, 0.86, 0.9, 0.94, 0.97, 1,
      ],
      ease: "easeInOut",
    },
  },
};

/* ── variants ────────────────────────────────────────────────────────────── */

function makeSimple(name: string, variants: Variants) {
  const C = forwardRef<IconHandle, IconProps>(function BiohazardIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BIOHAZARD} variants={variants} style={AT(CX, CY)} />
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const SpinIcon = makeSimple("SpinIcon", spin);
const StepIcon = makeSimple("StepIcon", step);
const AlertIcon = makeSimple("AlertIcon", alert);
const UnstableIcon = makeSimple("UnstableIcon", unstable);

const SweepIcon = forwardRef<IconHandle, IconProps>(function SweepIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Own clip id per instance, or the first one on the page captures them all.
  const clipId = `bio-sweep-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <path d={BIOHAZARD} />
          </clipPath>
        </defs>
        <motion.g variants={sweepBody} style={AT(CX, CY)}>
          <path d={BIOHAZARD} />
          {/* Beam under the clip: it can only ever brighten the mark, never spill. */}
          <g clipPath={`url(#${clipId})`}>
            <motion.path
              variants={sweepBeam}
              style={AT(CX, CY)}
              fill="#fff"
              // 70° sector from the centre, radius 200 to clear the mark's corners.
              d={`M${CX},${CY} L${CX + 200},${CY} A200,200 0 0,1 ${CX + 200 * Math.cos((70 * Math.PI) / 180)},${CY + 200 * Math.sin((70 * Math.PI) / 180)} Z`}
            />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

const ShedIcon = forwardRef<IconHandle, IconProps>(function ShedIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {/* Arcs inside the rotating group so they orbit with the mark. */}
        <motion.g variants={shedBody} style={AT(CX, CY)}>
          <motion.g
            variants={shedArcs}
            style={AT(CX, CY)}
            fill="none"
            stroke="currentColor"
            strokeWidth={13}
            strokeLinecap="round"
          >
            {ARC_ANGLES.map((a) => (
              <path key={a} d={arcPath(a, ARC_SPAN, ARC_R)} />
            ))}
          </motion.g>
          <path d={BIOHAZARD} />
        </motion.g>
      </Svg>
    </div>
  );
});

const RatchetIcon = forwardRef<IconHandle, IconProps>(function RatchetIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {/* Outer group indexes; inner group shudders inside that frame. Both about
            (128,134) so neither introduces a wobble of its own. */}
        <motion.g variants={ratchetStep} style={AT(CX, CY)}>
          <motion.g variants={ratchetTremor} style={AT(CX, CY)}>
            <path d={BIOHAZARD} />
          </motion.g>
        </motion.g>
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
        <path d={BIOHAZARD} />
      </svg>
    </div>
  );
}

const VARIANTS: LabVariant[] = [
  { name: "1 · Spin", blurb: "Winds up, then one confident turn", Component: SpinIcon },
  { name: "2 · Step", blurb: "Three clicks of 120° — each lands on rest", Component: StepIcon },
  { name: "3 · Alert", blurb: "Warning throb, two uneven beats, no spin", Component: AlertIcon },
  { name: "4 · Unstable", blurb: "Arrhythmic tremor, decaying", Component: UnstableIcon },
  { name: "5 · Sweep", blurb: "Scanner wedge circles, clipped to the mark", Component: SweepIcon },
  { name: "6 · Shed", blurb: "From the clip — turns, three arcs peel off", Component: ShedIcon },
  { name: "7 · Ratchet", blurb: "2 + 4 — indexes 120°, shudders on each landing", Component: RatchetIcon },
];

export default function BiohazardLabPage() {
  // playMs must outlast the LONGEST variant or the auto-cycle truncates it — 7 ·
  // Ratchet runs 2.375s, so 1800 would have cut its final shudder off entirely.
  return <VariantGrid title="Biohazard" variants={VARIANTS} cycleMs={3800} playMs={2600} />;
}
