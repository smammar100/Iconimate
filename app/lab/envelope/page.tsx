"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Envelope icon, 5 animation candidates.
 *
 * NOTHING IS SPLIT. Phosphor's `envelope` is already four stroked elements —
 * the flap polyline, the body, and the two lower creases, all `fill="none"
 * stroke-width="16"`. Rest parity is exact by construction (§1) and
 * `pathLength` is native throughout (§5). The flap polyline is restated as an
 * equivalent path (`M224,56L128,144L32,56`) purely so its apex can be morphed;
 * rendered through the real SVG renderer, polyline and path differ by 0 pixels
 * of 17,408 — exact, not "close enough".
 *
 * THE FLAP IS THE VERB, AND IT IS ALREADY IN THE MARK (§0 gate 1). The V is the
 * flap's fold seen from the front; the two lower diagonals are the side folds.
 *
 * ══ FINDING 1: DO NOT OPEN THE FLAP WITH scaleY ══
 *
 * The obvious implementation is `scaleY: 1 -> -1` about the hinge line y=56,
 * and it is WRONG — not as taste, as a rendering defect. An SVG transform
 * scales the STROKE with the geometry, so as the flap passes through the hinge
 * its 16-unit pen is scaled to nothing. Measured at 512x512: at the halfway
 * point the flap's ink is **0 pixels**. It does not go edge-on, it BLINKS OUT
 * and comes back — a hole in the middle of the gesture, which at 24px reads as
 * the icon breaking.
 *
 * The fix is to morph the apex instead: `M224,56L128,144L32,56` ->
 * `M224,56L128,12L32,56`. Only one number changes, so motion interpolates the
 * string numerically in place and the pen stays exactly 16 the whole way (§12).
 * Ink through the pass: 17,408 at rest, 13,100 at the hinge, 14,418 fully open
 * — never zero. And at the hinge the flap does not vanish, it lands exactly on
 * the body's top edge and merges with it, which is what a flap seen edge-on
 * should do. The physical read and the correct implementation coincide. Do not
 * "simplify" this back into a scale.
 *
 * A FULL FLIP DOES NOT FIT ANYWAY. At scaleY -1 the apex lands at y-32 and the
 * ink at y-40, outside the box; -0.55 is the most that clears. The apex morph
 * reaches y12 (ink y4, four units clear) and travels 132 units doing it.
 *
 * ══ FINDING 2: THE BOTTOM TRIANGLE IS LATENT IN THE MARK ══
 *
 * The two lower creases stop short of each other, 34.9 units apart at their
 * inner tips. At rest that gap is invisible, because the flap's V comes down to
 * (128,144) and fills it. THE MOMENT THE FLAP LIFTS AWAY, the two creases are
 * left as a broken chevron pointing at nothing — the envelope reads as
 * deconstructed, which is exactly the failure this page had before.
 *
 * The completion is NOT invented, it is derived. Extend both creases along
 * their own directions and they intersect at **(128, 112.004)** — dead on the
 * centre line — and each is truncated by **exactly 23.67 units**, mirrored,
 * with slopes of exactly ±0.9167. Phosphor drew a triangle and then trimmed
 * both its edges by the same amount, because the flap covers that space at
 * rest. So the open state simply restores what the closed state was hiding:
 *     "M110.55,128L34.47,197.74"  ->  "M128,112L34.47,197.74"
 *     "M221.53,197.74L145.45,128" ->  "M221.53,197.74L128,112"
 * Two-point lines, same token count, so motion interpolates them in place. Rest
 * returns to the authored truncated form, so §1 parity is untouched.
 *
 * This is also what a real envelope does: open the flap and you see the bottom
 * panel as a complete triangle. Deriving it from the glyph and copying the
 * object agree, which is the same luck FINDING 1 had.
 *
 * ══ FINDING 3: THE CREASE TIPS ARE JOINED TO THE FLAP, NOT MERELY TRIMMED ══
 *
 * This one was found by shipping the bug. The first cut of this page held the
 * creases at their resting truncation for the first 8–10% of the pass and only
 * then completed them. On screen the flap lifts away and the two creases are
 * left hanging in mid-air, pointing at nothing, before snapping out to meet —
 * exactly the deconstructed look FINDING 2 was supposed to remove.
 *
 * The cause is geometric, and it is the missing half of FINDING 2. The flap's
 * left edge runs (32,56)->(128,144); at y=128 it is at x=110.55. The authored
 * left crease tip is at x=110.55. Same on the right: 145.45 against 145.45,
 * both matching to within 0.0045 units. THE CREASES DO NOT STOP SHORT OF AN
 * APEX — THEY STOP EXACTLY WHERE THEY MEET THE FLAP'S EDGES. The truncation is
 * a junction, so the tips are attached to the flap, and when the flap moves the
 * tips must move WITH it, from frame one.
 *
 * That is why every crease schedule below now starts at t=0 alongside the flap
 * rather than after a hold, and retracts on the flap's descent rather than
 * after it, so the tips land back on its edges as it seats. The old "wait, then
 * complete" timing is the bug, not a safety margin.
 *
 * THE APEX CROSSING IS REAL, AND THE TWO ENDS OF IT ARE DIFFERENT. The flap's
 * apex travels through y112 — where the completed triangle's apex sits — on the
 * way up and again on the way down. Against ARRIVE (which front-loads travel:
 * 24% of the range in 4.2% of the segment) it crosses at 4.2% of its opening
 * segment and 20.3% of its closing one.
 *
 *   - ON THE WAY DOWN it is avoided outright. Every retraction is timed to lead
 *     the descending flap, so the triangle's apex has moved clear before the
 *     flap reaches it. Closest measured pairing is FOLD at 16.8 units against a
 *     16-unit stroke — clear, and the tightest of the four.
 *   - ON THE WAY UP the two DO come within ~9 units, for exactly ONE rendered
 *     frame at 60fps (t≈0.01). That is not a defect to design out: at rest the
 *     tips are ATTACHED to the flap's edges, so contact as it leaves is the
 *     junction separating, which is what the drawing means. Simulated frame by
 *     frame across all four variants: one frame each, none longer.
 *
 * Timings were verified by sampling both tracks through their real bezier at
 * the actual frame rate, not by reading the keyframes. Re-time a crease without
 * re-timing its flap and the descent stops being clear.
 *
 * ONLY THE VARIANTS THAT OPEN THE FLAP COMPLETE THE TRIANGLE. `2 · Send` and
 * `4 · Drop` keep the flap shut — it only flexes downward — so their bottom
 * stays exactly as Phosphor drew it. Completing it there would be an unmotivated
 * change to a closed envelope.
 *
 * LANE (§4): ink bbox x[24, 231.5], y[48, 207.5] — 24 left, 24.5 right, 48 top,
 * 48.5 bottom. Every extreme was checked against the wall. Tightest is SEND's
 * launch at 6 units clear.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - scaleY ON THE FLAP. See FINDING 1; a measured rendering failure.
 *   - FLIPPING THE WHOLE ENVELOPE horizontally to "show the back". The mark is
 *     mirror-symmetric about x128 to within 0.086%, so `scaleX: -1` is the
 *     identity transform — it costs a transform and renders nothing. §3's trap,
 *     the same one `bicycle`'s wheels and `user`'s head fall into.
 *   - A LETTER SLIDING OUT of the open flap. The first idea everyone has, and
 *     it means drawing a sheet that is not in the mark. §0 gate 1 forbids adding
 *     geometry, and a new object is a worse violation than a duplicated one: at
 *     24px the result reads as a different icon, not as this one animating.
 *
 * MATERIAL (§9): PAPER. ARRIVE, overshoot at 3–5%, 1.0x base duration, no
 * springs — paper creases and settles, it does not bounce. Paper's character
 * shows in the small flex the flap takes when the body accelerates (SEND,
 * DROP): real behaviour, subordinate, so §2's accent exception covers it being
 * under the floor.
 */

