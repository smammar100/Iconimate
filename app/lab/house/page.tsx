"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — House icon, 5 animation candidates.
 *
 * THIS MARK IS STROKED, NOT FILLED. Phosphor's `house` is one closed
 * `fill="none" stroke="currentColor" stroke-width="16"` loop, traced
 * door -> right wall -> roof -> left wall -> back to the door. That single
 * fact decides most of what follows: `pathLength` is native here (no faked
 * clips, cf. blueprint), and the door is already IN the mark, so nothing has
 * to be invented to have something to move (MOTION.md §0 gate 1).
 *
 * THE DECOMPOSITION IS MEASURED, NOT EYEBALLED. The loop is cut into three
 * open strokes that share endpoints:
 *   ROOF  — right eave -> apex -> left eave.
 *   WALLS — the two side walls, each traced ground->up so a draw builds upward.
 *   DOOR  — the doorway U, from the left jamb round to the right jamb.
 * Cutting a closed path turns two round JOINS into four round CAPS at
 * (104,216) and (152,216). Those were the failure to check, and they are
 * benign: at a 90° corner the two opposed caps reconstruct the join's disc.
 * Rasterised at 512x512, counting only pixels that flip ink/no-ink:
 *   ROOF + WALLS + DOOR  vs  the original `d`  =  6 / 47,556  =  0.013%.
 * That is antialiasing on the seam, an order of magnitude under the 0.1%
 * ship threshold (§1). Do not re-derive this by eye.
 *
 * THE LANE IS GENEROUS, WHICH IS UNUSUAL HERE (§4). Ink bbox is
 * x[32, 223.5], y[24, 223.5] — 32 units left, 32.5 right, 24 top, 32.5
 * bottom. Every gesture below stays inside the 256 box at its extreme, so all
 * five keep `overflow: hidden` and none needs the wrapper opened:
 *   PEAK raises the apex to y4 (worst case, still 4 units clear).
 *   NOD  swings min-x to ~22.5 and max-y to ~233.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - LIFTING THE ROOF OFF THE WALLS ("shelter"). The roof and walls are one
 *     continuous stroke; translating the roof tears the mark open at both
 *     eaves, and a still frame 60% through reads as a broken house, not a
 *     house (§0 gate 2). PEAK below is what survives that idea: the eaves stay
 *     pinned and only the apex moves, so the silhouette never comes apart.
 *   - SCALING THE HOUSE TALLER to raise the roof without a tear. Non-uniform
 *     scale on a rigid mark is stretch, and rigid things do not squash (§9);
 *     it also distorts the 16-unit stroke on the diagonal slopes by ~9%.
 *   - A SQUASH-INTO-THE-FOUNDATION settle, for the same §9 reason. A house is
 *     masonry. The barn lab gets away with it; this glyph should not.
 *
 * MATERIAL (§9): masonry and timber — rigid. So ARRIVE and easeInOut, no
 * springs, overshoot at 0–5%. Nothing here squashes and nothing bounces.
 */

/* ── Geometry ────────────────────────────────────────────────────────────── */

/** Right eave -> apex -> left eave. The endpoints are the eaves; they never move. */
const ROOF =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120";

/** PEAK's target: the same roof with the apex 20 units higher. Only the two
 *  slope lengths change (80 -> 100); the eave endpoints are literal and stay
 *  put, so the roof steepens instead of lifting. Identical token count to
 *  ROOF, which is what lets motion interpolate the `d` string at all. */
const ROOF_PEAK =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-100a8,8,0,0,0-11.32,0l-80,100A8,8,0,0,0,40,120";

/** Both side walls, each traced ground->eave so a `pathLength` draw rises. */
const WALLS = "M104,216h-64V120M152,216h64V120";

/** The doorway: left jamb, header, right jamb. */
const DOOR = "M104,216V152h48v64";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The hinge: the door's left jamb where it meets the ground line. */
const HINGE = AT(104, 216);
/** The whole house pivots on its ground line, never on its centre. */
const GROUND = AT(128, 216);

