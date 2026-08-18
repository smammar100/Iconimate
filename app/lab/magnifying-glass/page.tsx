"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Magnifying-glass icon, 5 animation candidates.
 *
 * NOTHING IS SPLIT. Phosphor's `magnifying-glass` is already two stroked
 * elements — a `<circle>` lens and a `<line>` handle, both `fill="none"
 * stroke-width="16"`. Rest parity is exact by construction (§1) and
 * `pathLength` is native on both (§5). The handle is restated as an equivalent
 * path so it can be morphed; a line and the same two points as a path render
 * identically under matching caps.
 *
 * ══ THE GLYPH IS WELDED, AND EXACTLY SO ══
 *
 * Two facts, both measured to three decimals, and both load-bearing:
 *
 *   1. THE HANDLE STARTS ON THE RIM. Its first point (168.57, 168.57) IS the
 *      lens rim at 45°: 112 + 80/√2 = 168.569. Not near it — on it.
 *   2. THE HANDLE IS A TRUE RADIAL. Extend its axis and the perpendicular
 *      distance to the lens centre (112,112) is **0**. It points straight at
 *      the middle of the lens.
 *
 * Together those mean the handle is not a separate stick placed beside a
 * circle; it is the continuation of a radius. SO IF THE LENS CHANGES SIZE, THE
 * HANDLE MUST SLIDE ALONG ITS OWN AXIS TO STAY ATTACHED. That is the whole
 * design of `2 · Zoom`, and it is the same lesson `envelope` learned the hard
 * way when its crease tips turned out to be welded to the flap's edges: check
 * whether a junction is a junction before animating either side of it.
 *
 * ══ ZOOM BY RADIUS, NOT BY SCALE — THE SAME TRAP `envelope` HIT ══
 *
 * The obvious "magnify" is `scale` on the lens, and it is wrong for the reason
 * FINDING 1 in `envelope` documents: an SVG transform scales the STROKE with
 * the geometry, so a lens scaled to 1.22 draws its rim at 19.5 units instead of
 * 16 and the mark stops matching the rest of the set (§12). Animating the
 * circle's `r` attribute instead moves the rim while the pen stays exactly 16.
 * `envelope` morphs a `d`; this morphs an `r`; the principle is identical.
 *
 * §3 TRAP, PRESENT AS USUAL. The lens is a perfect circle: rotated 25° about
 * its own centre it differs from itself by 0.63% — invisible, `bicycle`'s
 * wheels and `user`'s head again. Nothing here rotates the lens about its
 * centre. `3 · Tilt` rotates the WHOLE mark about the handle's tip, where the
 * lens travels on a long lever and the motion is worth 168% of the ink at 25°.
 *
 * AMPLITUDE (§2), ALL MEASURED: the zoom's rim travels exactly 18 units at its
 * peak (r 80 -> 98), the search's excursion is 21.3, the tilt's furthest ink
 * goes 32 at 8°. The rim figure is the tight one — r 94 gives only 14 units and
 * fails the floor, which is why the peak is 98 and not a rounder number.
 *
 * LANE (§4): ink bbox x[24, 231.5], y[24, 231.5] — 24 on all four sides, the
 * most symmetric lane in this set. Every extreme was checked: the zoom peak is
 * tightest at 6 units of wall (the lens's upper-left, precedent: `house` PEAK
 * ships at 4 and `envelope` SEND at 6), the search keeps 8, the tilt 9.5.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - `scale` ON THE LENS. See above; it breaks the 16-unit pen.
 *   - SPINNING THE LENS about its own centre. Invisible (0.63%); §3.
 *   - A CROSSHAIR, TARGET OR SPARKLE INSIDE THE LENS. The lens is empty and the
 *     temptation is to fill it. §0 gate 1 forbids adding geometry, and a mark
 *     inside the lens is a new object, not an accent — the same call that kept
 *     the letter out of `envelope`. What the lens is FOR is being empty: it is
 *     the thing you look through.
 *   - GROWING THE LENS WITHOUT MOVING THE HANDLE. Tried first, and it tears the
 *     weld: the rim slides out from under the handle's end and leaves a gap on
 *     the radial. The handle's endpoints are recomputed per radius here, which
 *     is why `2 · Zoom` carries three explicit handle poses rather than one.
 *
 * MATERIAL (§9): ground glass in a metal ring — rigid, and optical. So ARRIVE
 * and a small anticipation dip rather than springs; a magnifier that wobbles
 * reads as plastic. The dip in `2 · Zoom` is 3 units against an 18-unit main
 * action — 17%, inside §10's 10–20% anticipation band, and it reads as a lens
 * being pulled back before it is pushed in.
 */