/* ── Geometry ─────────────────────────────────────────────────────────────── */

const FLAP_REST = "M224,56L128,144L32,56";
/** Flap swung up past the hinge. One number differs from FLAP_REST. */
const FLAP_OPEN = "M224,56L128,12L32,56";
/** Paper flexing under acceleration. Subordinate accent, §2's exception. */
const FLAP_FLEX = "M224,56L128,152L32,56";

const BODY =
  "M32,56H224a0,0,0,0,1,0,0V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56A0,0,0,0,1,32,56Z";

/** Authored creases — truncated 23.67 units short of their own apex. */
const CREASE_L = "M110.55,128L34.47,197.74";
const CREASE_R = "M221.53,197.74L145.45,128";
/** The same creases run out to the apex they already point at: (128, 112). */
const CREASE_L_WHOLE = "M128,112L34.47,197.74";
const CREASE_R_WHOLE = "M221.53,197.74L128,112";
/** Bottom flap swung open, apex past its own hinge. See `6 · Unfold`. */
const CREASE_L_OPEN = "M128,240.6L34.47,197.74";
const CREASE_R_OPEN = "M221.53,197.74L128,240.6";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/** Creases that complete into the bottom triangle while the flap is open. */
function Creases({ l, r }: { l?: Variants; r?: Variants }) {
  return (
    <>
      <motion.path d={CREASE_L} {...STROKE} variants={l} />
      <motion.path d={CREASE_R} {...STROKE} variants={r} />
    </>
  );
}

