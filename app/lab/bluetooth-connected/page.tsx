"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import {
  animate,
  cubicBezier,
  easeInOut,
  easeOut,
  interpolate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
  type EasingFunction,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN, RETURN_TRANSITION, SWEEP, type Bezier } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bluetooth Connected, seven takes. Not a ladder: 1–5 are five different
 * verbs, each read off something this glyph has that plain `bluetooth` does not.
 * 6 is a brief — the rune folds into a check mark — built from the same parts,
 * and 7 composes 3's round trip with 6's check.
 *
 * THE MARK is `bluetooth` plus two filled dots, r12, at (60,128) and (204,128).
 * Plain `bluetooth` moves by connecting (arms lock, packet runs). This one is
 * already connected — so every take here is about what two linked things DO.
 *
 * ── MEASURED, not assumed (rasterised at 512x512, counting only pixels that
 *    flip ink/no-ink so antialiasing cannot inflate the figure) ──────────────
 *
 *   ink bbox    x48..216, y24..232. Lanes: 48 left, 40 right, 24 top, 24 bottom.
 *
 *   THE DOTS SIT ON THE HUB'S AXIS. Both are on y128, the line through the hub
 *   and the rune's mirror axis. The left one sits in the mouth of the arms' "<",
 *   the right one in the notch between the loops' ">". Every take uses that line.
 *
 *   WHERE A DOT TOUCHES THE RUNE. A point on y128 is 0.6 × |x − 128| from either
 *   diagonal, and contact is at dot radius + half the pen = 20. So the left dot
 *   meets both arms at x94.7 (34.7 units in from rest) and the right dot meets
 *   the notch at x161.3 (42.7 in). Those two numbers are the stops in 1 and 2.
 *
 *   RESTATEMENTS THE TAKES DEPEND ON — all at or under the 0.1% gate:
 *     dots as rounded rects (rx12, right one mirrored)    0 / 43,927 = 0.00%
 *     rune under vector-effect: non-scaling-stroke        0 / 43,927 = 0.00%
 *     rune mirrored about y128                           26 / 43,927 = 0.06%
 *
 * ── REJECTED ─────────────────────────────────────────────────────────────────
 *
 *   · SPINNING THE DOTS in place. A circle rotated about its centre is itself
 *     (§3) — no rotation is visible at any speed.
 *   · BLINKING THE DOTS like a status LED. Opacity standing in for motion (§1).
 *   · A TETHER — both dots sliding sideways in unison, as if on one cord through
 *     the hub. Physically the best argument for "connected", but on screen two
 *     dots moving the same way is the whole icon shaking its head: a wiggle (§0).
 *   · SPARK ARCS jumping dot to rune. Geometry the mark does not contain (§15).
 *   · A SEESAW, the dots tilting about the hub. Reads as weighing, not linking.
 */

/** Phosphor's source, element for element. */
const LOOPS = ["128 32 192 80 128 128 128 32", "128 128 192 176 128 224 128 128"];
const ARM_UP = { x1: 64, y1: 80, x2: 128, y2: 128 };
const ARM_DOWN = { x1: 64, y1: 176, x2: 128, y2: 128 };
const LEFT = { cx: 60, cy: 128, r: 12 };
const RIGHT = { cx: 204, cy: 128, r: 12 };
/** Centre to centre, left dot to right dot. */
const SPACING = 144;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const INK = { fill: "currentColor", stroke: "none" };
const HUB = AT(128, 128);
/** Dots scale about their own centre, wherever they have travelled to. */
const OWN_CENTRE = { transformBox: "fill-box" as const, originX: 0.5, originY: 0.5 };

function Rune() {
  return (
    <>
      {LOOPS.map((points) => (
        <polygon key={points} points={points} />
      ))}
      <line {...ARM_UP} />
      <line {...ARM_DOWN} />
    </>
  );
}

/* ══ 1. DOCK ═════════════════════════════════════════════════════════════════
   The dots are connectors. Each one extends into a pin and seats in its socket:
   the left into the mouth of the arms, the right into the notch between the
   loops. The arms swing open to take the left pin and close on it — a grip, on
   the same frame the right pin seats. For a beat the icon is wired, not wireless.

   A PIN, NOT A STRETCH. The dot is redrawn as a rect with rx12 (0.00% at rest),
   and the pin grows by WIDTH, so its end stays a true semicircle the whole way.
   `scaleX` on the circle would squash it into an ellipse — elastic, and wrong
   for a connector. The right pin sits in a group mirrored about x204, so the
   same width tween grows it leftward with its outer end pinned.

   THE GRIP IS WHY THE ARMS OPEN. Seated against closed arms, the left pin stops
   at x94.7. With the arms open 8° the contact moves to x99.6, so the pin goes in
   to 99 — and when the arms close, they bite 4 units into it. That overlap is the
   grip; without the open-and-close there is only a pin that stops.

   MATERIAL: a rigid connector. Ease-in into the seat, no overshoot. */