/** Shared wrapper style — `overflow: hidden` throughout; see the lane note. */
const BOX = { display: "inline-flex", overflow: "hidden" } as const;

/* ── 1 · OPEN ────────────────────────────────────────────────────────────────
   Verb: OPENS. The door swings in on its hinge, holds the invitation open,
   then swings shut. The door is the one part the glyph already gives us, so
   it is the only part that moves — everything else is dead still.

   scaleX about the left jamb is the foreshortening of a panel swinging away
   from the viewer; it is the same idiom the barn lab uses for its slider. The
   far stile travels 152 -> 109.8 = 42 units (4.0px at 24px), well over the
   18-unit floor (§2). easeInOut because the door moves while on screen and
   never accelerates out of frame (§8); no overshoot, because a door on a
   hinge does not spring past its stop (§9). */
const openDoor: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.3, 0.62, 1] },
  },
};

const HouseOpenIcon = forwardRef<IconHandle, IconProps>(function HouseOpenIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <path d={ROOF} {...STROKE} />
        <path d={WALLS} {...STROKE} />
        <motion.path d={DOOR} {...STROKE} variants={reduced ? undefined : openDoor} style={HINGE} />
      </Svg>
    </div>
  );
});

/* ── 2 · PEAK ────────────────────────────────────────────────────────────────
   Verb: SHELTERS. The roof draws itself up to a steeper pitch and settles
   back down over the walls.

   This is the survivor of the "lift the roof" idea (see the rejected list in
   the header). The eave endpoints are literal coordinates in both `d`
   strings, so they are mathematically pinned: the roof cannot detach, and no
   frame of this shows a torn house. Only the apex moves, 20 units (1.9px at
   24px) — just over the floor (§2) — and the raised apex still lands 4 units
   inside the top wall.

   It animates the `d` string rather than a scaleY about the eave line because
   a non-uniform scale would distort the 16-unit stroke on the diagonal
   slopes; morphing the path keeps the pen weight exact (§12). ARRIVE, because
   the roof is settling into a position rather than travelling. */
const peakRoof: Variants = {
  normal: { d: ROOF, transition: RETURN_TRANSITION },
  animate: {
    d: [ROOF, ROOF_PEAK, ROOF],
    transition: { duration: 0.9, ease: ARRIVE, times: [0, 0.45, 1] },
  },
};

const HousePeakIcon = forwardRef<IconHandle, IconProps>(function HousePeakIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ROOF} {...STROKE} variants={reduced ? undefined : peakRoof} />
        <path d={WALLS} {...STROKE} />
        <path d={DOOR} {...STROKE} />
      </Svg>
    </div>
  );
});

/* ── 3 · BUILD ───────────────────────────────────────────────────────────────
   Verb: BUILDS. The walls and doorway rise out of the ground, hold for a
   beat, and then the roof goes on across the top.

   Honest here and only here: every element is already stroked, so
   `pathLength` is native and no clip-faking is involved (§5, blueprint). Both
   wall subpaths are authored ground->eave so the draw genuinely rises rather
   than dropping from the eaves.

   THE BEAT IS THE WHOLE POINT (§11). The walls land at 0.50 and the roof does
   not start until 0.54. Without that 4% of stillness the roof arrives at a
   house still being built and the two phases read as one smear. Same handoff
   blueprint uses, same reason.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Every stroke here
   is round-capped, and a round-capped stroke at `pathLength: 0` renders a
   full 16-wide DOT parked on its start point — without these you get blobs
   sitting on the artboard through the hold. These are LONG strokes, so each
   opacity gets its own fast tween over the first 0.05 of its own draw; fading
   across the full draw would hold finished walls semi-transparent.

   NOTE — §1 TENSION, FLAGGED DELIBERATELY. This opens on `pathLength: 0`, so
   frame 0 is not the icon. That is the one thing §1 forbids and §15B
   nonetheless ships (blueprint, the arrow-bend-* family) for marks whose
   subject genuinely is an act of drawing. A house being built is arguably
   that; a Home button in a toolbar arguably is not. Judge it at 24px before
   promoting — this is the candidate most likely to fail the standing test. */
