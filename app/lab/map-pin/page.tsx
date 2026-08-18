"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Map-pin icon, 5 animation candidates.
 *
 * NOTHING IS SPLIT. Phosphor's `map-pin` is already two stroked elements — the
 * teardrop body and the inner `<circle>` — both `fill="none" stroke-width="16"`.
 * Rest parity is exact by construction (§1) and `pathLength` is native on both.
 *
 * ══ THE LANE IS THE OPPOSITE SHAPE FROM THE GESTURE THIS ICON WANTS ══
 *
 * Ink bbox is x[40, 215.5], y[16, 239.5]:
 *     left 40 · right 40.5 · TOP 16 · BOTTOM 16.5
 * Forty units of horizontal room and sixteen of vertical. And the one gesture
 * every map pin wants is a DROP, which is vertical. Measured: lifting the mark
 * 28 units clips the top outright — ink falls from 46,076 to 43,346 — so the
 * §2 amplitude floor of 18 cannot be cleared upward inside the box at all.
 *
 * `1 · Drop` therefore opens its wrapper (`overflow: visible`), which §4 lists
 * as the second legitimate outcome and which `star`'s rays and
 * `airplane-taxiing` already ship. It is the only variant here that does; the
 * other four stay inside. Nothing paints outside the box AT REST in any of
 * them, which is the condition §4 attaches to that trade.
 *
 * THE TIP IS THE ANCHOR, AND IT IS EXACT. The body path ends its first curve at
 * (128, 232) — the point that touches the map. Every rotation here pivots
 * there, because a pin planted in a surface turns about its point and nowhere
 * else. It also gives enormous leverage: the crown of the pin sits 216 units
 * from the tip, so 5° already moves the furthest ink 18.8 units. Like `phone`,
 * this glyph's danger is overshooting, not under-reading.
 *
 * §3 TRAPS, TWO OF THEM:
 *   - THE INNER DOT IS A PERFECT CIRCLE. Rotating it about its own centre is
 *     invisible. Nothing here does. `2 · Ping` changes its RADIUS instead,
 *     which moves the rim while leaving the 16-unit pen alone — the same
 *     distinction `envelope` documents for its flap and `magnifying-glass` for
 *     its lens. A `scale` transform would drag the stroke to 25 units.
 *   - THE WHOLE MARK IS MIRROR-SYMMETRIC about x128, measured at 0.204%. So
 *     `scaleX: -1` is the identity transform here, exactly as in `envelope`.
 *     Flipping it costs a transform and renders nothing.
 *
 * THE DOT HAS ROOM, WHICH IS NOT OBVIOUS BY EYE. Grown to r62 its ink still
 * shares ZERO pixels with the body — the teardrop's interior is wider than it
 * looks. r50 (the ping's peak, exactly the 18-unit floor) is comfortable.
 *
 * REJECTED — recorded so the next author does not spend a day on it (§17):
 *   - A PIN THAT FALLS IN FROM ABOVE, starting off-canvas. It is the canonical
 *     map-pin animation and it violates §1 outright: frame 0 would not be the
 *     icon, it would be an empty box. `1 · Drop` inverts it into a
 *     rest→anticipate→plant→settle round trip, which reads as the pin being
 *     planted rather than arriving from nowhere.
 *   - `scale` ON THE DOT. Breaks the 16-unit pen (§12); animate `r`.
 *   - FLIPPING THE MARK horizontally. Identity transform; see above.
 *   - A SHADOW OR GROUND-SPOT under the tip to sell the landing. There is no
 *     shadow vocabulary in this set — `currentColor` only (§12) — and a ground
 *     ellipse is a new object, the same call that kept the letter out of
 *     `envelope`.
 *
 * MATERIAL (§9): a rigid marker driven into a surface. ARRIVE, no squash, and
 * overshoot only as the impact settle on `1 · Drop`. A pin that squashes reads
 * as rubber.
 */

/* ── Geometry — the glyph's own two elements, untouched ───────────────────── */

const BODY = "M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z";
const DOT = { cx: 128, cy: 104, r: 32 };

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The point that touches the map. Every rotation here turns about it. */
const TIP = AT(128, 232);

const BOX = { display: "inline-flex", overflow: "hidden" } as const;
/** Only `1 · Drop` opens the box — see the lane note in the header. */
const OPEN_BOX = { display: "inline-flex", overflow: "visible" } as const;

const Pin = () => (
  <>
    <path d={BODY} {...STROKE} />
    <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} {...STROKE} />
  </>
);