const DOCK = 1.1;
const dockArm = (open: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, open, open, 0, 0],
    transition: { duration: DOCK, times: [0, 0.2, 0.36, 0.45, 1], ease: [ARRIVE, "linear", "easeIn", "linear"] },
  },
});
const pin = (seat: number, arrive: number, ease: "easeInOut" | "easeIn"): Variants => ({
  normal: { width: 24, transition: RETURN_TRANSITION },
  animate: {
    width: [24, 24, seat, seat, 24],
    transition: { duration: DOCK, times: [0, arrive - 0.28, arrive, 0.7, 1], ease: ["linear", ease, "linear", ARRIVE] },
  },
});
/** Left pin: cap centre to x99 (width 99 + 12 − 48). Right pin: cap centre to x161. */
const PIN_LEFT = pin(63, 0.36, "easeInOut");
const PIN_RIGHT = pin(67, 0.45, "easeIn");

/* ══ 2. CRADLE ═══════════════════════════════════════════════════════════════
   Newton's cradle, with the rune as the balls in the middle. The left dot draws
   back, swings in and strikes the arms — and stops dead. The right dot flies
   out. It swings back and stops dead, and now the left dot is knocked out, less
   far, and settles. Whatever happens on one side happens on the other: that is
   what connected means.

   THE STOPS ARE MEASURED. The strike lands at +34 (x94, against both arms) — a
   hair short of the 34.7 contact, so the pen merges rather than overlaps. The
   right dot never touches the notch; its return stop is its own rest.

   THE IMPULSE IS SEEN CROSSING. The rune shunts 4 units right on the first
   strike and 3 back on the second. Under the floor on purpose (§2's exception)
   — texture that says the force went THROUGH, not around.

   DECAY (§10): out 26, back 10. An even exchange reads as a loop; a losing one
   reads as energy.

   MATERIAL: steel. No squash, no overshoot at a contact; ease-in into each
   strike, ease-out away from it. */