const BUILD = 1.9;
const buildBase: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: BUILD, times: [0, 0.5], ease: "easeInOut" },
      opacity: { duration: BUILD, times: [0, 0.05], ease: "linear" },
    },
  },
};
const buildRoof: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      pathLength: { duration: BUILD, times: [0, 0.54, 1], ease: "easeInOut" },
      opacity: { duration: BUILD, times: [0, 0.54, 0.59], ease: "linear" },
    },
  },
};

const HouseBuildIcon = forwardRef<IconHandle, IconProps>(function HouseBuildIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ROOF} {...STROKE} variants={reduced ? undefined : buildRoof} />
        <motion.path d={WALLS} {...STROKE} variants={reduced ? undefined : buildBase} />
        <motion.path d={DOOR} {...STROKE} variants={reduced ? undefined : buildBase} />
      </Svg>
    </div>
  );
});

/* ── 4 · NOD ─────────────────────────────────────────────────────────────────
   Verb: WELCOMES. The door opens and the house tips into a small nod toward
   you, then rights itself as the door closes.

   The tilt pivots on the GROUND LINE, not the centre — a building rotating
   about its middle reads as floating. 6° puts the apex through 19.3 units
   (1.8px), just over the floor (§2); at 5° it is 16 units and invisible,
   which is why it is not smaller. The lean and the door are deliberately
   overlapped rather than sequenced: the nod is *caused* by the door opening,
   and §11 says overlap when one phase causes the other.

   FLAGGED: a tilting building is the one gesture here that risks reading as
   subsidence rather than a greeting, especially in someone else's product
   (standing test #4). It is in the lab precisely so that call gets made with
   eyes on it at 24px, not in the abstract. */
const NOD = 1.2;
const nodHouse: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -6, -6, 0],
    transition: { duration: NOD, ease: ARRIVE, times: [0, 0.3, 0.6, 1] },
  },
};
const nodDoor: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: NOD, ease: "easeInOut", times: [0, 0.28, 0.62, 1] },
  },
};

const HouseNodIcon = forwardRef<IconHandle, IconProps>(function HouseNodIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : nodHouse} style={GROUND}>
          <path d={ROOF} {...STROKE} />
          <path d={WALLS} {...STROKE} />
          <motion.path d={DOOR} {...STROKE} variants={reduced ? undefined : nodDoor} style={HINGE} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 5 · MOVING IN ───────────────────────────────────────────────────────────
   The showcase, escalating 3 -> 1: the house builds itself from the ground
   up, the roof goes on, and then — once it is a house — it opens its door.

   The order is the argument. Building and then opening says the place is
   finished and now occupied; opening a door on a half-built wall says
   nothing. The door therefore does not begin swinging until 0.60, comfortably
   after the roof lands at 0.52, and it holds open through the tail so the
   pass ends on the welcome rather than on the construction.

   Same round-cap dot remedy as 3, same §1 caveat as 3 — it inherits both. */
const MOVE = 2.6;
const moveBase: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1, 1],
    opacity: [0, 1, 1],
    transition: {
      pathLength: { duration: MOVE, times: [0, 0.34, 1], ease: "easeInOut" },
      opacity: { duration: MOVE, times: [0, 0.04, 1], ease: "linear" },
    },
  },
};
const moveRoof: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1, 1],
    opacity: [0, 0, 1, 1],
    transition: {
      pathLength: { duration: MOVE, times: [0, 0.38, 0.52, 1], ease: "easeInOut" },
      opacity: { duration: MOVE, times: [0, 0.38, 0.42, 1], ease: "linear" },
    },
  },
};
const moveDoor: Variants = {
  normal: { pathLength: 1, opacity: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1, 1, 1],
    opacity: [0, 1, 1, 1],
    scaleX: [1, 1, 0.12, 0.12],
    transition: {
      pathLength: { duration: MOVE, times: [0, 0.34, 0.6, 1], ease: "easeInOut" },
      opacity: { duration: MOVE, times: [0, 0.04, 0.6, 1], ease: "linear" },
      scaleX: { duration: MOVE, times: [0, 0.6, 0.76, 1], ease: "easeInOut" },
    },
  },
};

