"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — User icon, 5 animation candidates.
 *
 * NOTHING IS SPLIT HERE, WHICH IS A FIRST FOR THIS SET. Phosphor's `user` is
 * already two separate stroked elements — a `<circle>` head and a `<path>`
 * shoulder arc, both `fill="none" stroke-width="16"`. There is no compound
 * path to cut, so §1's pixel-diff gate does not apply: rest parity is exact by
 * construction, not by measurement. Both parts are natively stroked, so
 * `pathLength` is honest here too (§5, cf. blueprint).
 *
 * TWO MEASURED FACTS DECIDE EVERY GESTURE BELOW.
 *
 * 1. THE HEAD CANNOT TURN. It is a perfect circle, and a circle rotated about
 *    its own centre is itself (§3). Rasterised at 512x512 and rotated 25.7°
 *    about (128,96), it differs from itself by 0.5568% — antialiasing on the
 *    rim and nothing else. This is `bicycle`'s wheel trap exactly: the
 *    rotation is real, costs a transform, and is invisible at any speed. So
 *    NOTHING here rotates the head about its own centre. Every head gesture
 *    moves the circle's CENTRE — a tilt about the neck (1, 5) or a lateral
 *    shift (2). Do not "simplify" any of these back into a spin.
 *
 * 2. THE HEAD AND SHOULDERS ARE TANGENT AT REST. The circle's lowest point and
 *    the shoulder arc's apex are both exactly (128,160) — the two 16-wide
 *    strokes sit on top of one another there, overlapping by 15.5 units of
 *    ink. That is generous for lateral motion and lethal for vertical: move
 *    the head down or the shoulders up and the two strokes cross visibly,
 *    drawing a line through the face. §1 forbids using opacity to hide a line
 *    collision, so the fix has to be geometric — which is why the vertical
 *    gestures here (4, 5) move head and shoulders as ONE group, preserving the
 *    tangency exactly, and the independent gestures are tilts and lateral
 *    shifts that keep the neck joint overlapped.
 *
 * LANE (§4): whole-mark ink bbox is x[24, 231.5], y[24, 223.5] — 24 left, 24.5
 * right, 24 top, 32.5 bottom. Head alone is x[56, 199.5], y[24, 167.5]; the
 * shoulders own the full width. Tighter than `house` on three sides, so every
 * extreme below was checked against the 256 wall rather than assumed.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - A HEAD TURN / SPIN. Invisible; see fact 1 above. A turn would need a
 *     face to turn, and the mark has none — adding one is forbidden by §0
 *     gate 1.
 *   - A SHRUG (shoulders lift toward the ears). This is the most human gesture
 *     available and it does not survive fact 2: the shoulder apex is already
 *     touching the chin, so lifting it 18+ units to clear the amplitude floor
 *     drives the arc straight through the head. Tried both directions —
 *     shoulders up and head down — and both draw a line across the face.
 *   - WIDENING THE SHOULDERS (scaleX about centre) to suggest a breath. Needs
 *     ~1.18 to clear the 18-unit floor at the arc's endpoints, and at that
 *     amplitude a person does not read as breathing, they read as inflating.
 *
 * MATERIAL (§9): a person — soft and organic, the one subject in this set that
 * genuinely may overshoot a little. So ARRIVE with small overshoots and a
 * settle, never the 0% detents a mechanism gets. Nothing here is springy
 * enough to read as rubber.
 */

/* ── Geometry — the glyph's own two elements, untouched ───────────────────── */

const HEAD = { cx: 128, cy: 96, r: 64 };
const SHOULDERS = "M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The neck: on the shoulder line, just under the chin. Head tilts pivot here
 *  so the circle's CENTRE travels — the only way head motion is visible (§3). */
const NECK = AT(128, 168);
/** Whole-figure pivot, on the ground line under the shoulders. */
const STAGE = AT(128, 216);

const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/* ── 1 · NOD ─────────────────────────────────────────────────────────────────
   Verb: ACKNOWLEDGES. The head tips, comes most of the way back, tips again
   more gently, and settles — the small double dip of someone saying "got it".

   IT PIVOTS AT THE NECK, NOT THE HEAD'S CENTRE, AND THAT IS THE WHOLE POINT.
   About its own centre the circle is invisible (§3); about (128,168) the
   circle's centre swings on a 72-unit radius and the crown on 144, so the
   furthest ink travels 144 × 9° × 0.01745 = 22.6 units (2.1px at 24px), over
   the 18-unit floor (§2). At 7° it is 17.6 and under — which is why it is 9
   and not less.

   THE TWO DIPS ARE UNEQUAL ON PURPOSE (§10). 9° then 6.5°, with the recovery
   between them shorter than the settle that follows. Even them out and it
   stops reading as a nod and starts reading as a metronome. The chin sits 8
   units from the pivot, so it sweeps ~1.3 units — the neck joint stays
   overlapped throughout and never opens a gap. */