const CRADLE = 1.3;
const cradleLeft: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 34, 34, -10, 0],
    transition: {
      duration: CRADLE,
      times: [0, 0.14, 0.3, 0.64, 0.82, 1],
      ease: ["easeOut", "easeIn", "linear", "easeOut", "easeInOut"],
    },
  },
};
const cradleRight: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, 26, 0, 0],
    transition: { duration: CRADLE, times: [0, 0.3, 0.47, 0.64, 1], ease: ["linear", "easeOut", "easeIn", "linear"] },
  },
};
const cradleRune: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, 4, 0, 0, -3, 0, 0],
    transition: {
      duration: CRADLE,
      times: [0, 0.3, 0.34, 0.42, 0.64, 0.68, 0.76, 1],
      ease: ["linear", "easeOut", "easeInOut", "linear", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 3. SLINGSHOT ════════════════════════════════════════════════════════════
   The arms ARE a slingshot fork — two prongs meeting at a crotch — and the left
   dot already sits in the pouch between their tips. Draw it back; the prongs
   bend in under the tension. Release: the shot fires through the crotch and
   across the hub. The right dot reaches out and CATCHES it — the shot lands in
   it, the two become one dot, and the catch gives a little under the impact.
   Then it throws the shot back, and the sling catches it: the band stretches,
   the prongs bend, the shot settles in the pouch. Sent, received, returned.

   WHY IT THROWS BACK. A caught shot leaves the pouch empty and the mark with
   one dot where it has two. The first cut knocked the right dot away instead,
   shrank it to nothing and grew it back in the pouch — no third dot, but a dot
   that vanished and reappeared. Returning the shot is the only honest way home:
   no dot is ever created, destroyed or teleported, and every frame has exactly
   the dots it shows. It is also the better story — a connection is two-way.

   THE CATCH, BEAT BY BEAT.
     · REACH. The catcher moves 8 units toward the shot in the 100ms before it
       lands, and stops dead as it arrives — a glove set to receive, not a wall
       being hit. It meets the shot at x196.
     · LAND. The shot arrives still moving (its curve ends at two-thirds of its
       average speed), and lands exactly on the catcher: same centre, same
       radius, one dot. At 24px two touching dots read as "••"; one reads as
       caught.
     · GIVE. The pair drifts 22 units right together and slows — equal masses
       sharing one momentum, so the drift starts at roughly half the shot's
       speed. Both tracks use the same times and curve, so they cannot part.
     · WIND-UP AND THROW. 4 more units back (anticipation, §10), then the
       catcher snaps forward past its rest by 6 — the follow-through of a
       throw — while the shot leaves at speed.

   THE SLING CATCHES IT BACK. The shot comes home fast enough to carry 12 units
   past rest into the pouch; the prongs bend in 5° as the band takes the load,
   and the band pushes it back through +3 to rest. Elastic, so this is the one
   overshoot in the take (§9: elastic 15–25%; 12 of a 170-unit flight is 7%).

   THE FLIGHTS ARE ALMOST STRAIGHT-LINE, ON PURPOSE. SHOT is a bare curve —
   [0.2, 0.5, 0.7, 0.8]: a short kick as the band lets go, near-constant speed
   in the air, and it arrives still travelling. A thrown thing does not ease to
   a stop in mid-air, so neither SWEEP nor an ease-out will do. §8 asks a reason
   for a bare curve; that is it.

   THROUGH THE HUB, IN FRONT. The shot and the catcher are painted over the
   rune, so the shot reads as passing through the fork, not as a hole in it.
   Leaving mid-pass glides everything home — a shot in flight returns to the
   pouch, which is where it belongs. */
const SLING_MS = 1300;
const sling = (...ms: number[]) => ms.map((m) => m / SLING_MS);
const SHOT: Bezier = [0.2, 0.5, 0.7, 0.8];
/** The catch's give: starts near half the shot's arriving speed, then slows. */
const GIVE: Bezier = [0.2, 0.6, 0.4, 1];
/** Upper prong bends by `bend`, the lower by −bend; negative closes them in. */
const slingArm = (bend: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // draw, hold, release (ring past rest), settle, ... the shot comes home, band loads, settles
    rotate: [0, bend, bend, -bend / 2, 0, 0, (bend * 5) / 6, 0, 0],
    transition: {
      duration: SLING_MS / 1000,
      // The band loads as the shot passes the pouch (~1040) and peaks with it at
      // its deepest (1060-1070). Scrubbed first at 1110, the prongs peaked 50ms
      // after the shot had already turned back — a sling bending on its own.
      times: sling(0, 280, 330, 390, 460, 1040, 1070, 1220, 1300),
      ease: ["easeInOut", "linear", "easeOut", "easeInOut", "linear", "easeOut", "easeInOut", "linear"],
    },
  },
});
/** The catch point: the catcher reaches 8 units left, so the shot lands at x196. */
const CATCH = SPACING - 8;
const shot: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // draw, hold, fly, give, wind-up, fly home past rest, band pushes back, settle
    x: [0, -22, -22, CATCH, CATCH + 22, CATCH + 26, -12, 3, 0, 0],
    transition: {
      duration: SLING_MS / 1000,
      times: sling(0, 280, 330, 540, 700, 780, 1060, 1160, 1260, 1300),
      ease: ["easeInOut", "linear", SHOT, GIVE, "easeInOut", SHOT, "easeOut", "easeInOut", "linear"],
    },
  },
};
const catcher: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // wait, reach, give (with the shot in it), wind-up, throw past rest, settle
    x: [0, 0, -8, 14, 18, -6, 0, 0],
    transition: {
      duration: SLING_MS / 1000,
      times: sling(0, 440, 540, 700, 780, 860, 980, 1300),
      ease: ["linear", "easeOut", GIVE, "easeInOut", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 4. ORBIT ════════════════════════════════════════════════════════════════
   The two dots are a bound pair, and they orbit each other around the rune. The
   left one swings round behind it — smaller, rising, slipping under the hub —
   while the right one swings round in front, larger, dipping. They trade sides.

   THE ORBIT IS A CIRCLE SEEN SLIGHTLY FROM ABOVE, about (132,128): the midpoint
   of the dots, not the hub, so half a turn lands each dot exactly on the other's
   place (72 units either side). x is 72·cos, depth is sin — shown as scale
   (±28%) and as a 26-unit vertical offset, which is what tilts the ring into
   perspective. The first cut used 14, and at a true 24px the two dots met at the
   hub and read as passing THROUGH each other; 26 holds them apart as they cross.

   BEHIND MEANS BENEATH. The travelling-back dot is painted before the rune, so
   the hub's crossing covers it as it passes. The front one is painted after.
   Static paint order is invisible at rest: neither dot touches the rune there.

   THE ANGLE IS LINEAR, AND THAT IS THE EASE. Seen side-on, steady circular
   motion already slows into and out of each end — x is 1 − cos θ. The first cut
   put SWEEP on the angle as well, doubling the slow start: scrubbed, the dots
   had covered 11 of 144 units after 350ms. Constant angular speed is the honest
   orbit (§8: linear is for rotation), and cos supplies the ease-in-out for free.
   Keyed as 16 samples, because keying x alone would move the dots along a line;
   16 segments of 11.25° miss the true circle by 1.4 units at most. */
const ORBIT = 0.9;
const SAMPLES = 16;
const ORBIT_TIMES = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);
const ANGLES = ORBIT_TIMES.map((t) => Math.PI * t);
/** side −1 = the left dot, going round behind; +1 = the right dot, in front. */
function orbiter(side: -1 | 1): Variants {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    normal: { x: 0, y: 0, scale: 1, transition: RETURN_TRANSITION },
    animate: {
      x: ANGLES.map((a) => round(side * (72 * Math.cos(a) - 72))),
      y: ANGLES.map((a) => round(side * 26 * Math.sin(a))),
      scale: ANGLES.map((a) => round(1 + side * 0.28 * Math.sin(a))),
      transition: { duration: ORBIT, times: ORBIT_TIMES, ease: "linear" },
    },
  };
}
const ORBIT_BEHIND = orbiter(-1);
const ORBIT_FRONT = orbiter(1);