/* ── 1 · DROP ────────────────────────────────────────────────────────────────
   Verb: PLANTS. The pin rears back, drives down onto its point, and settles.

   THE ORDER IS INVERTED FROM THE OBVIOUS ONE, DELIBERATELY. The canonical map-
   pin animation drops the pin in from off-canvas, and §1 forbids it: frame 0
   would be an empty box rather than the icon. So the wind-up carries the
   height instead — 26 units up (§10 anticipation, and the main action's own
   amplitude), then down through rest to 4 units past it, then home. The pin
   ends where it started and still reads as being planted.

   THIS IS THE ONE VARIANT THAT OPENS ITS WRAPPER. The top margin is 16 units
   and the floor is 18, so the wind-up cannot fit inside the box — measured, not
   assumed: a 28-unit lift loses 2,730 pixels of ink to the wall. At 26 the
   crown sits 10 units above the box, visible only while playing, and the trade
   is exactly the one §4 sanctions and `star` and `airplane-taxiing` already
   make. At rest nothing is outside.

   The 4-unit dip past rest is the impact, not a bounce — a rigid marker driven
   into a surface stops (§9). ARRIVE on the way down, so the weight is at the
   end of the fall rather than the start. */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, 4, 0],
    transition: { duration: 0.85, ease: ARRIVE, times: [0, 0.34, 0.66, 1] },
  },
};

const PinDropIcon = forwardRef<IconHandle, IconProps>(function PinDropIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...OPEN_BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : drop}>
          <Pin />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 2 · PING ────────────────────────────────────────────────────────────────
   Verb: LOCATES. The inner dot draws back and swells twice, the second beat
   weaker — a position being acquired.

   IT ANIMATES `r`, NOT `scale`, AND THAT IS THE WHOLE IMPLEMENTATION. A scale
   transform takes the 16-unit pen with it: at the amplitude used here the dot's
   stroke would render at 25 units and stop matching the set (§12). Changing the
   radius moves the rim and leaves the pen exactly 16. Same distinction
   `envelope` documents for its flap and `magnifying-glass` for its lens; this
   is the third mark in the set where it decides the approach.

   32 -> 50 IS EXACTLY THE §2 FLOOR — the rim travels 18 units — and it fits
   with room to spare: measured, the dot's ink shares ZERO pixels with the body
   even at r62, because the teardrop's interior is wider than it looks. The dip
   to r29 first is anticipation at 3 units against 18, i.e. 17%, inside §10's
   10–20% band.

   THE SECOND BEAT IS WEAKER (r45 against r50) and the gap before it is shorter
   than the rest that follows — §10's decaying-repeat rule, the one `heart`'s
   lub-dub exists to demonstrate. Two equal pings read as a notification badge
   throbbing rather than a fix being taken. */
const ping: Variants = {
  normal: { r: DOT.r, transition: RETURN_TRANSITION },
  animate: {
    r: [32, 29, 50, 34, 45, 32],
    transition: {
      duration: 1.1,
      ease: ARRIVE,
      times: [0, 0.12, 0.34, 0.52, 0.68, 1],
    },
  },
};

const PinPingIcon = forwardRef<IconHandle, IconProps>(function PinPingIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <path d={BODY} {...STROKE} />
        <motion.circle
          cx={DOT.cx}
          cy={DOT.cy}
          r={DOT.r}
          {...STROKE}
          variants={reduced ? undefined : ping}
        />
      </Svg>
    </div>
  );
});