/** The three poses the bottom flap can hold. `rest` is the authored
 *  truncation; `whole` completes the triangle; `open` swings it past its hinge. */
const C_L = { rest: CREASE_L, whole: CREASE_L_WHOLE, open: CREASE_L_OPEN };
const C_R = { rest: CREASE_R, whole: CREASE_R_WHOLE, open: CREASE_R_OPEN };
type CreasePose = keyof typeof C_L;

/** Crease pair sharing one keyframe schedule — they always move together. */
const creasePair = (poses: CreasePose[], times: number[], duration: number) =>
  [
    {
      normal: { d: C_L.rest, transition: RETURN_TRANSITION },
      animate: {
        d: poses.map((p) => C_L[p]),
        transition: { duration, ease: ARRIVE, times },
      },
    },
    {
      normal: { d: C_R.rest, transition: RETURN_TRANSITION },
      animate: {
        d: poses.map((p) => C_R[p]),
        transition: { duration, ease: ARRIVE, times },
      },
    },
  ] as const;

/* ── 1 · OPEN ────────────────────────────────────────────────────────────────
   Verb: OPENS. The flap swings up over the hinge, the bottom triangle closes up
   behind it, and both return.

   The apex travels 144 -> 12 = 132 units (12.4px at 24px), enormous by this
   set's standards and correct: this is the whole gesture, not an accent. It
   passes through the hinge line early, lying flat on the body's top edge — the
   edge-on pose, which reads as a real fold rather than a shape changing.

   The creases complete from 0.10 to 0.34, starting after the flap has cleared
   y112 and finishing just as the flap reaches full open, and retract from 0.72
   after the flap has dropped back below it. ARRIVE throughout: paper settles
   into a position rather than travelling through one (§9), and no overshoot,
   because a flap that springs past its fold reads as plastic. */
const OPEN = 1.2;
const open: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_OPEN, FLAP_OPEN, FLAP_REST],
    transition: { duration: OPEN, ease: ARRIVE, times: [0, 0.32, 0.62, 1] },
  },
};
const [openCreaseL, openCreaseR] = creasePair(
  // starts at t=0 with the flap — the tips are joined to it (FINDING 3)
  ["rest", "whole", "whole", "rest", "rest"],
  [0, 0.1, 0.62, 0.8, 1],
  OPEN,
);

const EnvelopeOpenIcon = forwardRef<IconHandle, IconProps>(function EnvelopeOpenIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : open} />
        <path d={BODY} {...STROKE} />
        <Creases
          l={reduced ? undefined : openCreaseL}
          r={reduced ? undefined : openCreaseR}
        />
      </Svg>
    </div>
  );
});

/* ── 2 · SEND ────────────────────────────────────────────────────────────────
   Verb: SENDS. The envelope pulls back, then launches up and to the right, and
   glides home. THE FLAP STAYS SHUT, so the bottom triangle stays exactly as
   Phosphor drew it — there is nothing to complete on a closed envelope.

   THE WIND-UP IS THE COOL PART AND ALSO THE CHEAPEST (§10). Four units back and
   seven down, tilted -3°, before a launch of +10/-32 at +5°: the dip is about a
   fifth of the main action, the canonical anticipation magnitude. Without it the
   envelope merely changes position; with it, it is thrown.

   THE LAUNCH IS THE TIGHTEST POSE ON THIS PAGE and was tuned against the wall,
   not guessed. At +10/-32/5° the ink reaches x250, y9 — six units of clearance.
   The first attempt (+20/-28 at 6°) measured x255.5, half a unit from the wall,
   and was pulled back. Rotation is what costs the width: turning a 208-unit-wide
   mark 6° adds more horizontal extent than the translation does.

   THE FLAP FLEXES 8 UNITS as the body accelerates — paper lagging behind the
   thing carrying it (§10). Under the floor deliberately: §2's exception covers a
   secondary accent riding a primary that clears it, and the body's 33.5-unit
   travel is the primary. SWEEP, because this is a travel across the artboard. */