/* ══ 5. AXLE ═════════════════════════════════════════════════════════════════
   The dots are bearings, and the rune is a plate turning on the axle between
   them. It spins half a turn about y128 — and at the instant it is edge-on, the
   whole icon is a single bar, dot to dot: ●━━━●. For that moment the picture IS
   the word "connected". Then it turns on, and lands as itself.

   THE GLYPH WAS BUILT FOR THIS. The dots sit exactly on the rune's mirror axis,
   so they are the one part of the mark a turn about that axis does not move —
   bearings, by construction. And the rune is its own mirror image, so half a
   turn lands on rest (0.06% — antialiasing only).

   A TURN, NOT A SQUASH. `scaleY` alone thins the horizontal strokes as it
   flattens them, which reads as squashing — and §9 says rigid things do not
   squash. So every stroke is `non-scaling-stroke` at 16 units' worth of screen
   pixels (0.00% at rest): the plate foreshortens, the pen does not. Edge-on,
   the rune flattens into a bar x56..200 that runs into both dots.

   IT SLOWS THROUGH EDGE-ON. cos θ changes fastest near 90°, so an even spin
   would flash the bar for a frame. The angle eases in to 80°, crosses 80–100°
   linearly over a fifth of the pass, and eases out — long enough to see the
   link, short of looking stuck.

   THE CROSSING IS DELIBERATELY LOPSIDED. A zero scale is a non-invertible
   transform and the browser drops the element — scrubbed at exactly 500ms, a
   symmetric ±0.174 segment crossed 0 on the dot and the rune vanished, leaving
   "•  •" at the one frame that matters. Ending the segment at −0.170 moves the
   zero to 501.16ms, a time no real frame lands on exactly. The 0.004 is
   invisible.

   MATERIAL: mechanical, on a bearing. No overshoot — a plate that swings past
   flat and back reads as loose. */
const AXLE = 1;
const turn: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // cos 0°, cos 80°, ~cos 100° (see above), cos 180°
    scaleY: [1, 0.174, -0.17, -1],
    transition: { duration: AXLE, times: [0, 0.4, 0.6, 1], ease: ["easeIn", "linear", "easeOut"] },
  },
};

/* ══ 6. CONFIRM ══════════════════════════════════════════════════════════════
   The rune folds itself into a check mark between the two dots — the connection
   confirmed — holds it, and unfolds back into the rune.

   NOTHING IS DRAWN IN. Every stroke of the check is a part of the rune moved
   there, and the check's two ends are the two dots:
     · the ARMS close like a pocket knife into the short stroke. The lower arm
       swings up 82° onto the upper, which only turns 8°; both slide their hub
       end down the turning spine to the check's corner (104,172) and shorten
       80 -> 62.
     · the SPINE turns 45° clockwise about its moving centre and shortens
       192 -> 141 into the long stroke, while both LOOPS fold flat onto it like
       closing covers. Built in the spine's own frame — along the spine, and out
       from it — so the loops travel with the turn instead of sliding across it.
     · the LEFT DOT is already where the check starts, (60,128): it shrinks from
       r12 to the pen's r8 as the arms arrive and becomes the start cap. The
       RIGHT DOT rises to the tip, (204,72), and becomes the end cap.
   So the check is literally drawn from one device to the other.

   THE CHECK IS PHOSPHOR'S PROPORTION, NOT A GUESS. Legs at 45° with the long
   one 2.27× the short (Phosphor's `check` is 2.29×). Placing its start on the
   left dot and its tip at x204 fixes it at (60,128) -> (104,172) -> (204,72):
   ink x52..212, y64..180, centred on (132,122) — the artboard centre to within
   six units, and inside every lane.

   ORDER. Folding in, the arms lead and the body follows 0.08 behind, so the
   short stroke lands before the long one — the order a hand writes a tick.
   Unfolding, the body leads and the arms follow: the reverse, so the rune is
   put back together in the order it was taken apart.

   `d` IS WRITTEN BY ONE COMPONENT FROM A CLOCK, per `bookmark-simple`: variant
   `d` keyframes do not interpolate, and `useTransform` into a motion.path races
   React. The rest pose it writes at u=0 measures 16 / 43,927 = 0.04% against
   Phosphor's source.

   INTERRUPTS. Leaving before the unfold has begun runs the clock back to 0 — the
   check unfolds into the rune. Leaving once it has begun runs forward to 1. Both
   in DUR.base, and both land on the rune.

   THE TENSION, stated: this breaks §0's second gate on purpose. For the middle
   of the pass the still frame is a check, not a Bluetooth mark. That is the
   brief — "connected" said as a confirmation — and the trade that keeps it
   honest is that nothing is added and it always comes home. At 1.7s with a
   440ms hold it is the heaviest take here on the fiftieth hover. */
const CONFIRM = 1.7;
type Pt = [number, number];
/** The check is (60,128) -> (104,172) -> (204,72). The corner is not stored:
 *  it is where the spine's bottom end lands, and the arms are pinned to it. */
const CHECK_TIP: Pt = [204, 72];
const SHORT_LEG = Math.hypot(44, 44);
const LONG_LEG = Math.hypot(100, 100);
/** Midpoint of the long leg: where the spine's centre travels to. */
const LEG_CENTRE: Pt = [154, 122];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const travel = cubicBezier(...SWEEP);
const phase = (u: number, from: number, to: number) => travel(clamp01((u - from) / (to - from)));
const DEG = Math.PI / 180;

/** How folded each part is at clock u: 0 = rune, 1 = check. */
function folds(u: number) {
  return {
    arms: phase(u, 0, 0.3) - phase(u, 0.72, 1),
    body: phase(u, 0.08, 0.4) - phase(u, 0.66, 0.92),
  };
}