/* ── 3 · SWING ───────────────────────────────────────────────────────────────
   Verb: SETTLES. The pin rocks about its point and comes to rest — a marker
   planted and released.

   THE LEVERAGE HERE IS THE DESIGN PROBLEM, NOT THE AMPLITUDE. The crown sits
   216 units from the tip, so every degree is worth 3.77 units of travel and the
   §2 floor is cleared at 4.8°. Seven degrees moves the furthest ink 26.4 units
   and keeps 16.5 of wall; fourteen would still fit (9.5 of wall) and would look
   like the pin falling over. This is `phone`'s problem — restraint, not
   legibility — and the angles are single digits for the same reason.

   Decaying and asymmetric: 7° one way, 5° back, 2.5°, home (§10). A pin
   released in soil oscillates and damps; it does not tick. easeInOut, because
   the mark reverses direction repeatedly rather than settling into any one
   pose (§8), and the decay does the settling. */
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 7, -5, 2.5, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.44, 0.68, 1] },
  },
};

const PinSwingIcon = forwardRef<IconHandle, IconProps>(function PinSwingIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : swing} style={TIP}>
          <Pin />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 4 · DRAW ────────────────────────────────────────────────────────────────
   Verb: MARKS. The teardrop draws itself, and the dot lands inside it after.

   Honest here because both elements are natively stroked, so `pathLength` runs
   along a real stroke (§5). The order is the object: the pin is the container
   and the dot is what it marks, so the outline arrives first and the fix lands
   in it. Reverse them and a dot floats in space waiting for a pin.

   THE BEAT (§11): the body closes at 0.56 and the dot starts at 0.60. Four
   percent of stillness, the handoff `blueprint` uses, so the outline is visibly
   complete before anything appears inside it.

   THE OPACITY TWEENS ARE LOAD-BEARING, NOT DECORATION (§5). Both elements are
   round-capped, so `pathLength: 0` parks a full 16-wide DOT at each start
   point — and the body's start is at (208,104), out on the pin's right
   shoulder, where a stray bead is especially obvious. Long strokes, so each
   opacity gets its own fast tween over the first 0.05 of its own draw.

   NOTE — §1 TENSION, FLAGGED. Opens on `pathLength: 0`, so frame 0 is not the
   icon. §1 forbids it; §15B ships it where the subject genuinely is an act of
   drawing. Marking a location arguably is; a persistent map marker is not. */
const MARK = 1.6;
const drawBody: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: MARK, times: [0, 0.56], ease: "easeInOut" },
      opacity: { duration: MARK, times: [0, 0.05], ease: "linear" },
    },
  },
};
const drawDot: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      pathLength: { duration: MARK, times: [0, 0.6, 1], ease: ARRIVE },
      opacity: { duration: MARK, times: [0, 0.6, 0.65], ease: "linear" },
    },
  },
};

const PinDrawIcon = forwardRef<IconHandle, IconProps>(function PinDrawIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={BODY} {...STROKE} variants={reduced ? undefined : drawBody} />
        <motion.circle
          cx={DOT.cx}
          cy={DOT.cy}
          r={DOT.r}
          {...STROKE}
          variants={reduced ? undefined : drawDot}
        />
      </Svg>
    </div>
  );
});

/* ── 5 · FIX ─────────────────────────────────────────────────────────────────
   The showcase, composing 1 into 2: the pin is planted, and once it is down it
   takes a fix.

   THE BEAT IS THE STORY (§11). The pin settles at 0.44 and the ping does not
   begin until 0.50. Six percent of stillness — the pin is in the ground and
   nothing is happening yet — and it is what makes this two events instead of
   one blur. Planting does not CAUSE the fix; it hands off to it, and §11 says
   separate when that is the relationship.

   THE PING IS SINGLE HERE, not 2's double, and smaller (r46 against r50). It is
   riding a gesture that has already spent the viewer's attention, and a second
   full-strength beat at the tail reads as fussy on the fiftieth hover. The
   plant still owns the amplitude at 26 units; the ping is the punctuation.

   It inherits `1 · Drop`'s open wrapper for the same measured reason. */
const FIX = 1.7;
const fixBody: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, 4, 0, 0],
    transition: { duration: FIX, ease: ARRIVE, times: [0, 0.17, 0.33, 0.44, 1] },
  },
};
const fixDot: Variants = {
  normal: { r: DOT.r, transition: RETURN_TRANSITION },
  animate: {
    r: [32, 32, 30, 46, 32],
    transition: { duration: FIX, ease: ARRIVE, times: [0, 0.5, 0.58, 0.76, 1] },
  },
};