/* ── Geometry ─────────────────────────────────────────────────────────────── */

const LENS = { cx: 112, cy: 112, r: 80 };

/** Handle poses. Each is the 45° radial re-cut for its lens radius, so the
 *  start point always lands exactly on the rim (see the weld note above).
 *  r80 reproduces the authored line exactly: 168.57 -> 224.00. */
const HANDLE_REST = "M168.57,168.57L224,224";
const HANDLE_DIP = "M166.45,166.45L221.88,221.88"; // r 77
const HANDLE_PEAK = "M181.3,181.3L236.73,236.73"; // r 98
const HANDLE_MID = "M177.05,177.05L232.48,232.48"; // r 92 — FIND's smaller peak

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The handle's tip — the point a hand would hold it by. */
const GRIP = AT(224, 224);

const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/* ── 1 · SEARCH ──────────────────────────────────────────────────────────────
   Verb: SEARCHES. The glass sweeps up-left, crosses back down-right, and
   returns to centre — hunting across a surface.

   IT TRAVELS ON AN ARC, NOT A RAIL (§10). The crossing carries a 7-unit lift at
   its midpoint, so the glass bows through the middle of the sweep instead of
   sliding along a straight line. Seven UNITS — not the 10–20 SCREEN PIXELS a
   general UI motion guide would hand you, which is 106 grid units and half this
   artboard (§14).

   Each excursion is 21.3 units, over the floor (§2), and leaves 8 units of wall
   at the far corners. It stops at ±16/±14 rather than a rounder ±20/±18
   because that pose measured only 4 units of clearance — legal, but the whole
   mark is in flight here and there is no reason to spend the margin.

   SWEEP, because this is a travel across the artboard and back (§8). */
const search: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -16, 16, 0],
    y: [0, -14, 14, 0],
    transition: { duration: 1.3, ease: SWEEP, times: [0, 0.28, 0.68, 1] },
  },
};
const searchArc: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -7, 0],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.48, 1] },
  },
};

const GlassSearchIcon = forwardRef<IconHandle, IconProps>(function GlassSearchIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : searchArc}>
          <motion.g variants={reduced ? undefined : search}>
            <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
            <path d={HANDLE_REST} {...STROKE} />
          </motion.g>
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 2 · ZOOM ────────────────────────────────────────────────────────────────
   Verb: MAGNIFIES. The lens draws back a little, then swells, and the handle
   slides down its own axis to stay welded to the rim.

   THE HANDLE MOVING IS NOT A FLOURISH, IT IS THE GEOMETRY. Because the handle
   starts exactly on the rim and points exactly at the lens centre (both
   measured to three decimals in the header), a lens that grows while the handle
   sits still tears the joint open along the radial. Each radius therefore has
   its own handle pose, re-cut at 112 + r/√2 with the length held at 78.39:
       r 77  ->  166.45 .. 221.88
       r 80  ->  168.57 .. 224.00   (the authored line, exactly)
       r 98  ->  181.30 .. 236.73
   Two-point paths, same token count, so motion interpolates them in place.

   IT ANIMATES `r`, NOT `scale`, and that is the difference between magnifying
   and simply drawing a bigger picture: a scale transform takes the 16-unit pen
   with it (up to 19.5 at this amplitude) and the icon stops matching the set
   (§12). Changing the radius moves the rim and leaves the pen alone.

   THE DIP IS ANTICIPATION, MEASURED (§10). Three units back against eighteen
   forward — 17%, inside the 10–20% band. Without it the lens just gets bigger;
   with it, it is pushed. The peak is 98 because 94 moves the rim only 14 units
   and fails the amplitude floor, and 98 still keeps 6 units of wall. */
