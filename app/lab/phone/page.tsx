"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Phone icon, 5 animation candidates.
 *
 * ONE PATH, NO PARTS, AND THAT DECIDES THE WHOLE PAGE. Phosphor's `phone` is a
 * single closed `fill="none" stroke-width="16"` handset outline. There is
 * nothing inside it to move — no flap like `envelope`, no door like `house`, no
 * head like `user`. §0 gate 1 asks whether the glyph already contains the moving
 * part; here the answer is that the glyph IS the moving part, so every gesture
 * below moves the whole mark.
 *
 * That is explicitly allowed and is not the lazy option: §15B lists whole-mark
 * rotation as shipping in this set (`biohazard`, called the best motion in it)
 * and says it fails only "when the mark has an internal part that should have
 * moved instead". This mark has none. Rest parity is exact by construction (§1)
 * — nothing is split, nothing is restated.
 *
 * ══ THIS GLYPH IS THE OPPOSITE PROBLEM FROM `user` AND `users-three` ══
 *
 * Those marks have circular heads, where rotation about the centre is invisible
 * and the fight is to make motion register at all. Here rotation is violently
 * legible, and the fight is restraint. Measured at 512x512 against the ink
 * centroid (117.1, 138.4):
 *     10° about the centroid changes 77.67% of the ink
 *     25° about the centroid changes 139.84%
 * (`user`'s head, for comparison: 0.56% at 25°.) The furthest ink sits 161.8
 * units from that centroid, so travel is 2.82 units per degree and the §2
 * amplitude floor is cleared at **6.37°**. Seven degrees is a legible gesture on
 * this glyph. Fifteen is a catastrophe. Every angle below is single digits, and
 * that is deliberate, not timid.
 *
 * THE PIVOT IS THE MEASURED INK CENTROID, NOT THE ARTBOARD CENTRE. (117.1,
 * 138.4) against the box's (128,128). The handset is a diagonal mass with more
 * weight low and left, so rotating about the artboard centre swings it like a
 * signpost; rotating about its own centroid reads as the object turning on its
 * own balance point. Ten units of difference, entirely visible at this leverage.
 *
 * LANE (§4): ink bbox x[32, 231.5], y[24, 223.5] — 32 left, 24.5 right, 24 top,
 * 32.5 bottom. Comfortable, and every extreme below was still checked: RING at
 * ±7° keeps 20.5 units of wall, BUZZ keeps 11.5, ANSWER — the tightest — keeps
 * 9.5. Nothing clips and nothing paints outside at rest.
 *
 * NOT A §3 TRAP, UNUSUALLY. The mark is 164% asymmetric under a mirror, so
 * unlike `envelope` (0.086%, where `scaleX: -1` is the identity) a flip here
 * genuinely renders. It is still not used: flipping a handset produces a
 * left-handed phone, which is a different drawing, not this one animating.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - EMITTED RINGING ARCS beside the handset. Legitimate on precedent —
 *     `bell-ringing` ships exactly this under the motion name "emit", and §15B
 *     allows detached accents where the mark itself also moves, which RING does.
 *     Left out only to keep these five candidates about the handset itself; it
 *     is the first thing to add if RING is chosen and wants more voice. Note it
 *     is NOT the same call as the envelope's rejected letter: an abstract accent
 *     is not a new object.
 *   - A PENDULUM SWING on `springSwing`, as though the handset hung by its cord.
 *     §9 puts hanging things on that spring, but the cord is not in the mark and
 *     a handset swinging from nothing reads as floating rather than hanging.
 *   - ROTATING ABOUT THE ARTBOARD CENTRE. See the pivot note; it is the same
 *     gesture with the wrong fulcrum and it looks like a signpost.
 *
 * MATERIAL (§9): moulded plastic — rigid. So ARRIVE and easeInOut, no squash,
 * and overshoot at 0–5%. A handset that squashes reads as rubber. What rigid
 * plastic DOES do is ring on and on with decaying amplitude, which is why the
 * oscillating variants decay rather than repeat flat (§10).
 */

/** The glyph's own single path, untouched. */
const PHONE =
  "M164.39,145.34a8,8,0,0,1,7.59-.69l47.16,21.13a8,8,0,0,1,4.8,8.3A48.33,48.33,0,0,1,176,216,136,136,0,0,1,40,80,48.33,48.33,0,0,1,81.92,32.06a8,8,0,0,1,8.3,4.8l21.13,47.2a8,8,0,0,1-.66,7.53L89.32,117a7.93,7.93,0,0,0-.54,7.81c8.27,16.93,25.77,34.22,42.75,42.41a7.92,7.92,0,0,0,7.83-.59Z";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Measured ink centroid — the handset's own balance point. Not (128,128). */
const BALANCE = AT(117.1, 138.4);

const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/** 18 units split across the two axes of the handset's short diagonal. */
const B = 18 * Math.SQRT1_2;

/* ── 1 · RING ────────────────────────────────────────────────────────────────
   Verb: RINGS. The handset rocks on its own balance point, four times, each
   swing weaker than the last.

   THE DECAY IS THE WHOLE CHARACTER (§10). 7° -> 5.5° -> 4.5° -> 2.5°, with the
   intervals between them widening as the amplitude falls. Even them out and it
   stops being a ring and becomes a notification badge throbbing — the exact
   failure §10 names for `heart`'s lub-dub. Rigid plastic rings on and on and
   fades; it does not oscillate at constant strength.

   SEVEN DEGREES IS A DELIBERATE CEILING. It puts the furthest ink through 19.7
   units, just over the floor (§2), and leaves 20.5 units of wall. At the 15–20°
   a hand-tuned "shake" tends to land on, this glyph swings 42–56 units and
   throws itself off the artboard. See the header: 2.82 units per degree.

   easeInOut, because the mark is reversing direction repeatedly rather than
   settling into any one position (§8). */
const ring: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 5.5, -4.5, 2.5, 0],
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: [0, 0.16, 0.34, 0.52, 0.7, 1],
    },
  },
};