const nodHead: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 9, 3, 6.5, 0],
    transition: { duration: 0.85, ease: ARRIVE, times: [0, 0.22, 0.44, 0.62, 1] },
  },
};

const UserNodIcon = forwardRef<IconHandle, IconProps>(function UserNodIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={HEAD.cx}
          cy={HEAD.cy}
          r={HEAD.r}
          {...STROKE}
          variants={reduced ? undefined : nodHead}
          style={NECK}
        />
        <path d={SHOULDERS} {...STROKE} />
      </Svg>
    </div>
  );
});

/* ── 2 · GLANCE ──────────────────────────────────────────────────────────────
   Verb: LOOKS. The head checks left, sweeps across to check right, and comes
   back to centre — looking both ways rather than once.

   A lateral SHIFT, not a rotation, for the reason in the header — and it
   carries a 5-unit lift so the head travels on a shallow arc rather than
   sliding along a rail (§10; 5 units, not the 10–20 SCREEN PIXELS a UI motion
   guide would hand you, which is 106 grid units and half the artboard — §14).

   THE LIFT IS HELD ACROSS THE SWEEP, NOT PUMPED PER SIDE. Arcing up to the
   left, back down through centre, then up again to the right bobs the head
   twice and reads as a bounce. Rising once on the way out, holding while it
   crosses, and settling once on the way home reads as one continuous look.

   THE 22 UNITS ARE BOUNDED ON BOTH SIDES. Below 18 it is invisible (§2); above
   ~26 the chin slides off the shoulder apex and the neck joint visibly comes
   apart, because the two strokes only overlap 15.5 units to begin with. At 22
   the head's ink reaches x34 / x221 — inside the wall on both sides — and the
   joint holds 1,517 px of overlap against 3,197 at rest. Measured, not
   assumed. The full crossing is 44 units, the largest travel on this page.

   SYMMETRY IS SAFE HERE, AND THAT IS WORTH KNOWING. The shoulder arc's second
   half is an `s` — a smooth reflection of the first — and the head is centred
   on x128, so the mark is exactly mirror-symmetric about the centre line. The
   right extreme is the left extreme's mirror and needs no separate clearance
   budget. The HOLDS are unequal instead (0.14 then 0.12): §10 wants decaying
   repeats, and two identical pauses read as a metronome. */
const glanceHead: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -22, -22, 22, 22, 0],
    y: [0, -5, -5, -5, -5, 0],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.2, 0.34, 0.6, 0.72, 1] },
  },
};

const UserGlanceIcon = forwardRef<IconHandle, IconProps>(function UserGlanceIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={HEAD.cx}
          cy={HEAD.cy}
          r={HEAD.r}
          {...STROKE}
          variants={reduced ? undefined : glanceHead}
        />
        <path d={SHOULDERS} {...STROKE} />
      </Svg>
    </div>
  );
});

/* ── 3 · IDENTIFY ────────────────────────────────────────────────────────────
   Verb: IDENTIFIES. The head draws itself, holds for a beat, and the shoulders
   sweep in underneath — a profile resolving, which is what a user icon means
   when it sits on a sign-in or an avatar slot.

   Honest here because both elements are natively stroked, so `pathLength` runs
   along a real stroke instead of being faked with clips (§5).

   THE BEAT IS THE POINT (§11). The head lands at 0.50 and the shoulders do not
   start until 0.54. Head first, because a face is what identifies someone and
   the shoulders are what it arrives on; reverse the order and it reads as a
   body growing a head.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Both elements are
   round-capped and `pathLength: 0` parks a full 16-wide DOT at each start
   point — including the circle, whose dash ends get caps as soon as it is
   dashed. Both are LONG strokes, so each opacity gets its own fast tween over
   the first 0.05 of its own draw; fading across the whole draw would hold the
   finished part semi-transparent for a second.

   NOTE — §1 TENSION, FLAGGED. This opens on `pathLength: 0`, so frame 0 is not
   the icon. §1 forbids that and §15B nonetheless ships it (blueprint, the
   arrow-bend-* family) where the subject genuinely is an act of drawing.
   "Identifying someone" arguably is; a persistent avatar in a nav bar arguably
   is not. Judge it at 24px before promoting. */