const ZOOM = 1.0;
const zoomLens: Variants = {
  normal: { r: LENS.r, transition: RETURN_TRANSITION },
  animate: {
    r: [80, 77, 98, 98, 80],
    transition: { duration: ZOOM, ease: ARRIVE, times: [0, 0.18, 0.45, 0.65, 1] },
  },
};
const zoomHandle: Variants = {
  normal: { d: HANDLE_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [HANDLE_REST, HANDLE_DIP, HANDLE_PEAK, HANDLE_PEAK, HANDLE_REST],
    transition: { duration: ZOOM, ease: ARRIVE, times: [0, 0.18, 0.45, 0.65, 1] },
  },
};

const GlassZoomIcon = forwardRef<IconHandle, IconProps>(function GlassZoomIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={LENS.cx}
          cy={LENS.cy}
          r={LENS.r}
          {...STROKE}
          variants={reduced ? undefined : zoomLens}
        />
        <motion.path d={HANDLE_REST} {...STROKE} variants={reduced ? undefined : zoomHandle} />
      </Svg>
    </div>
  );
});

/* ── 3 · TILT ────────────────────────────────────────────────────────────────
   Verb: TURNS. The whole glass rocks about the tip of its handle, the way a
   held magnifier turns in the hand.

   THE PIVOT IS THE POINT OF THE PAGE. The lens is a perfect circle, so rotating
   it about its own centre is invisible — 0.63% at 25°, §3's trap, the one
   `bicycle`'s wheels and `user`'s head both fall into. Rotating the whole mark
   about the HANDLE TIP puts the lens on a 229-unit lever, where the same
   rotation is worth 168% of the ink. Eight degrees moves the furthest ink 32
   units, comfortably over the floor, and keeps 9.5 of wall.

   The rock is asymmetric and decaying — 8° one way, 5.5° back, then home — so
   it reads as a hand adjusting the angle rather than a metronome (§10). */
const tilt: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 8, -5.5, 2.5, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.22, 0.46, 0.68, 1] },
  },
};

const GlassTiltIcon = forwardRef<IconHandle, IconProps>(function GlassTiltIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : tilt} style={GRIP}>
          <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
          <path d={HANDLE_REST} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 4 · DRAW ────────────────────────────────────────────────────────────────
   Verb: DRAWS. The lens draws itself round, and the handle grows out of the rim
   after it.

   Honest here because both elements are natively stroked, so `pathLength` runs
   along a real stroke (§5). THE ORDER IS THE WELD: the handle's first point is
   ON the rim, so drawing lens-first and letting the handle grow outward from
   that point is the mark assembling itself in the order its own geometry
   implies. Draw the handle first and it starts in mid-air with nothing to
   attach to.

   THE BEAT (§11): the lens closes at 0.52 and the handle starts at 0.56. Four
   percent of stillness, the same handoff `blueprint` uses, so the ring is
   visibly complete before anything leaves it.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Both elements are
   round-capped, so `pathLength: 0` parks a full 16-wide DOT — on the circle at
   its 3 o'clock start, on the handle right on the rim, where it reads as a bead
   stuck to the lens. Long strokes, so each opacity gets its own fast tween over
   the first 0.05 of its own draw.

   NOTE — §1 TENSION, FLAGGED. Opens on `pathLength: 0`, so frame 0 is not the
   icon. §1 forbids it; §15B ships it where the subject genuinely is an act of
   drawing. A search UI resolving arguably is; a persistent search button is
   not. Judge at 24px before promoting. */
const DRAW = 1.6;
const drawLens: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: DRAW, times: [0, 0.52], ease: "easeInOut" },
      opacity: { duration: DRAW, times: [0, 0.05], ease: "linear" },
    },
  },
};
const drawHandle: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      pathLength: { duration: DRAW, times: [0, 0.56, 1], ease: ARRIVE },
      opacity: { duration: DRAW, times: [0, 0.56, 0.61], ease: "linear" },
    },
  },
};