const HouseMovingInIcon = forwardRef<IconHandle, IconProps>(function HouseMovingInIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ROOF} {...STROKE} variants={reduced ? undefined : moveRoof} />
        <motion.path d={WALLS} {...STROKE} variants={reduced ? undefined : moveBase} />
        <motion.path d={DOOR} {...STROKE} variants={reduced ? undefined : moveDoor} style={HINGE} />
      </Svg>
    </div>
  );
});

/* ── 6 · WELCOME ─────────────────────────────────────────────────────────────
   1 + 2 in one breath. Verb: WELCOMES. The roof draws up to its steeper pitch
   while the door swings in behind it, both hold open together, and both come
   home on the same beat.

   THE LAG IS THE COMPOSITION, AND IT IS THE ONLY REAL DECISION HERE. The roof
   peaks at 0.30 and the door reaches fully open at 0.40 — a 0.10 trail, the
   top of the follow-through range in §10. Run them on identical keyframes and
   the two parts read as one rigid object being scaled; give the door its lag
   and the house reads as drawing itself up first and opening second, which is
   the order a welcome actually happens in.

   NOT a §11 handoff, deliberately. BUILD (3) separates its phases with a beat
   of stillness because the roof needs a finished wall to land on. Nothing here
   waits on anything: the roof rising and the door opening are two expressions
   of one gesture, so they overlap and share a single return. Sequencing them
   would stretch one welcome into two events.

   Inherits both parents' guarantees: the eaves stay pinned so the mark never
   tears, and the door's far stile still clears the 18-unit floor by 42. The
   apex reaches y4 and the swing stays inside the box, so `overflow: hidden`
   holds and nothing paints outside at rest. */
const WELCOME = 1.4;
const welcomeRoof: Variants = {
  normal: { d: ROOF, transition: RETURN_TRANSITION },
  animate: {
    d: [ROOF, ROOF_PEAK, ROOF_PEAK, ROOF],
    transition: { duration: WELCOME, ease: ARRIVE, times: [0, 0.3, 0.6, 1] },
  },
};
const welcomeDoor: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: WELCOME, ease: "easeInOut", times: [0, 0.4, 0.6, 1] },
  },
};

const HouseWelcomeIcon = forwardRef<IconHandle, IconProps>(function HouseWelcomeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ROOF} {...STROKE} variants={reduced ? undefined : welcomeRoof} />
        <path d={WALLS} {...STROKE} />
        <motion.path
          d={DOOR}
          {...STROKE}
          variants={reduced ? undefined : welcomeDoor}
          style={HINGE}
        />
      </Svg>
    </div>
  );
});

export default function HouseLab() {
  return (
    <VariantGrid
      title="House"
      cycleMs={4200}
      playMs={2800}
      variants={[
        {
          name: "1 · Open",
          blurb: "The door swings in, holds the invitation, swings shut.",
          Component: HouseOpenIcon,
        },
        {
          name: "2 · Peak",
          blurb: "The roof draws up to a steeper pitch; the eaves stay pinned.",
          Component: HousePeakIcon,
        },
        {
          name: "3 · Build",
          blurb: "Walls rise from the ground, a beat, then the roof goes on.",
          Component: HouseBuildIcon,
        },
        {
          name: "4 · Nod",
          blurb: "The door opens as the house tips a small welcome.",
          Component: HouseNodIcon,
        },
        {
          name: "5 · Moving in",
          blurb: "It builds itself, then opens its door. The showcase.",
          Component: HouseMovingInIcon,
        },
        {
          name: "6 · Welcome",
          blurb: "1 + 2 in one breath: the roof draws up as the door swings in.",
          Component: HouseWelcomeIcon,
        },
      ]}
    />
  );
}