const PhoneRingIcon = forwardRef<IconHandle, IconProps>(function PhoneRingIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={PHONE}
          {...STROKE}
          variants={reduced ? undefined : ring}
          style={BALANCE}
        />
      </Svg>
    </div>
  );
});

/* ── 2 · ANSWER ──────────────────────────────────────────────────────────────
   Verb: ANSWERS. The handset lifts off its cradle and tilts back to the ear,
   holds there, and returns.

   TWO CHANNELS, ONE GESTURE. Rising 22 units alone reads as the icon hopping;
   tilting 11° alone reads as it falling over. Together they read as a hand
   picking something up, because that is what lifting an object actually does to
   it — the far end swings as the near end rises.

   The tilt is NEGATIVE, taking the earpiece up and away, which is the direction
   a right-handed pickup goes and the one the glyph's own diagonal already
   points along. 11° is 31 units of travel on top of the 22 of lift, so this is
   comfortably the largest gesture on the page and the tightest against the
   wall: 9.5 units of clearance, measured, at the top-left corner.

   ARRIVE, because the handset is settling into a held position rather than
   crossing the frame (§8). No overshoot: rigid plastic in a hand does not
   spring past where the hand puts it (§9). */
const answer: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -22, -22, 0],
    rotate: [0, -11, -11, 0],
    transition: { duration: 1.1, ease: ARRIVE, times: [0, 0.3, 0.62, 1] },
  },
};

const PhoneAnswerIcon = forwardRef<IconHandle, IconProps>(function PhoneAnswerIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={PHONE}
          {...STROKE}
          variants={reduced ? undefined : answer}
          style={BALANCE}
        />
      </Svg>
    </div>
  );
});

/* ── 3 · BUZZ ────────────────────────────────────────────────────────────────
   Verb: VIBRATES. The handset judders along one axis, fast and tight, and
   damps out.

   THIS IS NOT RING WITH DIFFERENT NUMBERS, AND THE SEPARATION IS THE POINT.
   Ring ROTATES, slowly, on a 0.9s pass, and reads as a bell in a cradle. Buzz
   TRANSLATES, on a 0.7s pass with six excursions instead of four, and reads as
   a motor. Different channel, different frequency, different object behaviour.
   If these two ever converge in tuning, one of them should be deleted rather
   than nudged — two shakes in a set of five is the "generic" failure §15 names.

   IT TRAVELS ON THE HANDSET'S SHORT DIAGONAL. The mark runs upper-left to
   lower-right, so the buzz is thrown across that axis rather than along it: a
   vibration parallel to the body's own length barely changes the silhouette,
   while one across it makes the whole outline shift. 18 units total, split
   12.73 on each of x and y, which is the floor exactly (§2) — for a vibration
   the floor IS the design, since anything larger stops reading as a buzz and
   starts reading as being thrown.

   Six decaying excursions, 18 -> 14 -> 10 -> 7 -> 4 (§10). */
const buzz: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, B, -B * 0.78, B * 0.56, -B * 0.39, B * 0.22, 0],
    y: [0, -B, B * 0.78, -B * 0.56, B * 0.39, -B * 0.22, 0],
    transition: {
      duration: 0.7,
      ease: "easeInOut",
      times: [0, 0.12, 0.26, 0.4, 0.54, 0.7, 1],
    },
  },
};