const GlassDrawIcon = forwardRef<IconHandle, IconProps>(function GlassDrawIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.circle
          cx={LENS.cx}
          cy={LENS.cy}
          r={LENS.r}
          {...STROKE}
          variants={reduced ? undefined : drawLens}
        />
        <motion.path d={HANDLE_REST} {...STROKE} variants={reduced ? undefined : drawHandle} />
      </Svg>
    </div>
  );
});

/* ── 5 · FIND ────────────────────────────────────────────────────────────────
   The showcase, composing 1 into 2: the glass sweeps across hunting, stops on
   something, and zooms in on it.

   THE STOP IS THE STORY (§11). The sweep lands at 0.40 and the zoom does not
   begin until 0.46 — six percent of stillness, the beat where the glass has
   found the thing and is about to look at it. Overlap them and the zoom reads
   as part of the travel, which is the difference between finding something and
   merely passing over it. §11: separate when one phase hands off to the other.

   THE SWEEP IS ONE-WAY HERE, not the out-and-back of `1 · Search`. Searching is
   a repeated action and returns to where it started; finding ends somewhere. So
   the glass travels up-left, holds, and the zoom happens THERE — then the whole
   thing glides home together, which is the rest-to-rest round trip §1 requires
   without pretending the search was inconclusive.

   THE TWO HALVES COMPETE FOR THE SAME MARGIN, AND THAT IS THE REAL CONSTRAINT
   HERE. Sweeping left spends the left margin; growing the lens spends it again
   from the same edge. With 24 units to give, the offset and the radius growth
   must satisfy roughly `dx + Δr ≤ 24` — so this variant CANNOT have both 1's
   full sweep and 2's full zoom. The first cut tried (-14,-12) with r96 and put
   the lens's left ink at -6, i.e. off the artboard. It looked fine in the tile,
   because a clipped bbox reports as "not clipping" once it is clamped at zero.
   Measured properly, it was a defect.

   The resolution is not to shrink one half but to let them SHARE. The sweep is
   10 and the growth is 12, and because they act on the same edge in the same
   direction they compound: the lens's leftmost ink travels 24 -> 2, a total of
   22 units from rest, which clears the floor (§2) as one motion even though
   neither channel would alone. Two units of wall at the extreme — the tightest
   pose in this lab, and deliberate rather than accidental. */
const FIND = 2.0;
const findBody: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -10, -10, -10, 0],
    y: [0, -9, -9, -9, 0],
    transition: { duration: FIND, ease: SWEEP, times: [0, 0.4, 0.46, 0.82, 1] },
  },
};
const findLens: Variants = {
  normal: { r: LENS.r, transition: RETURN_TRANSITION },
  animate: {
    r: [80, 80, 77, 92, 92, 80],
    transition: { duration: FIND, ease: ARRIVE, times: [0, 0.46, 0.54, 0.68, 0.82, 1] },
  },
};
const findHandle: Variants = {
  normal: { d: HANDLE_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [HANDLE_REST, HANDLE_REST, HANDLE_DIP, HANDLE_MID, HANDLE_MID, HANDLE_REST],
    transition: { duration: FIND, ease: ARRIVE, times: [0, 0.46, 0.54, 0.68, 0.82, 1] },
  },
};