/**
 * The spine's moving frame at fold m: its centre travels to the long leg's
 * midpoint, it turns 45° clockwise, shortens to the leg, and anything standing
 * out from it (the loops) lies down flat. `at(along, out)` places a point.
 */
function spineAt(m: number) {
  const cx = lerp(128, LEG_CENTRE[0], m);
  const cy = lerp(128, LEG_CENTRE[1], m);
  const th = lerp(-90, -45, m) * DEG;
  const k = lerp(1, LONG_LEG / 192, m);
  const flat = 1 - m;
  const [ax, ay] = [Math.cos(th), Math.sin(th)];
  const [nx, ny] = [-Math.sin(th), Math.cos(th)];
  return (along: number, out: number): Pt => [
    cx + k * along * ax + flat * out * nx,
    cy + k * along * ay + flat * out * ny,
  ];
}

/**
 * An arm. Its hub end STAYS ON THE SPINE, sliding from the spine's middle (the
 * hub) to its bottom end (the check's corner) — so the arms never come away from
 * the rune mid-fold. Two cuts got this wrong, both caught by sampling:
 *   · sliding it straight to the corner: the arms floated ~30 units off the
 *     turning spine halfway through.
 *   · sliding it by the ARMS' progress: the arms lead the body, so the hub end
 *     ran the full length of a spine that had not yet turned or shortened, and
 *     the upper arm's tip overshot the check's start by 27 units (y155 against
 *     128) before climbing back.
 * So the slide follows the BODY's progress — where the spine actually is — and
 * the arms' own progress only turns and shortens them. The tips now close above
 * the start and settle onto it.
 */
function armAt(restDeg: number, arms: number, body: number): { tip: Pt; base: Pt } {
  const base = spineAt(body)(-96 * body, 0);
  const deg = lerp(restDeg, 225, arms);
  const len = lerp(80, SHORT_LEG, arms);
  return { base, tip: [base[0] + len * Math.cos(deg * DEG), base[1] + len * Math.sin(deg * DEG)] };
}
const UPPER_ARM_DEG = Math.atan2(-48, -64) / DEG + 360; // 216.87
const LOWER_ARM_DEG = Math.atan2(48, -64) / DEG; // 143.13

/** The body, hub -> lower loop -> spine -> upper loop -> hub, as (along the
 *  spine, out from it) about the spine's centre. */
const BODY_FRAME: Pt[] = [
  [0, 0],
  [-48, 64],
  [-96, 0],
  [96, 0],
  [48, 64],
  [0, 0],
];
function bodyPoints(m: number): Pt[] {
  const at = spineAt(m);
  return BODY_FRAME.map(([along, out]) => at(along, out));
}
const pathOf = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join("");
const bodyAt = (m: number) => pathOf(bodyPoints(m));
const BODY_REST = bodyAt(0);

/** The only writer of every attribute below. Memo'd on a stable prop so React
 *  never re-renders it and never restores a prop over the clock's value. */
const ConfirmArt = memo(function ConfirmArt({ clock }: { clock: MotionValue<number> }) {
  const body = useRef<SVGPathElement>(null);
  const upper = useRef<SVGLineElement>(null);
  const lower = useRef<SVGLineElement>(null);
  const left = useRef<SVGCircleElement>(null);
  const right = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const line = (el: SVGLineElement | null, { tip, base }: { tip: Pt; base: Pt }) => {
      el?.setAttribute("x1", tip[0].toFixed(2));
      el?.setAttribute("y1", tip[1].toFixed(2));
      el?.setAttribute("x2", base[0].toFixed(2));
      el?.setAttribute("y2", base[1].toFixed(2));
    };
    const apply = (u: number) => {
      const { arms, body: fold } = folds(u);
      body.current?.setAttribute("d", bodyAt(fold));
      line(upper.current, armAt(UPPER_ARM_DEG, arms, fold));
      line(lower.current, armAt(LOWER_ARM_DEG, arms, fold));
      // Each dot becomes a cap only once its stroke has arrived under it.
      left.current?.setAttribute("r", (12 - 4 * clamp01((arms - 0.75) / 0.25)).toFixed(2));
      right.current?.setAttribute("cy", lerp(128, CHECK_TIP[1], fold).toFixed(2));
      right.current?.setAttribute("r", (12 - 4 * clamp01((fold - 0.75) / 0.25)).toFixed(2));
    };
    apply(clock.get());
    return clock.on("change", apply);
  }, [clock]);

  return (
    <>
      <path ref={body} d={BODY_REST} />
      <line ref={upper} {...ARM_UP} />
      <line ref={lower} {...ARM_DOWN} />
      <circle ref={left} {...LEFT} {...INK} />
      <circle ref={right} {...RIGHT} {...INK} />
    </>
  );
});