const PinFixIcon = forwardRef<IconHandle, IconProps>(function PinFixIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...OPEN_BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : fixBody}>
          <path d={BODY} {...STROKE} />
          <motion.circle
            cx={DOT.cx}
            cy={DOT.cy}
            r={DOT.r}
            {...STROKE}
            variants={reduced ? undefined : fixDot}
          />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 6 · PLANT ───────────────────────────────────────────────────────────────
   1 and 3 in one gesture. Verb: PLANTS. The pin rears back, drives down onto
   its point, and the impact throws it into a rock that damps out.

   THIS ONE OVERLAPS INSTEAD OF HANDING OFF, AND THAT IS THE WHOLE DISTINCTION.
   Every other showcase on these pages (`envelope`'s Dispatch, `phone`'s Call,
   this page's `5 · Fix`) puts a beat of stillness between its two halves,
   because one phase HANDS OFF to the other. Here the impact CAUSES the rock —
   drive something into the ground and it wobbles — and §11 is explicit that
   causation is the case where you overlap rather than separate. So the rotation
   starts at 0.56, four percent AFTER the body's impact at 0.42 lands, close
   enough to read as a consequence of it rather than a second event.

   THE ROTATION ALSO LEADS, WHICH 3 ALONE COULD NOT DO. During the wind-up the
   pin tilts -3° — it rears BACK before it comes down, the same anticipation the
   vertical channel is already doing, applied to the axis that will carry the
   follow-through. That small counter-tilt is what makes the +6° after impact
   read as a whip rather than a nudge. Neither variant has it on its own: 1 has
   no rotation and 3 has no impact to anticipate.

   AMPLITUDES, BOTH MEASURED. The drop travels 26 units and the rock's crown
   22.6 (6° on a 216-unit lever) — both over the §2 floor independently, which
   is why this reads as two gestures rather than one with a decoration. The rock
   is shallower than 3's 7° because it is riding a primary that has already
   spent the amplitude; side clearance at +6° is 27 units, at -4° it is 31.

   It inherits 1's open wrapper for 1's measured reason: the crown reaches 10
   units above the box at the top of the wind-up, and the top margin is 16
   against a floor of 18. Nothing is outside at rest. */
const PLANT = 1.4;
const plant: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, 4, 0, 0],
    rotate: [0, -3, 0, 6, -4, 2, 0],
    transition: {
      y: { duration: PLANT, ease: ARRIVE, times: [0, 0.22, 0.42, 0.52, 1] },
      rotate: {
        duration: PLANT,
        ease: "easeInOut",
        times: [0, 0.22, 0.4, 0.56, 0.72, 0.86, 1],
      },
    },
  },
};

const PinPlantIcon = forwardRef<IconHandle, IconProps>(function PinPlantIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ ...OPEN_BOX, ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : plant} style={TIP}>
          <Pin />
        </motion.g>
      </Svg>
    </div>
  );
});

export default function MapPinLab() {
  return (
    <VariantGrid
      title="Map pin"
      cycleMs={4400}
      playMs={2800}
      variants={[
        {
          name: "1 · Drop",
          blurb: "Rears back, drives onto its point, settles. Opens the box.",
          Component: PinDropIcon,
        },
        {
          name: "2 · Ping",
          blurb: "The dot swells twice, the second weaker — taking a fix.",
          Component: PinPingIcon,
        },
        {
          name: "3 · Swing",
          blurb: "Rocks about its tip and damps out, like a planted marker.",
          Component: PinSwingIcon,
        },
        {
          name: "4 · Draw",
          blurb: "The teardrop draws, a beat, then the dot lands inside.",
          Component: PinDrawIcon,
        },
        {
          name: "5 · Fix",
          blurb: "Planted, a beat, then it takes a fix. The showcase.",
          Component: PinFixIcon,
        },
        {
          name: "6 · Plant",
          blurb: "1 + 3: rears back, drives down, and the impact rocks it.",
          Component: PinPlantIcon,
        },
      ]}
    />
  );
}