const GlassFindIcon = forwardRef<IconHandle, IconProps>(function GlassFindIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : findBody}>
          <motion.circle
            cx={LENS.cx}
            cy={LENS.cy}
            r={LENS.r}
            {...STROKE}
            variants={reduced ? undefined : findLens}
          />
          <motion.path d={HANDLE_REST} {...STROKE} variants={reduced ? undefined : findHandle} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 6 · HUNT ────────────────────────────────────────────────────────────────
   Verb: HUNTS. The glass loops around a point, leaning into each side of the
   loop as it goes.

   THIS IS MEASURED FROM A REFERENCE RECORDING, NOT INVENTED. An earlier pass at
   this slot guessed a plain circular orbit; the recording was then supplied and
   the guess was wrong in a specific way, so it was replaced rather than kept
   alongside. What the footage actually contains, extracted frame by frame from
   221 frames at 30fps:
       INK COUNT CONSTANT (3738..3771, ratio 1.009) — nothing scales, nothing
         draws. It is a rigid body moving.
       BBOX W/H ANTI-CORRELATE (W 115..139 while H 137..114) — so it is also
         ROTATING, which a pure translation cannot do.
       CENTROID TRACES A FULL CIRCLE, radius 8.2px, while the principal axis
         only oscillates 19.10° (34.94°..54.05°, about a rest of 44.83° — the
         handle's own diagonal).
   Those last two together rule out the obvious reading. Solving for the fixed
   point of the rigid motion frame by frame gives centres scattered from x=-216
   to x=+404: THERE IS NO PIVOT. It is a translation around a loop PLUS a spin
   that oscillates, and the spin is phase-locked to the horizontal swing — it
   leans left when it travels left and right when it travels right.
   Least-squares fit of one cycle: x ±14.50 units, y ±12.21, spin ±8.64°,
   period 0.90s. The keyframes below are that fit, sampled at eighths.
   Do not "tidy" them into a circle; the ellipse and the phase lag are the data.

   SCALED TO 0.85, WHICH IS NOT A LIBERTY BUT A NECESSITY. The reference icon
   sits in a frame with far more air than this glyph has: our ink bbox leaves 24
   units on every side. At full size the fit measured 0.5 units of wall at
   t=0.375, where the upward swing and the spin peak together. At 0.85 the worst
   pose keeps 4 — the clearance `house` PEAK ships with — and the furthest ink
   still travels 21.3 units, over the §2 floor. 0.70 would have been safer and
   drops to 17.5, under it. 0.85 is the only window.

   IT SPINS ABOUT THE INK CENTROID (123.5, 123.5), which is where the recording
   put it: the centroid path and the spin were measured independently, and the
   spin is what remains after the translation is removed. The endpoints are
   snapped to exact zero — the fit's residual at t=0 was 0.16 units and 0.64°,
   invisible but not exactly rest, and §1 wants exactly. */
const HUNT_PIVOT = AT(123.5, 123.5);
/** Fitted from the reference recording, scaled 0.85, endpoints snapped to rest. */
const HUNT = [
  [0, 0, 0],
  [6.71, -5.4, 4.69],
  [6.98, -13.34, 6.96],
  [0.5, -19.12, 4.93],
  [-8.93, -19.34, -0.21],
  [-15.78, -13.89, -5.45],
  [-16.05, -5.94, -7.72],
  [-9.57, -0.17, -5.69],
  [0, 0, 0],
] as const;
const hunt: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: HUNT.map((k) => k[0]),
    y: HUNT.map((k) => k[1]),
    rotate: HUNT.map((k) => k[2]),
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: HUNT.map((_, i) => +(i / 8).toFixed(3)),
    },
  },
};