const PhoneBuzzIcon = forwardRef<IconHandle, IconProps>(function PhoneBuzzIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={PHONE} {...STROKE} variants={reduced ? undefined : buzz} />
      </Svg>
    </div>
  );
});

/* ── 4 · CONNECT ─────────────────────────────────────────────────────────────
   Verb: CONNECTS. The handset draws itself in one continuous stroke — a line
   being established.

   Honest here because the mark is natively stroked, so `pathLength` runs along
   a real stroke and no clip-faking is involved (§5). It is also the one gesture
   on this page that suits the object's OTHER meaning: a phone icon on a support
   page is not a ringing handset, it is a channel opening.

   ONE PATH MEANS ONE UNBROKEN DRAW, which is why there is no stagger and no
   beat here — §11's sequencing rules need two phases to sequence, and this has
   one. That is a property of the glyph, not an omission.

   THE OPACITY TWEEN IS LOAD-BEARING, NOT DECORATION (§5). The stroke is
   round-capped, so `pathLength: 0` parks a full 16-wide DOT on its start point
   at (164.39, 145.34) — mid-glyph, where it is especially obvious. This is a
   LONG stroke, so opacity gets its own fast tween over the first 0.05 rather
   than fading across the whole draw, which would hold the finished part
   semi-transparent for a second.

   NOTE — §1 TENSION, FLAGGED. Opens on `pathLength: 0`, so frame 0 is not the
   icon. §1 forbids it; §15B ships it (blueprint, arrow-bend-*) where the subject
   genuinely is an act of drawing. A connection being established arguably is; a
   call button in a nav bar is not. Judge at 24px before promoting. */
const CONNECT = 1.4;
const connect: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: CONNECT, times: [0, 0.72], ease: "easeInOut" },
      opacity: { duration: CONNECT, times: [0, 0.05], ease: "linear" },
    },
  },
};

const PhoneConnectIcon = forwardRef<IconHandle, IconProps>(function PhoneConnectIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={PHONE} {...STROKE} variants={reduced ? undefined : connect} />
      </Svg>
    </div>
  );
});

/* ── 5 · CALL ────────────────────────────────────────────────────────────────
   The showcase, composing 1 into 2: it rings, and then it is answered.

   THE BEAT BETWEEN THEM IS THE STORY (§11). The ring damps out at 0.42 and the
   lift does not begin until 0.48. That 6% of stillness is the moment between
   the phone stopping and someone reaching for it, and it is what makes this two
   events rather than one confused motion. Overlap them and the lift looks like
   part of the last swing; §11 says separate when one phase hands off to the
   other, and ringing hands off to answering — it does not cause it.

   THE RING IS SHORTENED, NOT WEAKENED. Three swings instead of four, at the
   same 7° opening amplitude, because the ring here is a first act rather than
   the whole gesture — but dropping its amplitude too would leave the pass with
   no legible motion until halfway through. Cut the length, keep the strength.

   The answer half is 2's numbers unchanged, since those were the ones measured
   against the wall at 9.5 units of clearance. */
const CALL = 2.0;
const call: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // the pair of zeros at 0.42/0.48 IS the beat — without the second one the
    // lift starts on the frame the ring ends and the handoff disappears
    rotate: [0, -7, 5.5, -3.5, 0, 0, -11, -11, 0],
    y: [0, 0, 0, 0, 0, 0, -22, -22, 0],
    transition: {
      duration: CALL,
      ease: ARRIVE,
      times: [0, 0.08, 0.2, 0.32, 0.42, 0.48, 0.66, 0.82, 1],
    },
  },
};

const PhoneCallIcon = forwardRef<IconHandle, IconProps>(function PhoneCallIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={PHONE}
          {...STROKE}
          variants={reduced ? undefined : call}
          style={BALANCE}
        />
      </Svg>
    </div>
  );
});

export default function PhoneLab() {
  return (
    <VariantGrid
      title="Phone"
      cycleMs={4200}
      playMs={2600}
      variants={[
        {
          name: "1 · Ring",
          blurb: "Rocks on its own balance point, each swing weaker.",
          Component: PhoneRingIcon,
        },
        {
          name: "2 · Answer",
          blurb: "Lifts off the cradle and tilts back to the ear.",
          Component: PhoneAnswerIcon,
        },
        {
          name: "3 · Buzz",
          blurb: "Judders across its short diagonal, fast, and damps out.",
          Component: PhoneBuzzIcon,
        },
        {
          name: "4 · Connect",
          blurb: "Draws itself in one unbroken stroke — a line opening.",
          Component: PhoneConnectIcon,
        },
        {
          name: "5 · Call",
          blurb: "It rings, a beat passes, and it is answered. The showcase.",
          Component: PhoneCallIcon,
        },
      ]}
    />
  );
}