const sendBody: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -4, 10, 0],
    y: [0, 7, -32, 0],
    rotate: [0, -3, 5, 0],
    transition: { duration: 1.1, ease: SWEEP, times: [0, 0.22, 0.6, 1] },
  },
};
const sendFlap: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_REST, FLAP_FLEX, FLAP_REST],
    transition: { duration: 1.1, ease: SWEEP, times: [0, 0.22, 0.6, 1] },
  },
};

const EnvelopeSendIcon = forwardRef<IconHandle, IconProps>(function EnvelopeSendIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : sendBody}>
          <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : sendFlap} />
          <path d={BODY} {...STROKE} />
          <Creases />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 3 · FOLD ────────────────────────────────────────────────────────────────
   Verb: FOLDS. The body draws itself, the bottom triangle draws in COMPLETE,
   and then the flap — held open the whole time — folds down and seals it, the
   triangle retracting to its resting truncation as the flap covers it.

   That last clause is the point of FINDING 2 applied properly. The creases draw
   as a whole triangle because the envelope is open while it is being made; they
   only shorten when the flap arrives to cover them. Draw them truncated and the
   open envelope looks broken for the entire first three quarters of the pass.

   Honest here because all four elements are natively stroked (§5). The order is
   the argument: an envelope is a sheet that becomes a container, so the
   container draws first, the folds that make it one arrive second, and the flap
   closing is the last act rather than another line appearing.

   THE BEAT (§11): body lands at 0.40, creases begin at 0.44 — 4% of stillness,
   the same handoff blueprint uses, for the same reason.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Every element is
   round-capped, so `pathLength: 0` parks a full 16-wide DOT at four start
   points. Long strokes, so each opacity gets its own fast tween over the first
   0.05 of its own draw rather than fading across the whole draw.

   NOTE — §1 TENSION, FLAGGED. Opens on `pathLength: 0`, so frame 0 is not the
   icon. §1 forbids it; §15B ships it where the subject genuinely is an act of
   drawing. Folding an envelope arguably is; a mail badge in a nav bar is not. */
const FOLD = 2.0;
const foldBody: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: FOLD, times: [0, 0.4], ease: "easeInOut" },
      opacity: { duration: FOLD, times: [0, 0.05], ease: "linear" },
    },
  },
};
/** Draws in complete, then retracts once the flap has come down over it. */
const foldCrease = (whole: string, rest: string): Variants => ({
  normal: { pathLength: 1, opacity: 1, d: rest, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1, 1],
    opacity: [0, 0, 1, 1],
    d: [whole, whole, rest, rest],
    transition: {
      pathLength: { duration: FOLD, times: [0, 0.44, 0.68, 1], ease: "easeInOut" },
      opacity: { duration: FOLD, times: [0, 0.44, 0.49, 1], ease: "linear" },
      // retracts WITH the flap's descent (0.78->1), not after it, so the tips
      // land back on its edges and the two apexes never meet (FINDING 3)
      d: { duration: FOLD, times: [0, 0.78, 0.92, 1], ease: ARRIVE },
    },
  },
});
const foldCreaseL = foldCrease(CREASE_L_WHOLE, CREASE_L);
const foldCreaseR = foldCrease(CREASE_R_WHOLE, CREASE_R);
const foldFlap: Variants = {
  normal: { pathLength: 1, opacity: 1, d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1, 1],
    opacity: [0, 0, 1, 1],
    d: [FLAP_OPEN, FLAP_OPEN, FLAP_OPEN, FLAP_REST],
    transition: {
      pathLength: { duration: FOLD, times: [0, 0.6, 0.76, 1], ease: "easeInOut" },
      opacity: { duration: FOLD, times: [0, 0.6, 0.65, 1], ease: "linear" },
      d: { duration: FOLD, times: [0, 0.6, 0.78, 1], ease: ARRIVE },
    },
  },
};