const ID = 1.8;
const idHead: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: ID, times: [0, 0.5], ease: "easeInOut" },
      opacity: { duration: ID, times: [0, 0.05], ease: "linear" },
    },
  },
};
const idShoulders: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      pathLength: { duration: ID, times: [0, 0.54, 1], ease: "easeInOut" },
      opacity: { duration: ID, times: [0, 0.54, 0.59], ease: "linear" },
    },
  },
};

const UserIdentifyIcon = forwardRef<IconHandle, IconProps>(function UserIdentifyIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={HEAD.cx}
          cy={HEAD.cy}
          r={HEAD.r}
          {...STROKE}
          variants={reduced ? undefined : idHead}
        />
        <motion.path d={SHOULDERS} {...STROKE} variants={reduced ? undefined : idShoulders} />
      </Svg>
    </div>
  );
});

/* ── 4 · STEP UP ─────────────────────────────────────────────────────────────
   Verb: ARRIVES. The figure rises, overshoots its place by a little, and
   settles back down into it — someone stepping up and squaring away.

   HEAD AND SHOULDERS MOVE AS ONE GROUP, WHICH IS NOT LAZINESS. Fact 2 in the
   header: the chin and the shoulder apex are tangent at (128,160), so ANY
   vertical offset between them crosses the two strokes through the face. A
   group translate preserves the tangency exactly, at every frame, for free.
   This is the gesture that wanted follow-through (the shoulders lagging the
   head by 0.05, §10) and cannot have it — the geometry forbids it.

   THE FIGURE TRAVELS 20 UNITS (1.9px), over the floor (§2), and the settle
   dips 3 units below rest before coming home, which is the follow-through the
   parts could not have between them (§10). Bottom lane is 32.5 units, so the
   dip has room. ARRIVE, and a person is soft enough to earn a small overshoot
   where a mechanism would get none (§9). */
const stepUp: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -20, 3, 0],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.38, 0.72, 1] },
  },
};

const UserStepUpIcon = forwardRef<IconHandle, IconProps>(function UserStepUpIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : stepUp} style={STAGE}>
          <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} {...STROKE} />
          <path d={SHOULDERS} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 5 · GREET ───────────────────────────────────────────────────────────────
   The showcase, composing 4 into 1: the figure steps up, and once it has
   arrived it nods hello.

   THE ORDER IS THE ARGUMENT, AND SO IS THE GAP. The rise settles at 0.42 and
   the nod does not begin until 0.48 — a beat of stillness, because this is a
   §11 HANDOFF and not an overlap. Arriving does not cause nodding; you arrive,
   and then you greet. Start the nod on the way up and the two read as one
   wobble rather than two intentions.

   The nod is deliberately shallower than 1's (7° against 9°, single dip rather
   than a double) because it is riding a gesture that has already spent the
   viewer's attention — a second full-strength beat here reads as fussy at the
   fiftieth hover. The rise still owns the amplitude; the nod is the accent. */
const GREET = 1.5;
const greetBody: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -20, 2, 0, 0],
    transition: { duration: GREET, ease: ARRIVE, times: [0, 0.2, 0.34, 0.42, 1] },
  },
};
const greetHead: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, 7, 2, 0],
    transition: { duration: GREET, ease: ARRIVE, times: [0, 0.48, 0.64, 0.8, 1] },
  },
};

const UserGreetIcon = forwardRef<IconHandle, IconProps>(function UserGreetIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : greetBody} style={STAGE}>
          <motion.circle
            cx={HEAD.cx}
            cy={HEAD.cy}
            r={HEAD.r}
            {...STROKE}
            variants={reduced ? undefined : greetHead}
            style={NECK}
          />
          <path d={SHOULDERS} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

export default function UserLab() {
  return (
    <VariantGrid
      title="User"
      cycleMs={4200}
      playMs={2800}
      variants={[
        {
          name: "1 · Nod",
          blurb: "A double dip at the neck — someone saying 'got it'.",
          Component: UserNodIcon,
        },
        {
          name: "2 · Glance",
          blurb: "The head shifts aside on a shallow arc, then comes back.",
          Component: UserGlanceIcon,
        },
        {
          name: "3 · Identify",
          blurb: "The head draws, a beat, then the shoulders sweep in.",
          Component: UserIdentifyIcon,
        },
        {
          name: "4 · Step up",
          blurb: "The figure rises, overshoots, and settles into place.",
          Component: UserStepUpIcon,
        },
        {
          name: "5 · Greet",
          blurb: "It steps up, arrives, and then nods hello. The showcase.",
          Component: UserGreetIcon,
        },
      ]}
    />
  );
}