const ConfirmIcon = forwardRef<IconHandle, IconProps>(function ConfirmIcon({ size = 28, style, ...props }, ref) {
  const { reduced } = useHover();
  const clock = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls | null>(null);

  const start = useCallback(() => {
    running.current?.stop();
    clock.set(0);
    running.current = animate(clock, 1, { duration: CONFIRM, ease: "linear" });
  }, [clock]);

  const stop = useCallback(() => {
    running.current?.stop();
    // Still folding in or holding: unfold back. Already unfolding: finish it.
    const home = clock.get() < 0.66 ? 0 : 1;
    running.current = animate(clock, home, { duration: DUR.base, ease: "easeOut" });
  }, [clock]);

  useEffect(() => () => running.current?.stop(), []);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  const bind = { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop };
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        style={{ overflow: "visible" }}
      >
        <g {...STROKE}>
          <ConfirmArt clock={clock} />
        </g>
      </svg>
    </div>
  );
});

/* ══ 7. HANDSHAKE — 3 + 6 ════════════════════════════════════════════════════
   3's shot, and 6's check — joined at the instant they touch. Draw, fire, and
   the moment the shot meets the right dot the collision throws the check open:
   the shot rebounds home to become its start, the right dot is knocked up to
   become its tip, and the rune folds between them. Hold. Unfold.

   CONTACT IS THE TRIGGER, NOT A CATCH. The first cut ran all of 3 first — catch,
   give, wind-up, throw back — and only folded once the shot was home, 2.2s in.
   The check read as an afterthought to a game of catch. Now nothing waits: the
   frame the two dots touch (centres 24 apart, x172 against x196 — the right dot
   still reaches 8 units out to meet it) is the frame the fold begins. Everything
   after contact is the collision's consequence. 1.65s.

   THE COLLISION SENDS EACH DOT TO AN END OF THE CHECK, which is why no throw
   back is needed. The check wants one dot at its start (60,128) and one at its
   tip (204,72). At contact both are on the right — so the shot rebounds left,
   straight back along y128 to the start, and the right dot goes up to the tip.
   Each rides the part of the fold that ends under it: the shot shares the ARMS'
   curve and window, so it lands as the short stroke does and shrinks into its
   cap; the right dot shares the BODY's, so it reaches the tip as the long stroke
   does. No dot is created, removed or moved except by the hit.

   THE FOLD IS ARRIVE, NOT SWEEP. 6 eases in from rest because nothing starts it.
   Here a collision does, so the fold leaves at speed and settles — the landing
   token, and the difference between a check that was knocked open and one that
   began on its own. It also spends the least time in the in-between shapes,
   which are the untidy frames of any morph. The unfold keeps 6's SWEEP: nothing
   hits it.

   ONE CLOCK, ONE WRITER — the whole take. 3 bends the prongs with a rotate
   TRANSFORM; 6 moves the arms' GEOMETRY. Stacked, a prong still carrying a few
   degrees of transform when the fold begins would turn the finished check about
   the old hub. So every track here — shot, catcher, prong bend, both folds — is
   a plain function of one 0..1 clock (motion's `interpolate`, each key naming
   the curve that arrives at it), and the bend is added to the arm's angle
   before the fold is applied, never after.

   LEAVING MID-PASS BLENDS HOME. A second 0..1 value mixes whatever pose the
   clock had reached into the rest pose over DUR.base with the RETURN curve —
   the same glide every variant icon's `normal` gives. Reversing the clock
   instead would replay the collision backwards.

   THE TENSION, stated: for ~0.35s the mark is a check rather than Bluetooth
   (§0 gate 2), and 1.65s is still long for a toolbar. A gallery piece unless
   the hold is cut. */
const HANDSHAKE_MS = 1650;
/** The frame the shot touches the right dot. */
const CONTACT_MS = 460;
/** Shot offset at contact: the right dot has reached to x196; touching is 24 short. */
const TOUCH = SPACING - 8 - 24;
const LINEAR = (t: number) => t;
const shotCurve = cubicBezier(...SHOT);
const arriveCurve = cubicBezier(...ARRIVE);

/** A keyframe track as a function of the clock. Each key is [ms, value, the
 *  curve that arrives at it]. */
function track(...keys: [number, number, EasingFunction?][]) {
  return interpolate(
    keys.map(([ms]) => ms / HANDSHAKE_MS),
    keys.map(([, value]) => value),
    { ease: keys.slice(1).map(([, , curve]) => curve ?? LINEAR) },
  );
}

/** Where each part of the fold runs, in ms. Arms and shot share a window and a
 *  curve, as do body and the right dot, so each dot lands with its stroke. */
const FOLD_ARMS_IN = [CONTACT_MS, 860] as const;
const FOLD_BODY_IN = [CONTACT_MS + 20, 900] as const; // the hit reaches the spine a frame later
const FOLD_BODY_OUT = [1250, 1550] as const;
const FOLD_ARMS_OUT = [1320, 1620] as const;

/** Offsets from each dot's rest centre. */
const HS_SHOT = track(
  [0, 0],
  [240, -22, easeInOut], // draw
  [280, -22], // aim
  [CONTACT_MS, TOUCH, shotCurve], // fly — touches the right dot still moving
  [FOLD_ARMS_IN[1], 0, arriveCurve], // rebound home, landing with the short stroke
  [HANDSHAKE_MS, 0],
);
const HS_CATCHER = track(
  [0, 0],
  [370, 0],
  [CONTACT_MS, -8, easeOut], // reach to meet it
  [FOLD_BODY_IN[0], -8],
  [FOLD_BODY_IN[1], 0, arriveCurve], // knocked back over to x204 as it rises to the tip
  [HANDSHAKE_MS, 0],
);
/** How far each prong bends IN, in degrees: drawn, released, rings, still. */
const HS_PRONG = track(
  [0, 0],
  [240, 6, easeInOut],
  [280, 6],
  [330, -3, easeOut],
  [390, 0, easeInOut],
  [HANDSHAKE_MS, 0],
);
const windowed = (u: number, [from, to]: readonly [number, number], curve: EasingFunction) =>
  curve(clamp01((u * HANDSHAKE_MS - from) / (to - from)));