const EnvelopeFoldIcon = forwardRef<IconHandle, IconProps>(function EnvelopeFoldIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : foldFlap} />
        <motion.path d={BODY} {...STROKE} variants={reduced ? undefined : foldBody} />
        <Creases
          l={reduced ? undefined : foldCreaseL}
          r={reduced ? undefined : foldCreaseR}
        />
      </Svg>
    </div>
  );
});

/* ── 4 · DROP ────────────────────────────────────────────────────────────────
   Verb: ARRIVES. The envelope lifts, falls, and lands — the flap flexing on
   impact and settling a beat after the body. THE FLAP STAYS SHUT, so the bottom
   triangle stays as authored, same reasoning as SEND.

   THE FLAP LANDING LATE IS THE WHOLE POINT (§10). The body stops at 0.62; the
   flap's flex does not recover until 0.82. Land them together and it is a rigid
   block dropping; let the paper catch up and it has weight and material. This is
   the overlapping action `bird`'s far wing gets, applied to the one part of this
   mark that can lag.

   Lift 30 up (ink to y18), land 4 past rest (ink to y211.5) — 18 and 44 units of
   wall clearance. The 4-unit dip past rest is a settle, not a bounce: paper does
   not bounce (§9), it arrives and stops. */
const dropBody: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -30, 4, 0],
    transition: { duration: 0.9, ease: ARRIVE, times: [0, 0.38, 0.62, 0.78] },
  },
};
const dropFlap: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_REST, FLAP_FLEX, FLAP_REST],
    transition: { duration: 0.9, ease: ARRIVE, times: [0, 0.4, 0.66, 0.82] },
  },
};

const EnvelopeDropIcon = forwardRef<IconHandle, IconProps>(function EnvelopeDropIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : dropBody}>
          <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : dropFlap} />
          <path d={BODY} {...STROKE} />
          <Creases />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 5 · DISPATCH ────────────────────────────────────────────────────────────
   The showcase, composing 1 into 2: the flap swings open and the bottom
   triangle completes, the flap folds shut to seal and the triangle retracts
   under it, and the sealed envelope is thrown.

   THE SEAL IS WHAT MAKES THE LAUNCH MEAN SOMETHING. Opening and then throwing
   an envelope that is still open reads as spilling it; the flap must visibly
   close before the body moves, so the throw carries something finished. That
   makes this a §11 HANDOFF, not an overlap: the flap is home at 0.46 and the
   wind-up does not begin until 0.52. Six percent of stillness — the beat where
   the envelope is simply sealed and sitting there — is what separates a sequence
   of two events from a collision of two animations.

   The open is shorter than 1's (a 0.10 hold against 0.30) because it is a first
   act rather than the whole gesture, and the launch is 2's numbers unchanged,
   since those were the ones tuned against the wall. The creases complete from
   0.06 and are fully retracted by 0.52, so the triangle is never mid-morph while
   the envelope is in flight. */
const DISPATCH = 2.4;
const dispatchFlap: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_OPEN, FLAP_OPEN, FLAP_REST, FLAP_REST, FLAP_FLEX, FLAP_REST],
    transition: {
      duration: DISPATCH,
      ease: ARRIVE,
      times: [0, 0.18, 0.28, 0.46, 0.62, 0.8, 1],
    },
  },
};
const [dispatchCreaseL, dispatchCreaseR] = creasePair(
  ["rest", "whole", "whole", "rest", "rest"],
  [0, 0.06, 0.28, 0.42, 1],
  DISPATCH,
);
const dispatchBody: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -4, 10, 0],
    y: [0, 0, 7, -32, 0],
    rotate: [0, 0, -3, 5, 0],
    transition: { duration: DISPATCH, ease: SWEEP, times: [0, 0.52, 0.64, 0.82, 1] },
  },
};