const GlassHuntIcon = forwardRef<IconHandle, IconProps>(function GlassHuntIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : hunt} style={HUNT_PIVOT}>
          <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
          <path d={HANDLE_REST} {...STROKE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 7 · SWEEP (from the Lottie) ─────────────────────────────────────────────
   Verb: SWEEPS. Three deliberate stops around a short arc — left, up, right —
   with a lean into each, then home.

   TRANSCRIBED FROM `icons8-search.json`, NOT APPROXIMATED. The file is a single
   shape layer with two animated properties and nothing else — no scale, no trim
   paths, no opacity. Read straight out of it:
       ANCHOR   [13.063, 12.813] on a 30x30 board
       POSITION 5 keys: (13.063,13) -> (10.563,12.438) -> (11.75,10.5)
                        -> (14.25,10.688) -> (13.063,13)
       ROTATION 4 keys: 0° -> -10° -> +9° -> 0°
       24fps, 28 frames, so 1.17s with a 3-frame hold at each end.
   The position keys carry Lottie's standard symmetric handles (0.167/0.833);
   the rotation keys carry (0.333,0)/(0.667,1). Both are reproduced below as the
   literal cubic-beziers rather than being rounded to a named easing.

   THE ANCHOR IS THE LENS CENTRE, AND THAT IS WHAT VALIDATES THE MAPPING. In the
   Lottie it is (13.063/30, 12.813/30) = (0.435, 0.427) of the board; our lens
   centre is (112/256, 112/256) = (0.4375, 0.4375). Within half a percent. Two
   files that have never met agree on the pivot, which is how you know 256/30 is
   the right scale factor and not a guess. Displacements convert at x8.533.

   SCALED TO 0.90 FOR THE SAME REASON `6 · Hunt` is scaled to 0.85 — the Lottie
   board gives its icon more air than our 24-unit margins allow. At full size the
   worst pose keeps 2.5 units of wall, tighter than anything in this set ships
   with; at 0.90 it keeps ~4.5 and the furthest ink still travels 21.7, over the
   floor.

   HOW IT DIFFERS FROM 6, WHICH IS WHY BOTH ARE HERE. Hunt is a continuous loop
   fitted from video — it never stops, and its spin follows its travel. Sweep is
   three POSED stops with holds between them, and its rotation leads rather than
   follows: it is already at -10° when it arrives left. One is a camera panning,
   the other is someone pointing at three things in turn. */
const SWEEP_PIVOT = AT(LENS.cx, LENS.cy);
const L = (256 / 30) * 0.9; // Lottie board -> icon units, at 90%
const P0 = { x: 13.063, y: 13 };
const key = (x: number, y: number) => [+((x - P0.x) * L).toFixed(2), +((y - P0.y) * L).toFixed(2)];
const [k1x, k1y] = key(10.563, 12.438);
const [k2x, k2y] = key(11.75, 10.5);
const [k3x, k3y] = key(14.25, 10.688);
/** Lottie's own bezier handles, not rounded to a named easing. */
const LOTTIE_POS: [number, number, number, number] = [0.167, 0.167, 0.833, 0.833];
const LOTTIE_ROT: [number, number, number, number] = [0.333, 0, 0.667, 1];
/** The 3-frame holds at each end of the Lottie are kept: motion runs 0.107..0.893. */
const SWEEP_TIMES = [0, 0.107, 0.321, 0.5, 0.679, 0.893, 1];

const sweepPos: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, k1x, k2x, k3x, 0, 0],
    y: [0, 0, k1y, k2y, k3y, 0, 0],
    transition: { duration: 1.17, ease: LOTTIE_POS, times: SWEEP_TIMES },
  },
};
const sweepRot: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -9, -0.45, 8.1, 0, 0],
    transition: { duration: 1.17, ease: LOTTIE_ROT, times: SWEEP_TIMES },
  },
};

const GlassSweepIcon = forwardRef<IconHandle, IconProps>(function GlassSweepIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : sweepPos}>
          <motion.g variants={reduced ? undefined : sweepRot} style={SWEEP_PIVOT}>
            <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} {...STROKE} />
            <path d={HANDLE_REST} {...STROKE} />
          </motion.g>
        </motion.g>
      </Svg>
    </div>
  );
});

export default function MagnifyingGlassLab() {
  return (
    <VariantGrid
      title="Magnifying glass"
      cycleMs={4600}
      playMs={3000}
      variants={[
        {
          name: "1 · Search",
          blurb: "Sweeps up-left, crosses back, and returns — hunting.",
          Component: GlassSearchIcon,
        },
        {
          name: "2 · Zoom",
          blurb: "The lens swells; the handle slides to stay on the rim.",
          Component: GlassZoomIcon,
        },
        {
          name: "3 · Tilt",
          blurb: "Rocks about the handle's tip, the way a hand turns it.",
          Component: GlassTiltIcon,
        },
        {
          name: "4 · Draw",
          blurb: "The lens draws round, then the handle grows out of it.",
          Component: GlassDrawIcon,
        },
        {
          name: "5 · Find",
          blurb: "Sweeps, stops on something, and zooms in. The showcase.",
          Component: GlassFindIcon,
        },
        {
          name: "6 · Hunt",
          blurb: "Loops a point, leaning into each side. Fitted from the video.",
          Component: GlassHuntIcon,
        },
        {
          name: "7 · Sweep",
          blurb: "Three posed stops with a lean. Transcribed from the Lottie.",
          Component: GlassSweepIcon,
        },
      ]}
    />
  );
}