const HS_FOLDS = (u: number) => ({
  arms: windowed(u, FOLD_ARMS_IN, arriveCurve) - windowed(u, FOLD_ARMS_OUT, travel),
  body: windowed(u, FOLD_BODY_IN, arriveCurve) - windowed(u, FOLD_BODY_OUT, travel),
});

type Arm = { tip: Pt; base: Pt };
type HandshakePose = {
  body: Pt[];
  upper: Arm;
  lower: Arm;
  shot: { cx: number; r: number };
  catcher: { cx: number; cy: number; r: number };
};
function handshakePose(u: number): HandshakePose {
  const { arms, body } = HS_FOLDS(u);
  const bend = HS_PRONG(u);
  return {
    body: bodyPoints(body),
    // The bend is applied to the angle BEFORE the fold: see "one clock" above.
    upper: armAt(UPPER_ARM_DEG - bend, arms, body),
    lower: armAt(LOWER_ARM_DEG + bend, arms, body),
    // Shrink into the caps over the last 12% of each fold, not 6's 25%: under
    // ARRIVE the fold covers ground fast, and at 25% the rebounding shot was
    // visibly shrinking 14 units short of home.
    shot: { cx: LEFT.cx + HS_SHOT(u), r: 12 - 4 * clamp01((arms - 0.88) / 0.12) },
    catcher: {
      cx: RIGHT.cx + HS_CATCHER(u),
      cy: lerp(128, CHECK_TIP[1], body),
      r: 12 - 4 * clamp01((body - 0.88) / 0.12),
    },
  };
}
const HS_REST = handshakePose(0);
const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const mixArm = (a: Arm, b: Arm, t: number): Arm => ({ tip: mixPt(a.tip, b.tip, t), base: mixPt(a.base, b.base, t) });

/** The only writer. `home` 0..1 mixes the clock's pose into rest. */
const HandshakeArt = memo(function HandshakeArt({
  clock,
  home,
}: {
  clock: MotionValue<number>;
  home: MotionValue<number>;
}) {
  const body = useRef<SVGPathElement>(null);
  const upper = useRef<SVGLineElement>(null);
  const lower = useRef<SVGLineElement>(null);
  const shot = useRef<SVGCircleElement>(null);
  const catcher = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const line = (el: SVGLineElement | null, { tip, base }: Arm) => {
      el?.setAttribute("x1", tip[0].toFixed(2));
      el?.setAttribute("y1", tip[1].toFixed(2));
      el?.setAttribute("x2", base[0].toFixed(2));
      el?.setAttribute("y2", base[1].toFixed(2));
    };
    const apply = () => {
      const p = handshakePose(clock.get());
      const t = home.get();
      body.current?.setAttribute("d", pathOf(p.body.map((pt, i) => mixPt(pt, HS_REST.body[i], t))));
      line(upper.current, mixArm(p.upper, HS_REST.upper, t));
      line(lower.current, mixArm(p.lower, HS_REST.lower, t));
      shot.current?.setAttribute("cx", lerp(p.shot.cx, HS_REST.shot.cx, t).toFixed(2));
      shot.current?.setAttribute("r", lerp(p.shot.r, HS_REST.shot.r, t).toFixed(2));
      catcher.current?.setAttribute("cx", lerp(p.catcher.cx, HS_REST.catcher.cx, t).toFixed(2));
      catcher.current?.setAttribute("cy", lerp(p.catcher.cy, HS_REST.catcher.cy, t).toFixed(2));
      catcher.current?.setAttribute("r", lerp(p.catcher.r, HS_REST.catcher.r, t).toFixed(2));
    };
    apply();
    const offClock = clock.on("change", apply);
    const offHome = home.on("change", apply);
    return () => {
      offClock();
      offHome();
    };
  }, [clock, home]);

  return (
    <>
      <path ref={body} d={BODY_REST} />
      <line ref={upper} {...ARM_UP} />
      <line ref={lower} {...ARM_DOWN} />
      {/* Both dots over the rune, the shot over the catcher it lands in. */}
      <circle ref={catcher} {...RIGHT} {...INK} />
      <circle ref={shot} {...LEFT} {...INK} />
    </>
  );
});