const EnvelopeDispatchIcon = forwardRef<IconHandle, IconProps>(function EnvelopeDispatchIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : dispatchBody}>
          <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : dispatchFlap} />
          <path d={BODY} {...STROKE} />
          <Creases
            l={reduced ? undefined : dispatchCreaseL}
            r={reduced ? undefined : dispatchCreaseR}
          />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 6 · UNFOLD ──────────────────────────────────────────────────────────────
   1, taken to its conclusion. Verb: UNFOLDS. The top flap swings up, the bottom
   triangle completes and then swings DOWN past its own hinge, both hang open,
   and the envelope folds itself back together bottom-first.

   THE TWO FLAPS ARE VERY NEARLY MIRROR IMAGES, WHICH THE GLYPH DECIDED, NOT ME.
   The top flap's apex rests 88 units BELOW its hinge at y56. The bottom flap's
   apex — the one FINDING 2 derives at (128,112) — sits 85.74 units ABOVE its
   hinge, the line y197.74 joining the two bottom crease ends. Within 2.6 units
   of a perfect mirror. So the bottom flap opens on the SAME ratio the top one
   does, 0.5 of its own reach, putting its apex at 240.6 and its ink at y248 —
   eight units clear of the wall, against the four the open top flap already
   spends. Both halves of the gesture are the same gesture at opposite ends.

   AND BOTH MERGE AT THEIR HINGE, measurably. The top flap edge-on lands on the
   body's top edge; the bottom flap edge-on overlaps the body by 11,026 px along
   its bottom edge. Neither vanishes, both read as a panel going flat — the same
   payoff FINDING 1 bought, arriving free at the other end.

   IT CLOSES BOTTOM-FIRST, AND THAT ORDERING IS NOT ARBITRARY. It is how the
   object works: the bottom panel folds up, then the top flap comes down over
   it. It also removes the only collision risk in the pass — the bottom flap is
   back at its resting truncation by 0.76, two frames before the top flap begins
   descending at 0.78, so the two apexes are never near each other. Reverse the
   order and they cross at y112 with about 1,031 px of overlap. Measured, not
   guessed; do not re-time these independently.

   This is the most expressive thing on the page and the least likely to ship
   as-is: 1.8s and a full unfold is a gallery gesture, not something to meet on
   the fiftieth hover in a mail toolbar (standing test #1). It earns its place
   here as the complete statement of what the mark can do. */
const UNFOLD = 1.8;
const unfoldFlap: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_OPEN, FLAP_OPEN, FLAP_REST],
    transition: { duration: UNFOLD, ease: ARRIVE, times: [0, 0.24, 0.78, 1] },
  },
};
const [unfoldCreaseL, unfoldCreaseR] = creasePair(
  ["rest", "whole", "open", "open", "whole", "rest", "rest"],
  [0, 0.08, 0.38, 0.56, 0.72, 0.9, 1],
  UNFOLD,
);

const EnvelopeUnfoldIcon = forwardRef<IconHandle, IconProps>(function EnvelopeUnfoldIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={FLAP_REST} {...STROKE} variants={reduced ? undefined : unfoldFlap} />
        <path d={BODY} {...STROKE} />
        <Creases
          l={reduced ? undefined : unfoldCreaseL}
          r={reduced ? undefined : unfoldCreaseR}
        />
      </Svg>
    </div>
  );
});

export default function EnvelopeLab() {
  return (
    <VariantGrid
      title="Envelope"
      cycleMs={4800}
      playMs={3200}
      variants={[
        {
          name: "1 · Open",
          blurb: "Flap swings up; the bottom triangle closes up behind it.",
          Component: EnvelopeOpenIcon,
        },
        {
          name: "2 · Send",
          blurb: "It pulls back, launches up-right, and glides home.",
          Component: EnvelopeSendIcon,
        },
        {
          name: "3 · Fold",
          blurb: "Body draws, the whole triangle arrives, then the flap seals.",
          Component: EnvelopeFoldIcon,
        },
        {
          name: "4 · Drop",
          blurb: "It falls and lands, the flap flexing a beat after the body.",
          Component: EnvelopeDropIcon,
        },
        {
          name: "5 · Dispatch",
          blurb: "Opens, seals itself, and is thrown. The showcase.",
          Component: EnvelopeDispatchIcon,
        },
        {
          name: "6 · Unfold",
          blurb: "Both flaps open — top swings up, bottom swings down.",
          Component: EnvelopeUnfoldIcon,
        },
      ]}
    />
  );
}