const HandshakeIcon = forwardRef<IconHandle, IconProps>(function HandshakeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { reduced } = useHover();
  const clock = useMotionValue(0);
  const home = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls | null>(null);

  const start = useCallback(() => {
    running.current?.stop();
    home.set(0);
    clock.set(0);
    running.current = animate(clock, 1, { duration: HANDSHAKE_MS / 1000, ease: "linear" });
  }, [clock, home]);

  const stop = useCallback(() => {
    running.current?.stop();
    running.current = animate(home, 1, {
      duration: DUR.base,
      ease: RETURN,
      // Once home, park both values on rest so the next hover starts clean.
      onComplete: () => {
        clock.set(0);
        home.set(0);
      },
    });
  }, [clock, home]);

  useEffect(() => () => running.current?.stop(), []);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  const bind = { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop };
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        style={{ overflow: "visible" }}
      >
        <g {...STROKE}>
          <HandshakeArt clock={clock} home={home} />
        </g>
      </svg>
    </div>
  );
});

/* ── rendering ───────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: ReturnType<typeof useHover>["bind"] }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <Rune />
          <circle {...LEFT} {...INK} />
          <circle {...RIGHT} {...INK} />
        </g>
      </svg>
    </div>
  );
}

function Frame({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: ReactNode;
}) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      initial="normal"
      animate={controls}
      style={{ overflow: "visible" }}
    >
      <g {...STROKE}>{children}</g>
    </motion.svg>
  );
}

/** Shared hover/handle wiring; each take supplies only its artwork. */
function makeIcon(name: string, Art: (p: { size: number }) => ReactNode) {
  const Icon = forwardRef<IconHandle, IconProps>(function LabIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Frame size={size} controls={controls}>
          <Art size={size} />
        </Frame>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

const DockIcon = makeIcon("DockIcon", () => (
  <>
    {LOOPS.map((points) => (
      <polygon key={points} points={points} />
    ))}
    <motion.line {...ARM_UP} variants={dockArm(8)} style={HUB} />
    <motion.line {...ARM_DOWN} variants={dockArm(-8)} style={HUB} />
    <motion.rect x={48} y={116} height={24} rx={12} {...INK} variants={PIN_LEFT} />
    {/* Mirrored about x204, so growing width extends the pin to the LEFT. */}
    <g transform="translate(408,0) scale(-1,1)">
      <motion.rect x={192} y={116} height={24} rx={12} {...INK} variants={PIN_RIGHT} />
    </g>
  </>
));

const CradleIcon = makeIcon("CradleIcon", () => (
  <>
    <motion.g variants={cradleRune}>
      <Rune />
    </motion.g>
    <motion.circle {...LEFT} {...INK} variants={cradleLeft} />
    <motion.circle {...RIGHT} {...INK} variants={cradleRight} />
  </>
));

const SlingshotIcon = makeIcon("SlingshotIcon", () => (
  <>
    {LOOPS.map((points) => (
      <polygon key={points} points={points} />
    ))}
    {/* Prongs bend IN toward the pouch: the upper arm turns toward horizontal. */}
    <motion.line {...ARM_UP} variants={slingArm(-6)} style={HUB} />
    <motion.line {...ARM_DOWN} variants={slingArm(6)} style={HUB} />
    <motion.circle {...RIGHT} {...INK} variants={catcher} />
    <motion.circle {...LEFT} {...INK} variants={shot} />
  </>
));

const OrbitIcon = makeIcon("OrbitIcon", () => (
  <>
    <motion.circle {...LEFT} {...INK} variants={ORBIT_BEHIND} style={OWN_CENTRE} />
    <Rune />
    <motion.circle {...RIGHT} {...INK} variants={ORBIT_FRONT} style={OWN_CENTRE} />
  </>
));

const AxleIcon = makeIcon("AxleIcon", ({ size }) => {
  // 16 units of pen, expressed in screen pixels, because non-scaling-stroke
  // measures the stroke in the viewport's space rather than the viewBox's.
  const pen = { strokeWidth: (16 * size) / 256, vectorEffect: "non-scaling-stroke" as const };
  return (
    <>
      <motion.g variants={turn} style={HUB}>
        {LOOPS.map((points) => (
          <polygon key={points} points={points} {...pen} />
        ))}
        <line {...ARM_UP} {...pen} />
        <line {...ARM_DOWN} {...pen} />
      </motion.g>
      <circle {...LEFT} {...INK} />
      <circle {...RIGHT} {...INK} />
    </>
  );
});

const VARIANTS: LabVariant[] = [
  { name: "1 · Dock", blurb: "Dots extend into pins and seat; the arms grip", Component: DockIcon },
  { name: "2 · Cradle", blurb: "Newton's cradle — a strike crosses the rune", Component: CradleIcon },
  { name: "3 · Slingshot", blurb: "Fires through the fork; the other dot catches and throws it back", Component: SlingshotIcon },
  { name: "4 · Orbit", blurb: "The pair swap sides — one behind, one in front", Component: OrbitIcon },
  { name: "5 · Axle", blurb: "The rune turns on the dots; edge-on it is ●━━●", Component: AxleIcon },
  { name: "6 · Confirm", blurb: "The rune folds into a check, dot to dot, and back", Component: ConfirmIcon },
  {
    name: "7 · Handshake",
    blurb: "3 + 6 — the shot touches the other dot and knocks the check open",
    Component: HandshakeIcon,
  },
];

export default function BluetoothConnectedLabPage() {
  // playMs must outlast the LONGEST variant — 6 · Confirm runs 1.7s.
  return <VariantGrid title="Bluetooth Connected" variants={VARIANTS} cycleMs={3800} playMs={1900} />;
}
